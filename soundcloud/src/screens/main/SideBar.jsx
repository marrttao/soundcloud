import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import { fetchHomeSidebar } from "../../api/home";
import { followArtist, unfollowArtist } from "../../api/track";

const FALLBACK_AVATAR = "https://i.imgur.com/6unG5jv.png";
const PERSON_ICON = "\u{1F464}\uFE0E";
const MUSIC_NOTE_ICON = "\u{1F3B5}\uFE0E";
const METRIC_ICON_COLOR = "#fff";

const coerceNumber = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toCamelKey = (key) => key
  .replace(/[_-](\w)/g, (_, char) => char.toUpperCase())
  .replace(/^[A-Z]/, (char) => char.toLowerCase());

const deepCamel = (input) => {
  if (Array.isArray(input)) {
    return input.map(deepCamel);
  }

  if (!input || typeof input !== "object") {
    return input;
  }

  return Object.entries(input).reduce((acc, [key, value]) => {
    const camelKey = typeof key === "string" ? toCamelKey(key) : key;
    acc[camelKey] = deepCamel(value);
    return acc;
  }, {});
};

const normalizeTrackSummary = (track = {}) => {
  if (!track || typeof track !== "object") {
    return {
      trackId: null,
      title: "",
      plays: 0,
      likes: 0,
      artist: "",
      artistId: null,
      artistAvatar: null,
      coverUrl: null,
      audioUrl: null,
      durationSeconds: null,
      playedAt: null
    };
  }

  const trackId = track.trackId ?? track.track_id ?? track.TrackId ?? track.Track_id ?? track.id ?? null;
  const plays = track.plays ?? track.playsCount ?? track.plays_count ?? track.Plays ?? track.PlaysCount ?? track.Plays_count;
  const likes = track.likes ?? track.likesCount ?? track.likes_count ?? track.Likes ?? track.LikesCount ?? track.Likes_count;
  const artistId = track.artistId ?? track.artist_id ?? track.ArtistId ?? track.Artist_id ?? null;

  return {
    trackId,
    title: track.title ?? track.Title ?? "",
    plays: coerceNumber(plays, 0),
    likes: coerceNumber(likes, 0),
    artist: track.artist ?? track.Artist ?? "",
    artistId,
    artistAvatar: track.artistAvatar ?? track.artist_avatar ?? track.ArtistAvatar ?? track.Artist_avatar ?? null,
    coverUrl: track.coverUrl ?? track.cover_url ?? track.CoverUrl ?? track.Cover_url ?? null,
    audioUrl: track.audioUrl ?? track.audio_url ?? track.AudioUrl ?? track.Audio_url ?? null,
    durationSeconds: track.durationSeconds ?? track.duration_seconds ?? track.DurationSeconds ?? track.Duration_seconds ?? null,
    playedAt: track.playedAt ?? track.played_at ?? track.PlayedAt ?? track.Played_at ?? null
  };
};

const normalizeRecommendedArtist = (artist = {}) => {
  if (!artist || typeof artist !== "object") {
    return {
      id: null,
      displayName: "",
      username: "",
      avatarUrl: null,
      followers: 0,
      tracks: 0,
      isFollowing: false
    };
  }

  const followers = artist.followers ?? artist.Followers;
  const tracks = artist.tracks ?? artist.Tracks;

  return {
    id: artist.id ?? artist.Id ?? null,
    displayName: artist.displayName ?? artist.DisplayName ?? artist.username ?? artist.Username ?? "",
    username: artist.username ?? artist.Username ?? "",
    avatarUrl: artist.avatarUrl ?? artist.AvatarUrl ?? null,
    followers: coerceNumber(followers, 0),
    tracks: coerceNumber(tracks, 0),
    isFollowing: Boolean(artist.isFollowing ?? artist.IsFollowing)
  };
};

const formatCount = (value = 0) => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
};

const formatRelativeTime = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
};

const TrackList = ({ title, tracks = [], loading = false, emptyMessage, showPlayedAt = false, viewAllPath }) => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const queueDescriptors = useMemo(() => (
    tracks.map((track) => ({
      id: track.trackId,
      title: track.title,
      artistName: track.artist,
      artistId: track.artistId ?? null,
      durationSeconds: track.durationSeconds ?? null
    }))
  ), [tracks]);

  const handlePlay = (index) => async () => {
    const descriptor = queueDescriptors[index];
    if (!descriptor?.id) {
      return;
    }
    try {
      await playTrack(descriptor, { queue: queueDescriptors });
    } catch (error) {
      console.error("Failed to start playback", error);
    }
  };

  const handleViewAll = useCallback(() => {
    if (viewAllPath) {
      navigate(viewAllPath);
    }
  }, [navigate, viewAllPath]);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>{title}</span>
        <button
          type="button"
          onClick={handleViewAll}
          disabled={!viewAllPath}
          style={{
          background: "none",
          border: "none",
          color: viewAllPath ? "#bbb" : "#555",
          fontSize: 13,
          cursor: viewAllPath ? "pointer" : "default",
          fontWeight: 500
        }}
        >
          View all
        </button>
      </div>
      <div>
        {loading ? (
          <p style={{ color: "#777", fontSize: 13 }}>Loading…</p>
        ) : (tracks?.length ? tracks.map((track, idx) => (
          <div key={`${track.trackId ?? track.title}-${idx}`} style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 18,
            gap: 12
          }}>
            <button
              type="button"
              onClick={handlePlay(idx)}
              disabled={!track.trackId}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #2f2f2f",
                background: "#1f1f1f",
                color: "#fff",
                cursor: track.trackId ? "pointer" : "not-allowed",
                opacity: track.trackId ? 1 : 0.5
              }}
            >
              ▶
            </button>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: "#222",
              overflow: "hidden"
            }}>
              <img
                src={track.coverUrl ?? track.artistAvatar ?? FALLBACK_AVATAR}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{ flex: 1, cursor: "pointer" }}
              onClick={() => track.trackId && navigate(`/tracks/${track.trackId}`)}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{track.artist}</div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{track.title}</div>
              <div style={{ display: "flex", gap: 12, color: "#bbb", fontSize: 12 }}>
                <span>▶ {formatCount(track.plays)}</span>
                <span>♥ {formatCount(track.likes)}</span>
                {showPlayedAt && track.playedAt && (
                  <span>{formatRelativeTime(track.playedAt)}</span>
                )}
              </div>
            </div>
          </div>
        )) : (
          <p style={{ color: "#777", fontSize: 13 }}>{emptyMessage ?? "Nothing to show yet."}</p>
        ))}
      </div>
    </div>
  );
};

const SideBar = () => {
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [likes, setLikes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(() => new Set());

  const loadSidebar = useCallback(async () => {
    setLoading(true);
    try {
      const rawData = await fetchHomeSidebar();
      const data = deepCamel(rawData ?? {});

      const recommendedArtists = Array.isArray(data?.recommended)
        ? data.recommended.map(normalizeRecommendedArtist)
        : [];
      const likedTracks = Array.isArray(data?.likes)
        ? data.likes.map(normalizeTrackSummary)
        : [];
      const historyTracks = Array.isArray(data?.history)
        ? data.history.map(normalizeTrackSummary)
        : [];

      setRecommended(recommendedArtists);
      setLikes(likedTracks);
      setHistory(historyTracks);
    } catch (error) {
      console.error("Failed to load sidebar data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSidebar();
  }, [loadSidebar]);

  const handleRefresh = () => {
    if (!loading) {
      loadSidebar();
    }
  };

  const handleToggleFollow = useCallback(async (artistId, shouldFollow) => {
    if (!artistId) {
      return;
    }

    setFollowBusy((prev) => {
      const next = new Set(prev);
      next.add(artistId);
      return next;
    });

    try {
      if (shouldFollow) {
        await followArtist(artistId);
      } else {
        await unfollowArtist(artistId);
      }

      setRecommended((prev) => prev.map((artist) => {
        if (artist.id !== artistId) {
          return artist;
        }
        const currentFollowers = typeof artist.followers === "number" ? artist.followers : 0;
        const followerDelta = shouldFollow ? 1 : -1;
        return {
          ...artist,
          isFollowing: shouldFollow,
          followers: Math.max(0, currentFollowers + followerDelta)
        };
      }));
    } catch (error) {
      console.error("Failed to toggle follow state", error);
    } finally {
      setFollowBusy((prev) => {
        const next = new Set(prev);
        next.delete(artistId);
        return next;
      });
    }
  }, []);

  const busySet = followBusy;

  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        right: "calc(50% - 620px)",
        width: 360,
        height: "calc(100vh - 112px)",
        background: "#141414",
        color: "#fff",
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: 1100,
        paddingBottom: 56
      }}
    >
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>ARTISTS YOU SHOULD FOLLOW</span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: loading ? "#555" : "#bbb",
              fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500
            }}
          >
            Refresh list
          </button>
        </div>
        <div>
          {loading && recommended.length === 0 ? (
            <p style={{ color: "#777", fontSize: 13 }}>Loading…</p>
          ) : (recommended.length ? recommended.map((artist) => {
            const isFollowing = Boolean(artist.isFollowing);
            const isBusy = busySet instanceof Set ? busySet.has(artist.id) : false;

            const handleToggle = () => {
              if (artist.id) {
                handleToggleFollow(artist.id, !isFollowing);
              }
            };

            return (
              <div key={artist.id} style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 18
              }}>
                <img
                  src={artist.avatarUrl ?? FALLBACK_AVATAR}
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: 16,
                    background: "#222"
                  }}
                />
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => navigate(`/profile/${artist.username}`)}
                >
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{artist.displayName}</div>
                  <div style={{ color: "#777", fontSize: 12 }}>@{artist.username}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span style={{ color: "#bbb", fontSize: 13 }}>
                      <span style={{ marginRight: 3, color: METRIC_ICON_COLOR }}>{PERSON_ICON}</span>
                      {formatCount(artist.followers)}
                    </span>
                    <span style={{ color: "#bbb", fontSize: 13 }}>
                      <span style={{ marginRight: 3, color: METRIC_ICON_COLOR }}>{MUSIC_NOTE_ICON}</span>
                      {formatCount(artist.tracks)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={isBusy}
                  style={{
                    background: isFollowing ? "#2c2c2c" : "#fff",
                    color: isFollowing ? "#fff" : "#181818",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "7px 20px",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    marginLeft: 16,
                    opacity: isBusy ? 0.6 : 1
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          }) : (
            <p style={{ color: "#777", fontSize: 13 }}>No suggestions right now.</p>
          ))}
        </div>
        <TrackList
          title={`${likes.length} LIKES`}
          tracks={likes}
          loading={loading && likes.length === 0}
          emptyMessage="You haven't liked any tracks yet."
          viewAllPath="/library?tab=likes"
        />
        <TrackList
          title="LISTENING HISTORY"
          tracks={history}
          loading={loading && history.length === 0}
          showPlayedAt
          emptyMessage="Play something to see it here."
          viewAllPath="/library?tab=history"
        />
      </div>
      <div style={{
        padding: "24px 20px",
        borderTop: "1px solid #222",
        marginTop: 0
      }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18 }}>GO MOBILE</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <a href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="App Store" style={{ height: 40 }} />
          </a>
          <a href="https://play.google.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: 40 }} />
          </a>
        </div>
        <div style={{ color: "#bbb", fontSize: 13, marginBottom: 18, lineHeight: "22px" }}>
          Legal · Privacy · Cookie Policy · Cookie Manager · Imprint · Artist Resources · Newsroom · Charts · Transparency Reports
        </div>
        <div style={{ color: "#bbb", fontSize: 13 }}>
          Language: <span style={{ color: "#fff" }}>English (US)</span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;