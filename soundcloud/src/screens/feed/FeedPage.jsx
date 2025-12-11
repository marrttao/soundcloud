import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchFeed } from "../../api/feed";
import { usePlayer } from "../../context/PlayerContext";

const formatTimeAgo = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
};

const FeedPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFeed();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error("Failed to load feed", err);
      setError(err?.message ?? "Unable to load feed.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const trackItems = useMemo(
    () => items.filter((item) => item?.type === "track" && item.track),
    [items]
  );

  const playlistItems = useMemo(
    () => items.filter((item) => item?.type === "playlist" && item.playlist),
    [items]
  );

  const { queue: trackQueue, indexMap: trackIndexLookup } = useMemo(() => {
    const queue = [];
    const map = new Map();

    trackItems.forEach((item, displayIndex) => {
      const trackId = item?.track?.trackId;
      if (!Number.isInteger(trackId) || trackId <= 0) {
        return;
      }

      map.set(displayIndex, queue.length);

      queue.push({
        id: trackId,
        title: item.track?.title ?? "Untitled track",
        artistName: item.owner?.displayName ?? item.owner?.username ?? "",
        artistId: item.owner?.id ?? null,
        coverUrl: item.track?.coverUrl ?? item.owner?.avatarUrl ?? null,
        artworkUrl: item.track?.coverUrl ?? item.owner?.avatarUrl ?? null,
        durationSeconds: item.track?.durationSeconds ?? null
      });
    });

    return { queue, indexMap: map };
  }, [trackItems]);

  const handlePlayTrack = useCallback((displayIndex) => async () => {
    const queueIndex = trackIndexLookup.get(displayIndex);
    if (typeof queueIndex !== "number") {
      return;
    }
    const descriptor = trackQueue[queueIndex];
    if (!descriptor?.id) {
      return;
    }
    try {
      await playTrack(descriptor, { queue: trackQueue, startIndex: queueIndex });
    } catch (err) {
      console.error("Unable to start playback", err);
    }
  }, [playTrack, trackIndexLookup, trackQueue]);

  const handleOpenProfile = useCallback((username) => () => {
    if (!username) {
      return;
    }
    navigate(`/profile/${username}`);
  }, [navigate]);

  const handleOpenTrack = useCallback((trackId) => () => {
    if (!Number.isInteger(trackId)) {
      return;
    }
    navigate(`/tracks/${trackId}`);
  }, [navigate]);

  const handleOpenPlaylist = useCallback((playlistId) => () => {
    if (!playlistId) {
      return;
    }
    navigate(`/playlists/${playlistId}`);
  }, [navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#141414" }}>
      <Header />
      <main style={{ flex: 1, marginTop: 56, padding: "80px 16px 120px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, margin: 0 }}>Feed</h1>
            <button
              type="button"
              onClick={loadFeed}
              disabled={loading}
              style={{
                background: "none",
                border: "1px solid #2c2c2c",
                color: loading ? "#555" : "#ccc",
                borderRadius: 20,
                padding: "6px 14px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 13,
                transition: "color 0.2s, border-color 0.2s"
              }}
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div style={{ color: "#888", fontSize: 14 }}>Loading feed...</div>
          )}

          {!loading && error && (
            <div style={{ color: "#ff8a8a", fontSize: 14 }}>{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div style={{ color: "#888", fontSize: 14 }}>Follow creators to see their new tracks and playlists here.</div>
          )}

          {!loading && !error && trackItems.length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ color: "#fff", fontSize: 20, margin: 0 }}>Latest Tracks</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {trackItems.map((item, index) => (
                  <div
                    key={`track-${item.track.trackId}-${index}`}
                    style={{
                      background: "#101010",
                      borderRadius: 12,
                      border: "1px solid #1f1f1f",
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        type="button"
                        onClick={handleOpenProfile(item.owner?.username)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: item.owner?.username ? "pointer" : "default"
                        }}
                      >
                        {item.owner?.avatarUrl ? (
                          <img
                            src={item.owner.avatarUrl}
                            alt={item.owner.displayName || item.owner.username}
                            style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#333" }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
                            {item.owner?.displayName || item.owner?.username || "Unknown"}
                          </span>
                          <span style={{ color: "#888", fontSize: 12 }}>{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <div style={{ width: 120, height: 120, borderRadius: 12, overflow: "hidden", background: "#111", flexShrink: 0 }}>
                        {item.track?.coverUrl ? (
                          <img
                            src={item.track.coverUrl}
                            alt={item.track.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#222" }} />
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                        <div style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>{item.track?.title || "Untitled track"}</div>
                        <div style={{ color: "#aaa", fontSize: 14 }}>{item.track?.artist || "Unknown artist"}</div>
                        <div style={{ color: "#666", fontSize: 12 }}>
                          {item.track?.plays ?? 0} plays · {item.track?.likes ?? 0} likes
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          type="button"
                          onClick={handlePlayTrack(index)}
                          disabled={!trackIndexLookup.has(index)}
                          style={{
                            background: "#ff5500",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            padding: "8px 18px",
                            cursor: trackIndexLookup.has(index) ? "pointer" : "not-allowed",
                            fontWeight: 600
                          }}
                        >
                          Play
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenTrack(item.track?.trackId)}
                          style={{
                            background: "none",
                            border: "1px solid #2c2c2c",
                            color: "#ccc",
                            borderRadius: 20,
                            padding: "8px 18px",
                            cursor: item.track?.trackId ? "pointer" : "not-allowed"
                          }}
                          disabled={!Number.isInteger(item.track?.trackId)}
                        >
                          Open track
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && !error && playlistItems.length > 0 && (
            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ color: "#fff", fontSize: 20, margin: 0 }}>Latest Playlists</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {playlistItems.map((item, index) => (
                  <div
                    key={`playlist-${item.playlist.id}-${index}`}
                    style={{
                      background: "#101010",
                      borderRadius: 12,
                      border: "1px solid #1f1f1f",
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        type="button"
                        onClick={handleOpenProfile(item.owner?.username)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: item.owner?.username ? "pointer" : "default"
                        }}
                      >
                        {item.owner?.avatarUrl ? (
                          <img
                            src={item.owner.avatarUrl}
                            alt={item.owner.displayName || item.owner.username}
                            style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#333" }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
                            {item.owner?.displayName || item.owner?.username || "Unknown"}
                          </span>
                          <span style={{ color: "#888", fontSize: 12 }}>{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <div style={{ width: 120, height: 120, borderRadius: 12, overflow: "hidden", background: "#111", flexShrink: 0 }}>
                        {item.playlist?.coverUrl ? (
                          <img
                            src={item.playlist.coverUrl}
                            alt={item.playlist.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#222" }} />
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                        <div style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>{item.playlist?.title || "Untitled playlist"}</div>
                        {item.playlist?.description && (
                          <div style={{ color: "#aaa", fontSize: 14 }}>{item.playlist.description}</div>
                        )}
                        <div style={{ color: "#666", fontSize: 12 }}>
                          {item.playlist?.trackCount ?? 0} tracks
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleOpenPlaylist(item.playlist?.id)}
                          style={{
                            background: "#ff5500",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            padding: "10px 22px",
                            cursor: item.playlist?.id ? "pointer" : "not-allowed",
                            fontWeight: 600
                          }}
                          disabled={!item.playlist?.id}
                        >
                          Open playlist
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeedPage;
