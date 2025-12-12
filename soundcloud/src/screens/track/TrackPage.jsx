import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchTrack, likeTrack, unlikeTrack, followArtist, unfollowArtist } from "../../api/track";
import AddToPlaylistModal from "../../components/AddToPlaylistModal.jsx";
import { usePlayer } from "../../context/PlayerContext";
import useBreakpoint from "../../hooks/useBreakpoint";

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--:--";
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const TrackPage = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const numericId = Number(trackId);

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const {
    playTrack,
    togglePlay,
    currentTrack,
    isPlaying,
    likeCurrentTrack,
    followCurrentArtist,
    likeInFlight,
    followInFlight
  } = usePlayer();

  const isMobile = useBreakpoint(768);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setError("Track not found");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadTrack = async () => {
      setLoading(true);
      setError("");
      setActionError("");
      setActionMessage("");
      try {
        const data = await fetchTrack(numericId);
        if (!cancelled) {
          setTrack(data);
        }
      } catch (err) {
        console.error("Failed to fetch track", err);
        if (!cancelled) {
          setError(err?.response?.data ?? err?.message ?? "Unable to load track");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTrack();

    return () => {
      cancelled = true;
    };
  }, [numericId]);

  useEffect(() => {
    if (!currentTrack) {
      return;
    }
    setTrack((prev) => {
      if (!prev || prev.id !== currentTrack.id) {
        return prev;
      }
      return {
        ...prev,
        isLiked: currentTrack.isLiked,
        likesCount: currentTrack.likesCount,
        isFollowing: currentTrack.isFollowing,
        coverUrl: currentTrack.coverUrl ?? prev.coverUrl
      };
    });
  }, [currentTrack]);

  const artistDisplayName = useMemo(() => {
    if (!track?.artist) return "";
    return track.artist.fullName ?? track.artist.username ?? "";
  }, [track]);
  const artistUsername = track?.artist?.username ?? null;

  const handleOpenArtistProfile = () => {
    if (!artistUsername) {
      return;
    }
    navigate(`/profile/${artistUsername}`);
  };

  const isCurrent = currentTrack?.id === track?.id;
  const isTrackPlaying = isCurrent && isPlaying;
  const effectiveLikeLoading = likeLoading || (isCurrent && likeInFlight);
  const effectiveFollowLoading = followLoading || (isCurrent && followInFlight);
  const handlePlay = async () => {
    if (!track) {
      return;
    }

    setActionError("");
    setActionMessage("");

    if (isCurrent) {
      try {
        await togglePlay();
      } catch (err) {
        console.error("Failed to toggle playback", err);
        setActionError(err?.message ?? "Unable to control playback");
        setActionMessage("");
      }
      return;
    }

    try {
      await playTrack(
        {
          id: track.id,
          title: track.title,
          artistName: artistDisplayName,
          artistId: track.artist?.id ?? null,
          audioUrl: track.audioUrl,
          durationSeconds: track.durationSeconds
        },
        {
          queue: [
            {
              id: track.id,
              title: track.title,
              artistName: artistDisplayName,
              artistId: track.artist?.id ?? null,
              audioUrl: track.audioUrl,
              coverUrl: track.coverUrl,
              durationSeconds: track.durationSeconds
            }
          ]
        }
      );
    } catch (err) {
      console.error("Failed to start playback", err);
      setActionError(err?.message ?? "Unable to start playback");
      setActionMessage("");
    }
  };

  const handleLike = async () => {
    if (!track) return;
    setActionError("");
    setActionMessage("");
    if (isCurrent) {
      try {
        await likeCurrentTrack();
      } catch (err) {
        setActionError(err?.message ?? "Unable to update like");
      }
      return;
    }

    setLikeLoading(true);
    try {
      if (track.isLiked) {
        await unlikeTrack(track.id);
        setTrack((prev) => prev ? { ...prev, isLiked: false, likesCount: Math.max(0, (prev.likesCount ?? 0) - 1) } : prev);
      } else {
        await likeTrack(track.id);
        setTrack((prev) => prev ? { ...prev, isLiked: true, likesCount: (prev.likesCount ?? 0) + 1 } : prev);
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
      setActionError(err?.message ?? "Unable to update like");
      setActionMessage("");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!track?.artist?.id) return;
    setActionError("");
    setActionMessage("");
    if (isCurrent) {
      try {
        await followCurrentArtist();
      } catch (err) {
        setActionError(err?.message ?? "Unable to update follow");
      }
      return;
    }

    setFollowLoading(true);
    try {
      if (track.isFollowing) {
        await unfollowArtist(track.artist.id);
        setTrack((prev) => prev ? { ...prev, isFollowing: false } : prev);
      } else {
        await followArtist(track.artist.id);
        setTrack((prev) => prev ? { ...prev, isFollowing: true } : prev);
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
      setActionError(err?.message ?? "Unable to update follow");
      setActionMessage("");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAddToPlaylist = () => {
    if (!track) {
      return;
    }
    setActionError("");
    setActionMessage("");
    setShowAddModal(true);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#141414",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header />
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "72px 16px 280px" : "96px 24px 240px",
        boxSizing: "border-box"
      }}>
        <div style={{
          width: "100%",
          maxWidth: isMobile ? 640 : 960,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 20 : 24
        }}>
          {loading && (
            <div style={{ color: "#bbb" }}>Loading track…</div>
          )}
          {!loading && error && (
            <div style={{ color: "#ff8a8a", marginBottom: 16 }}>{error}</div>
          )}
          {!loading && !error && track && (
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 24 }}>
              <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 20 : 24,
                width: "100%"
              }}>
                <div style={{
                  width: isMobile ? "100%" : 200,
                  maxWidth: isMobile ? "100%" : 220,
                  aspectRatio: "1 / 1",
                  borderRadius: 16,
                  background: "#1f1f1f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontSize: 48,
                  fontWeight: 600,
                  overflow: "hidden"
                }}>
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={`${track.title} cover`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>♪</span>
                  )}
                </div>
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? 20 : 16,
                  width: "100%"
                }}>
                  <div>
                    <h1 style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: isMobile ? 26 : 32,
                      lineHeight: 1.2,
                      wordBreak: "break-word"
                    }}>{track.title}</h1>
                    <button
                      type="button"
                      onClick={handleOpenArtistProfile}
                      disabled={!artistUsername}
                      style={{
                        background: "none",
                        border: "none",
                        color: artistUsername ? "#f0f0f0" : "#ccc",
                        fontSize: 16,
                        marginTop: 4,
                        padding: 0,
                        textAlign: "left",
                        cursor: artistUsername ? "pointer" : "default",
                        textDecoration: artistUsername ? "underline" : "none",
                        textUnderlineOffset: 4
                      }}
                    >
                      {artistDisplayName || "Unknown artist"}
                    </button>
                  </div>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    width: "100%"
                  }}>
                    <button
                      type="button"
                      onClick={handlePlay}
                      style={{
                        background: "#ff5500",
                        color: "#fff",
                        border: "none",
                        borderRadius: 999,
                        padding: isMobile ? "12px 24px" : "10px 28px",
                        fontWeight: 600,
                        cursor: "pointer",
                        flex: isMobile ? "1 1 100%" : "0 0 auto",
                        minWidth: isMobile ? "100%" : "auto",
                        textAlign: "center"
                      }}
                    >
                      {isTrackPlaying ? "Pause" : isCurrent ? "Resume" : "Play"}
                    </button>
                    <button
                      type="button"
                      onClick={handleLike}
                      disabled={effectiveLikeLoading}
                      style={{
                        background: "#232323",
                        color: track.isLiked ? "#ff5500" : "#fff",
                        border: "1px solid #2f2f2f",
                        borderRadius: 999,
                        padding: isMobile ? "12px 16px" : "10px 20px",
                        fontWeight: 600,
                        cursor: effectiveLikeLoading ? "wait" : "pointer",
                        flex: isMobile ? "1 1 calc(50% - 12px)" : "0 0 auto",
                        minWidth: isMobile ? "calc(50% - 12px)" : "auto",
                        textAlign: "center"
                      }}
                    >
                      {track.isLiked ? "Unlike" : "Like"}
                    </button>
                    <button
                      type="button"
                      onClick={handleFollow}
                      disabled={effectiveFollowLoading}
                      style={{
                        background: "#232323",
                        color: track.isFollowing ? "#ff5500" : "#fff",
                        border: "1px solid #2f2f2f",
                        borderRadius: 999,
                        padding: isMobile ? "12px 16px" : "10px 20px",
                        fontWeight: 600,
                        cursor: effectiveFollowLoading ? "wait" : "pointer",
                        flex: isMobile ? "1 1 calc(50% - 12px)" : "0 0 auto",
                        minWidth: isMobile ? "calc(50% - 12px)" : "auto",
                        textAlign: "center"
                      }}
                    >
                      {track.isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToPlaylist}
                      style={{
                        background: "#232323",
                        color: "#fff",
                        border: "1px solid #2f2f2f",
                        borderRadius: 999,
                        padding: isMobile ? "12px 16px" : "10px 20px",
                        fontWeight: 600,
                        cursor: "pointer",
                        flex: isMobile ? "1 1 calc(50% - 12px)" : "0 0 auto",
                        minWidth: isMobile ? "calc(50% - 12px)" : "auto",
                        textAlign: "center"
                      }}
                    >
                      Add to playlist
                    </button>
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 12 : 24,
                flexWrap: "wrap"
              }}>
                <div style={{
                  flex: isMobile ? "0 0 auto" : "1 1 240px",
                  width: isMobile ? "100%" : undefined,
                  background: "#1a1a1a",
                  padding: isMobile ? "8px 12px" : "14px 18px",
                  borderRadius: isMobile ? 10 : 16
                }}>
                  <div style={{ color: "#8a8a8a", fontSize: isMobile ? 11 : 11, letterSpacing: 0.45, textTransform: "uppercase" }}>Duration</div>
                  <div style={{ color: "#fff", fontSize: isMobile ? 15 : 16, fontWeight: 500 }}>{formatDuration(track.durationSeconds)}</div>
                </div>
                <div style={{
                  flex: isMobile ? "0 0 auto" : "1 1 240px",
                  width: isMobile ? "100%" : undefined,
                  background: "#1a1a1a",
                  padding: isMobile ? "8px 12px" : "14px 18px",
                  borderRadius: isMobile ? 10 : 16
                }}>
                  <div style={{ color: "#8a8a8a", fontSize: isMobile ? 11 : 11, letterSpacing: 0.45, textTransform: "uppercase" }}>Plays</div>
                  <div style={{ color: "#fff", fontSize: isMobile ? 15 : 16, fontWeight: 500 }}>{track.playsCount ?? 0}</div>
                </div>
                <div style={{
                  flex: isMobile ? "0 0 auto" : "1 1 240px",
                  width: isMobile ? "100%" : undefined,
                  background: "#1a1a1a",
                  padding: isMobile ? "8px 12px" : "14px 18px",
                  borderRadius: isMobile ? 10 : 16
                }}>
                  <div style={{ color: "#8a8a8a", fontSize: isMobile ? 11 : 11, letterSpacing: 0.45, textTransform: "uppercase" }}>Likes</div>
                  <div style={{ color: "#fff", fontSize: isMobile ? 15 : 16, fontWeight: 500 }}>{track.likesCount ?? 0}</div>
                </div>
              </div>
              {track.description && (
                <div style={{
                  background: "#1a1a1a",
                  padding: "20px",
                  borderRadius: 16
                }}>
                  <div style={{ color: "#888", fontSize: 12, letterSpacing: 0.6, marginBottom: 8 }}>Description</div>
                  <p style={{ color: "#ddd", lineHeight: 1.6, margin: 0 }}>{track.description}</p>
                </div>
              )}
              {actionMessage && (
                <div style={{ color: "#66e0a3" }}>{actionMessage}</div>
              )}
              {actionError && (
                <div style={{ color: "#ff8a8a" }}>{actionError}</div>
              )}
            </div>
          )}
        </div>
      </main>
      <div style={{ height: isMobile ? 220 : 100, flexShrink: 0 }} />
      <Footer />
      <AddToPlaylistModal
        open={showAddModal}
        trackId={track?.id}
        onClose={() => setShowAddModal(false)}
        onAdded={(playlist) => {
          setActionMessage(`Track saved to "${playlist?.title ?? "playlist"}".`);
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default TrackPage;
