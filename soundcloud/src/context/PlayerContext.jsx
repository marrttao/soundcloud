import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchTrack,
  likeTrack as apiLikeTrack,
  unlikeTrack as apiUnlikeTrack,
  followArtist as apiFollowArtist,
  unfollowArtist as apiUnfollowArtist,
  markTrackPlayed
} from "../api/track";

const PlayerContext = createContext(null);

const initialState = {
  queue: [],
  currentIndex: -1,
  currentTrack: null,
  isPlaying: false,
  isBuffering: false,
  shuffle: false,
  repeatMode: "off",
  progress: 0,
  duration: 0,
  error: null,
  likeInFlight: false,
  followInFlight: false,
  volume: 1
};

const normalizeDescriptor = (candidate) => {
  if (!candidate) {
    throw new Error("Track descriptor is required");
  }

  if (typeof candidate === "number") {
    return { id: candidate };
  }

  const id = candidate.id ?? candidate.trackId;
  if (typeof id !== "number") {
    throw new Error("Track descriptor must include a numeric id");
  }

  const artist = candidate.artist ?? candidate.artistName;
  const artistName = typeof artist === "string"
    ? artist
    : artist?.fullName ?? artist?.username ?? "";

  const artistId = candidate.artistId ?? artist?.id ?? null;

  return {
    id,
    title: candidate.title ?? "",
    artistName,
    artistId,
    audioUrl: candidate.audioUrl ?? null,
    coverUrl: candidate.coverUrl ?? candidate.artworkUrl ?? null,
    artworkUrl: candidate.artworkUrl ?? candidate.coverUrl ?? null,
    durationSeconds: candidate.durationSeconds ?? candidate.duration ?? null
  };
};

const dedupeQueue = (items) => {
  const seen = new Set();
  const queue = [];
  items.forEach((item) => {
    try {
      const normalized = normalizeDescriptor(item);
      if (!seen.has(normalized.id)) {
        seen.add(normalized.id);
        queue.push(normalized);
      }
    } catch (error) {
      console.error("Skipping invalid queue item", error);
    }
  });
  return queue;
};

export const PlayerProvider = ({ children }) => {
  const [audio] = useState(() => {
    const element = new Audio();
    element.preload = "metadata";
    element.crossOrigin = "anonymous";
    return element;
  });

  const stateRef = useRef(initialState);
  const [state, setState] = useState(initialState);

  const setPlayerState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, [setState]);

  const updateProgress = useCallback(() => {
    const current = stateRef.current;
    if (!current.currentTrack) {
      return;
    }
    setPlayerState((prev) => ({
      ...prev,
      progress: audio.currentTime,
      duration: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : prev.duration
    }));
  }, [audio, setPlayerState]);

  const loadTrackAtIndex = useCallback(async (index) => {
    const snapshot = stateRef.current;
    const queueItem = snapshot.queue[index];
    if (!queueItem) {
      return;
    }

    setPlayerState((prev) => ({
      ...prev,
      currentIndex: index,
      isBuffering: true,
      error: null,
      progress: 0
    }));

    try {
      const detail = await fetchTrack(queueItem.id);

      if (!detail?.audioUrl) {
        throw new Error("Track is missing audioUrl");
      }

      if (audio.src !== detail.audioUrl) {
        audio.src = detail.audioUrl;
      }

      audio.currentTime = 0;

      const artistDisplayName = detail.artist?.fullName ?? detail.artist?.username ?? "";

      const coverUrl = detail.coverUrl ?? detail.artist?.avatarUrl ?? queueItem.coverUrl ?? queueItem.artworkUrl ?? null;

      const updatedQueue = snapshot.queue.map((item, idx) =>
        idx === index
          ? {
              ...item,
              title: detail.title,
              artistName: artistDisplayName,
              artistId: detail.artist?.id ?? item.artistId,
              audioUrl: detail.audioUrl,
              durationSeconds: detail.durationSeconds ?? item.durationSeconds,
              coverUrl,
              artworkUrl: coverUrl
            }
          : item
      );

      setPlayerState((prev) => ({
        ...prev,
        queue: updatedQueue,
        currentIndex: index,
        currentTrack: {
          id: detail.id,
          title: detail.title,
          description: detail.description,
          audioUrl: detail.audioUrl,
          coverUrl,
          artworkUrl: coverUrl,
          waveformData: detail.waveformData,
          durationSeconds: detail.durationSeconds,
          playsCount: detail.playsCount,
          likesCount: detail.likesCount,
          isPrivate: detail.isPrivate,
          createdAt: detail.createdAt,
          uploadedAt: detail.uploadedAt,
          artist: {
            id: detail.artist?.id ?? updatedQueue[index].artistId ?? null,
            username: detail.artist?.username ?? "",
            fullName: detail.artist?.fullName ?? null,
            avatarUrl: detail.artist?.avatarUrl ?? null,
            displayName: artistDisplayName
          },
          isLiked: detail.isLiked,
          isFollowing: detail.isFollowing
        },
        duration: detail.durationSeconds ?? (Number.isFinite(audio.duration) ? audio.duration : 0),
        progress: 0,
        isBuffering: false,
        error: null
      }));

      await audio.play();
      markTrackPlayed(detail.id).catch((err) => {
        console.warn("Failed to persist listening history", err);
      });
    } catch (error) {
      console.error("Failed to play track", error);
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        isBuffering: false,
        error: error instanceof Error ? error.message : "Unable to play track"
      }));
    }
  }, [audio, setPlayerState]);

  const playTrack = useCallback(async (descriptor, options = {}) => {
    const normalized = normalizeDescriptor(descriptor);
    const providedQueue = options.queue ? dedupeQueue(options.queue) : [];

    const needsPrepend = providedQueue.length && !providedQueue.some((item) => item.id === normalized.id);
    const baseQueue = providedQueue.length ? providedQueue : [normalized];
    const normalizedQueue = needsPrepend ? dedupeQueue([normalized, ...providedQueue]) : baseQueue;
    const targetIndex = normalizedQueue.findIndex((item) => item.id === normalized.id);
    const startIndex = options.startIndex ?? (targetIndex >= 0 ? targetIndex : 0);

    setPlayerState((prev) => ({
      ...prev,
      queue: normalizedQueue,
      currentIndex: startIndex,
      isPlaying: true,
      isBuffering: true,
      progress: 0,
      duration: normalized.durationSeconds ?? prev.duration,
      error: null
    }));

    await loadTrackAtIndex(startIndex);
  }, [loadTrackAtIndex, setPlayerState]);

  const togglePlay = useCallback(async () => {
    const snapshot = stateRef.current;
    if (!snapshot.currentTrack) {
      return;
    }

    if (audio.paused) {
      try {
        setPlayerState((prev) => ({ ...prev, isBuffering: true }));
        await audio.play();
      } catch (error) {
        console.error("Failed to resume playback", error);
        setPlayerState((prev) => ({ ...prev, isBuffering: false }));
      }
    } else {
      audio.pause();
    }
  }, [audio, setPlayerState]);

  const seek = useCallback((seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return;
    }
    const duration = Number.isFinite(audio.duration) ? audio.duration : stateRef.current.duration;
    const clamped = Math.max(0, Math.min(seconds, duration || 0));
    audio.currentTime = clamped;
    setPlayerState((prev) => ({ ...prev, progress: clamped }));
  }, [audio, setPlayerState]);

  const setVolume = useCallback((nextVolume) => {
    if (!Number.isFinite(nextVolume)) {
      return;
    }
    const clamped = Math.min(Math.max(nextVolume, 0), 1);
    audio.volume = clamped;
    setPlayerState((prev) => ({ ...prev, volume: clamped }));
  }, [audio, setPlayerState]);

  const resolveNextIndex = useCallback((direction) => {
    const snapshot = stateRef.current;
    const { queue, currentIndex, shuffle, repeatMode } = snapshot;
    if (!queue.length) {
      return -1;
    }

    if (shuffle && queue.length > 1) {
      let nextIndex = currentIndex;
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      return nextIndex;
    }

    const tentative = currentIndex + direction;
    if (tentative >= 0 && tentative < queue.length) {
      return tentative;
    }

    if (repeatMode === "all") {
      return direction > 0 ? 0 : queue.length - 1;
    }

    return -1;
  }, []);

  const next = useCallback(async () => {
    const nextIndex = resolveNextIndex(1);
    if (nextIndex === -1) {
      audio.pause();
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }
    await loadTrackAtIndex(nextIndex);
  }, [audio, loadTrackAtIndex, resolveNextIndex, setPlayerState]);

  const previous = useCallback(async () => {
    if (audio.currentTime > 3) {
      seek(0);
      return;
    }
    const prevIndex = resolveNextIndex(-1);
    if (prevIndex === -1) {
      seek(0);
      return;
    }
    await loadTrackAtIndex(prevIndex);
  }, [audio, loadTrackAtIndex, resolveNextIndex, seek]);

  const toggleShuffle = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, [setPlayerState]);

  const cycleRepeat = useCallback(() => {
    setPlayerState((prev) => {
      const order = ["off", "all", "one"];
      const current = prev.repeatMode ?? "off";
      const nextIndex = (order.indexOf(current) + 1) % order.length;
      return { ...prev, repeatMode: order[nextIndex] };
    });
  }, [setPlayerState]);

  const handleEnded = useCallback(async () => {
    const snapshot = stateRef.current;
    if (!snapshot.currentTrack) {
      return;
    }

    if (snapshot.repeatMode === "one") {
      seek(0);
      try {
        await audio.play();
      } catch (error) {
        console.error("Failed to loop track", error);
      }
      return;
    }

    const nextIndex = resolveNextIndex(1);
    if (nextIndex === -1) {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }

    await loadTrackAtIndex(nextIndex);
  }, [audio, loadTrackAtIndex, resolveNextIndex, seek, setPlayerState]);

  const likeCurrentTrack = useCallback(async () => {
    const snapshot = stateRef.current;
    const { currentTrack } = snapshot;
    if (!currentTrack) {
      return;
    }

    setPlayerState((prev) => ({ ...prev, likeInFlight: true }));

    const targetLiked = !currentTrack.isLiked;

    try {
      if (targetLiked) {
        await apiLikeTrack(currentTrack.id);
      } else {
        await apiUnlikeTrack(currentTrack.id);
      }

      setPlayerState((prev) => {
        if (!prev.currentTrack || prev.currentTrack.id !== currentTrack.id) {
          return { ...prev, likeInFlight: false };
        }
        const likesCount = Math.max(
          0,
          (prev.currentTrack.likesCount ?? 0) + (targetLiked ? 1 : -1)
        );
        return {
          ...prev,
          likeInFlight: false,
          currentTrack: {
            ...prev.currentTrack,
            isLiked: targetLiked,
            likesCount
          }
        };
      });
    } catch (error) {
      console.error("Failed to toggle like", error);
      setPlayerState((prev) => ({ ...prev, likeInFlight: false }));
      throw error;
    }
  }, [setPlayerState]);

  const followCurrentArtist = useCallback(async () => {
    const snapshot = stateRef.current;
    const { currentTrack } = snapshot;
    if (!currentTrack?.artist?.id) {
      return;
    }

    const artistId = currentTrack.artist.id;
    const targetFollowing = !currentTrack.isFollowing;

    setPlayerState((prev) => ({ ...prev, followInFlight: true }));

    try {
      if (targetFollowing) {
        await apiFollowArtist(artistId);
      } else {
        await apiUnfollowArtist(artistId);
      }

      setPlayerState((prev) => {
        if (!prev.currentTrack || prev.currentTrack.artist?.id !== artistId) {
          return { ...prev, followInFlight: false };
        }
        return {
          ...prev,
          followInFlight: false,
          currentTrack: {
            ...prev.currentTrack,
            isFollowing: targetFollowing
          }
        };
      });
    } catch (error) {
      console.error("Failed to toggle follow", error);
      setPlayerState((prev) => ({ ...prev, followInFlight: false }));
      throw error;
    }
  }, [setPlayerState]);

  useEffect(() => {
    const handlePlay = () => setPlayerState((prev) => ({ ...prev, isPlaying: true, isBuffering: false }));
    const handlePause = () => setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    const handleWaiting = () => setPlayerState((prev) => ({ ...prev, isBuffering: true }));
    const handleCanPlay = () => setPlayerState((prev) => ({ ...prev, isBuffering: false }));

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audio, handleEnded, setPlayerState, updateProgress]);

  useEffect(() => {
    audio.volume = state.volume;
  }, [audio, state.volume]);

  const value = useMemo(() => ({
    ...state,
    playTrack,
    togglePlay,
    seek,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
    likeCurrentTrack,
    followCurrentArtist,
    setVolume
  }), [state, playTrack, togglePlay, seek, next, previous, toggleShuffle, cycleRepeat, likeCurrentTrack, followCurrentArtist, setVolume]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
