import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updatePlaylist, fetchPlaylistDetail, likePlaylist, unlikePlaylist } from "../../api/playlist";
import { fetchProfile } from "../../api/profile";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { usePlayer } from "../../context/PlayerContext";

const FALLBACK_PLAYLIST_COVER = "https://i.imgur.com/6unG5jv.png";

const formatClock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--:--";
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatRuntime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0 min";
  }
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const pieces = [];
  if (hours) {
    pieces.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  }
  if (minutes || !pieces.length) {
    pieces.push(`${minutes} min`);
  }
  return pieces.join(" ");
};

const formatRelativeDate = (isoValue) => {
  if (!isoValue) {
    return null;
  }
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const diff = Date.now() - date.getTime();
  if (diff < 0) {
    return null;
  }
  const units = [
    { label: "year", milliseconds: 365 * 24 * 60 * 60 * 1000 },
    { label: "month", milliseconds: 30 * 24 * 60 * 60 * 1000 },
    { label: "day", milliseconds: 24 * 60 * 60 * 1000 }
  ];
  for (const unit of units) {
    const value = Math.floor(diff / unit.milliseconds);
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
    }
  }
  const hours = Math.floor(diff / (60 * 60 * 1000));
  if (hours >= 1) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  const minutes = Math.max(1, Math.floor(diff / (60 * 1000)));
  return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
};

const formatCount = (value = 0) => {
  if (!Number.isFinite(value) || value < 0) {
    return "0";
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
};

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [owner, setOwner] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPayload, setEditPayload] = useState({ title: "", description: "", isPrivate: false });
  const [isOwner, setIsOwner] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { playTrack, currentTrack, togglePlay, isPlaying } = usePlayer();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        setAvatarUrl(profile?.profile?.avatar_url ?? null);
      } catch (err) {
        console.error("Failed to load current profile", err);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!playlistId) {
      setError("Playlist not found");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setActionError("");
      setActionMessage("");
      try {
        const detail = await fetchPlaylistDetail(playlistId);
        if (!cancelled) {
          const summary = detail?.playlist ?? null;
          setPlaylist(summary);
          setOwner(detail?.owner ?? null);
          setTracks(Array.isArray(detail?.tracks) ? detail.tracks : []);
          if (summary) {
            setEditPayload({
              title: summary.title ?? "",
              description: summary.description ?? "",
              isPrivate: summary.isPrivate ?? false
            });
          }
          setIsOwner(Boolean(detail?.isOwner));
          setIsLiked(Boolean(detail?.isLiked));
          setLikesCount(summary?.likesCount ?? 0);
        }
      } catch (err) {
        console.error("Failed to fetch playlist", err);
        if (!cancelled) {
          setError(err?.response?.data ?? err?.message ?? "Unable to load playlist");
          setIsLiked(false);
          setLikesCount(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  useEffect(() => {
    if (!showEditModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowEditModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showEditModal]);
  const handleToggleEditModal = () => {
    if (!playlist) {
      return;
    }
    setEditPayload({
      title: playlist.title ?? "",
      description: playlist.description ?? "",
      isPrivate: playlist.isPrivate ?? false
    });
    setShowEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditPayload((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!playlistId) {
      return;
    }

    setActionError("");
    setActionMessage("");
    try {
      const trimmedTitle = editPayload.title?.trim();
      const trimmedDescription = editPayload.description?.trim();
      const payload = {
        title: trimmedTitle || undefined,
        description: trimmedDescription === "" ? null : trimmedDescription,
        isPrivate: editPayload.isPrivate
      };
      const updated = await updatePlaylist(playlistId, payload);
      if (updated) {
        setPlaylist((prev) => ({ ...prev, ...updated }));
        setEditPayload((prev) => ({
          ...prev,
          title: updated.title ?? prev.title,
          description: updated.description ?? prev.description,
          isPrivate: updated.isPrivate ?? prev.isPrivate
        }));
      }
      setShowEditModal(false);
      setActionMessage("Playlist updated.");
    } catch (err) {
      console.error("Failed to update playlist", err);
      setActionError(err?.message ?? "Unable to update playlist.");
    }
  };


  const queue = useMemo(() => {
    if (!Array.isArray(tracks)) {
      return [];
    }
    return tracks
      .filter((track) => typeof track.trackId === "number")
      .map((track) => ({
        id: track.trackId,
        title: track.title,
        artistName: track.artist,
        artistId: track.artistId ?? null,
        audioUrl: track.audioUrl ?? null,
        coverUrl: track.coverUrl ?? null,
        durationSeconds: track.durationSeconds ?? null
      }));
  }, [tracks]);

  const playlistTitle = playlist?.title ?? "Untitled playlist";
  const playlistCover = playlist?.coverUrl || FALLBACK_PLAYLIST_COVER;
  const playlistIsPrivate = playlist?.isPrivate ?? false;
  const totalDurationSeconds = useMemo(
    () => tracks.reduce((total, track) => total + (Number(track.durationSeconds) || 0), 0),
    [tracks]
  );
  const updatedLabel = formatRelativeDate(playlist?.createdAt);
  const isQueueEmpty = queue.length === 0;

  const isCurrentTrackInPlaylist = useMemo(
    () => Boolean(currentTrack && tracks.some((track) => track.trackId === currentTrack.id)),
    [currentTrack, tracks]
  );
  const isPlaylistPlaying = isCurrentTrackInPlaylist && isPlaying;

  const heroBackground = useMemo(() => ({
    background: "#101010",
    border: "1px solid #1f1f1f",
    borderRadius: 12
  }), []);

  const handlePlayAll = async () => {
    if (isCurrentTrackInPlaylist) {
      try {
        await togglePlay();
        setActionMessage(isPlaylistPlaying ? "Paused." : "Playing playlist.");
      } catch (err) {
        console.error("Failed to toggle playlist playback", err);
        setActionError(err?.message ?? "Unable to control playback");
      }
      return;
    }

    if (!queue.length) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      await playTrack(queue[0], { queue });
      setActionMessage(`Playing ${playlistTitle}.`);
    } catch (err) {
      console.error("Failed to play playlist", err);
      setActionError(err?.message ?? "Unable to start playlist playback");
    }
  };

  const handlePlayTrack = async (trackSummary) => {
    if (!trackSummary) {
      return;
    }

    setActionError("");
    setActionMessage("");

    const descriptor = {
      id: trackSummary.trackId,
      title: trackSummary.title,
      artistName: trackSummary.artist,
      artistId: trackSummary.artistId ?? null,
      audioUrl: trackSummary.audioUrl ?? null,
      coverUrl: trackSummary.coverUrl ?? null,
      durationSeconds: trackSummary.durationSeconds ?? null
    };

    if (currentTrack && currentTrack.id === descriptor.id) {
      try {
        await togglePlay();
      } catch (err) {
        console.error("Failed to toggle playback", err);
        setActionError(err?.message ?? "Unable to control playback");
      }
      return;
    }

    try {
      const fallbackQueue = queue.length ? queue : [descriptor];
      await playTrack(descriptor, { queue: fallbackQueue });
      setActionMessage(`Playing ${trackSummary.title}.`);
    } catch (err) {
      console.error("Failed to play track", err);
      setActionError(err?.message ?? "Unable to play track");
    }
  };

  const handleTogglePlaylistLike = async () => {
    if (!playlistId) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      if (isLiked) {
        await unlikePlaylist(playlistId);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        setActionMessage("Playlist removed from your likes.");
      } else {
        await likePlaylist(playlistId);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        setActionMessage("Playlist added to your likes.");
      }
    } catch (err) {
      console.error("Failed to toggle playlist like", err);
      setActionError(err?.message ?? "Unable to update playlist like state.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#141414",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header avatarUrl={avatarUrl} />
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "88px 16px 120px",
        boxSizing: "border-box"
      }}>
        <div style={{ width: "100%", maxWidth: 1080 }}>
          {loading && (
            <div style={{ color: "#bbb" }}>Loading playlist…</div>
          )}
          {!loading && error && (
            <div style={{ color: "#ff8a8a", marginBottom: 16 }}>{error}</div>
          )}
          {!loading && !error && playlist && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <section style={{ ...heroBackground, padding: "32px 36px", color: "#e6e6e6", display: "flex", gap: 32, alignItems: "flex-start" }}>
                <div style={{ width: 220, height: 220, background: "#0d0d0d", border: "1px solid #222", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={playlistCover}
                    alt="Playlist cover"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#8a8a8a" }}>Playlist</div>
                    <h1 style={{ margin: "8px 0 12px", fontSize: 36, fontWeight: 600, color: "#f5f5f5" }}>{playlistTitle}</h1>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "#bdbdbd", fontSize: 14 }}>
                      <span>{playlist.trackCount ?? tracks.length} tracks</span>
                      <span>•</span>
                      <span>{formatRuntime(totalDurationSeconds)}</span>
                      {Number.isFinite(likesCount) && (
                        <>
                          <span>•</span>
                          <span>{formatCount(likesCount)} likes</span>
                        </>
                      )}
                      {updatedLabel && (
                        <>
                          <span>•</span>
                          <span>Updated {updatedLabel}</span>
                        </>
                      )}
                      {playlistIsPrivate && (
                        <>
                          <span>•</span>
                          <span style={{ fontWeight: 600 }}>Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  {owner && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 48, height: 48, background: "#0d0d0d", border: "1px solid #222", borderRadius: 999, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={owner.avatar_url || FALLBACK_PLAYLIST_COVER}
                          alt="Owner avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", padding: 0, color: "#f5f5f5", fontWeight: 600, cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${owner.username}`)}
                      >
                        {owner.full_name ?? owner.username}
                      </button>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 16 }}>
                    <button
                      type="button"
                      onClick={handlePlayAll}
                      disabled={isQueueEmpty}
                      style={{
                        background: isQueueEmpty ? "#2b2b2b" : "#f5f5f5",
                        color: isQueueEmpty ? "#777" : "#0f0f0f",
                        border: "1px solid #2b2b2b",
                        padding: "10px 28px",
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        cursor: isQueueEmpty ? "not-allowed" : "pointer"
                      }}
                    >
                      {isPlaylistPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                      type="button"
                      onClick={handleTogglePlaylistLike}
                      style={{
                        background: "transparent",
                        color: isLiked ? "#ff7a45" : "#f5f5f5",
                        border: "1px solid #2b2b2b",
                        padding: "10px 18px",
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{isLiked ? "♥" : "♡"}</span>
                      <span style={{ fontSize: 14 }}>{formatCount(likesCount)}</span>
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={handleToggleEditModal}
                        style={{
                          background: "transparent",
                          color: "#f5f5f5",
                          border: "1px solid #2b2b2b",
                          padding: "10px 22px",
                          fontWeight: 600,
                          letterSpacing: 0.4,
                          cursor: "pointer"
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {playlist.description && (
                <section style={{ background: "#101010", border: "1px solid #1f1f1f", borderRadius: 12, padding: 24, color: "#cfcfcf" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 3, color: "#7f7f7f", marginBottom: 12 }}>Description</div>
                  <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>{playlist.description}</p>
                </section>
              )}

              <section style={{ background: "#101010", border: "1px solid #1f1f1f", borderRadius: 12, overflow: "hidden" }}>
                <header style={{
                  display: "grid",
                  gridTemplateColumns: "56px minmax(0, 2fr) minmax(0, 1.3fr) 120px 100px",
                  gap: 12,
                  padding: "16px 24px",
                  color: "#7c7c7c",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  borderBottom: "1px solid #1f1f1f"
                }}>
                  <span>#</span>
                  <span>Title</span>
                  <span>Artist</span>
                  <span style={{ textAlign: "center" }}>Plays</span>
                  <span style={{ textAlign: "right" }}>Time</span>
                </header>
                <div>
                  {tracks.map((trackSummary, idx) => {
                    const isCurrent = currentTrack?.id === trackSummary.trackId;
                    return (
                      <button
                        key={trackSummary.trackId ?? `${trackSummary.title}-${idx}`}
                        type="button"
                        onClick={() => handlePlayTrack(trackSummary)}
                        style={{
                          width: "100%",
                          border: "none",
                          background: isCurrent ? "#181818" : "transparent",
                          color: "#e5e5e5",
                          cursor: "pointer",
                          display: "grid",
                          gridTemplateColumns: "56px minmax(0, 2fr) minmax(0, 1.3fr) 120px 100px",
                          gap: 12,
                          alignItems: "center",
                          padding: "16px 24px",
                          borderBottom: "1px solid #1f1f1f"
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#767676" }}>{idx + 1}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <img
                            src={trackSummary.coverUrl || playlistCover}
                            alt="Track cover"
                            style={{ width: 52, height: 52, objectFit: "cover", background: "#181818", border: "1px solid #222", borderRadius: 8 }}
                          />
                          <span style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {trackSummary.title}
                          </span>
                        </span>
                        <span style={{ fontSize: 14, color: "#b8b8b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {trackSummary.artist ?? "Unknown"}
                        </span>
                        <span style={{ fontSize: 13, color: "#8d8d8d", textAlign: "center" }}>{formatCount(trackSummary.plays)}</span>
                        <span style={{ fontSize: 13, color: "#8d8d8d", textAlign: "right" }}>{formatClock(trackSummary.durationSeconds)}</span>
                      </button>
                    );
                  })}
                  {!tracks.length && (
                    <div style={{ padding: "32px", color: "#8c8c8c", fontSize: 15, textAlign: "center" }}>
                      This playlist does not have any tracks yet.
                    </div>
                  )}
                </div>
              </section>

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
      <Footer />
      {showEditModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3000,
          padding: 24
        }}>
          <form
            onSubmit={handleSaveEdit}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#1b1b1b",
              border: "1px solid #2a2a2a",
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              color: "#f5f5f5"
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Edit playlist</h2>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>Title</span>
              <input
                type="text"
                value={editPayload.title}
                onChange={(event) => handleEditChange("title", event.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #2c2c2c",
                  background: "#141414",
                  color: "#f5f5f5"
                }}
                placeholder="Playlist title"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>Description</span>
              <textarea
                value={editPayload.description}
                onChange={(event) => handleEditChange("description", event.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #2c2c2c",
                  background: "#141414",
                  color: "#f5f5f5",
                  resize: "vertical"
                }}
                placeholder="Add some context for listeners"
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={editPayload.isPrivate}
                onChange={(event) => handleEditChange("isPrivate", event.target.checked)}
              />
              <span>Make playlist private</span>
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #363636",
                  color: "#f5f5f5",
                  borderRadius: 999,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: "#ff5500",
                  border: "none",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
