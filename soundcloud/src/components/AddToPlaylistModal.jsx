import React, { useCallback, useEffect, useRef, useState } from "react";
import { addTrackToPlaylist, createPlaylist, fetchMyPlaylists } from "../api/playlist";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.7)",
  zIndex: 2100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  boxSizing: "border-box"
};

const modalStyle = {
  width: "100%",
  maxWidth: 560,
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  padding: 24,
  boxSizing: "border-box",
  color: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  gap: 16
};

const listContainerStyle = {
  maxHeight: 260,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const listItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  background: "#202020",
  border: "1px solid #2f2f2f",
  borderRadius: 10,
  padding: "12px 16px"
};

const addButtonStyle = (disabled) => ({
  background: disabled ? "#3a3a3a" : "#ff5500",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "8px 18px",
  fontWeight: 600,
  fontSize: 13,
  cursor: disabled ? "not-allowed" : "pointer"
});

const secondaryButtonStyle = {
  background: "#252525",
  color: "#f5f5f5",
  border: "1px solid #3a3a3a",
  borderRadius: 999,
  padding: "10px 24px",
  fontWeight: 600,
  cursor: "pointer"
};

const badgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#ff8a65"
};

const CreateSection = ({ onCreate, creating, creationDisabled, initialTrackNote }) => {
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const isMounted = useRef(true);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (creationDisabled) {
      return;
    }
    if (!title.trim()) {
      setError("Playlist name is required.");
      return;
    }
    setError("");
    await onCreate({
      title: title.trim(),
      description: null,
      coverUrl: null,
      isPrivate
    });
    if (!isMounted.current) {
      return;
    }
    setTitle("");
    setIsPrivate(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Create new playlist</div>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Playlist name"
        disabled={creating}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #2c2c2c",
          background: "#111",
          color: "#f5f5f5",
          fontSize: 14
        }}
      />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(event) => setIsPrivate(event.target.checked)}
          disabled={creating}
        />
        <span>Make playlist private</span>
      </label>
      {error && <div style={{ color: "#ff9090", fontSize: 12 }}>{error}</div>}
      {initialTrackNote && (
        <div style={{ color: "#9ea9ff", fontSize: 12 }}>{initialTrackNote}</div>
      )}
      <button type="submit" style={addButtonStyle(creating || creationDisabled)} disabled={creating || creationDisabled}>
        {creating ? "Creating…" : "Create"}
      </button>
    </form>
  );
};

const AddToPlaylistModal = ({ open, trackId, onClose, onAdded }) => {
  const numericTrackId = Number(trackId);
  const hasValidTrack = Number.isFinite(numericTrackId) && numericTrackId > 0;
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [status, setStatus] = useState("");

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyPlaylists();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load playlists", err);
      setError(err?.message ?? "Unable to load playlists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    loadPlaylists();
  }, [open, loadPlaylists]);

  const handleCreate = async (payload) => {
    if (!hasValidTrack) {
      setError("Unable to determine track for the new playlist.");
      return;
    }
    try {
      setCreating(true);
      setError("");
      const playlist = await createPlaylist({
        ...payload,
        initialTrackId: numericTrackId
      });
      if (playlist) {
        setPlaylists((prev) => [playlist, ...prev]);
        setStatus(`Created playlist "${playlist.title ?? "Untitled"}" and added the current track.`);
        onAdded?.(playlist);
      }
    } catch (err) {
      console.error("Failed to create playlist", err);
      setError(err?.message ?? "Unable to create playlist.");
    } finally {
      setCreating(false);
    }
  };

  const handleAdd = async (playlist) => {
    if (!playlist?.id || !trackId) {
      return;
    }

    setAddingId(playlist.id);
    setStatus("");
    setError("");
    try {
      await addTrackToPlaylist(playlist.id, trackId);
      setStatus(`Added track to "${playlist.title ?? "playlist"}".`);
      onAdded?.(playlist);
    } catch (err) {
      console.error("Failed to add track to playlist", err);
      setError(err?.message ?? "Unable to add track to playlist.");
    } finally {
      setAddingId(null);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Add to playlist</h2>
          <button type="button" style={secondaryButtonStyle} onClick={onClose}>Close</button>
        </div>
        {error && <div style={{ color: "#ff9090", fontSize: 13 }}>{error}</div>}
        {status && <div style={{ color: "#6fe3b7", fontSize: 13 }}>{status}</div>}
        <div style={{ fontSize: 14, fontWeight: 600 }}>Your playlists</div>
        <div style={listContainerStyle}>
          {loading ? (
            <div style={{ color: "#8c8c8c" }}>Loading playlists…</div>
          ) : (playlists.length ? (
            playlists.map((playlist) => (
              <div style={listItemStyle} key={playlist.id ?? playlist.title}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{playlist.title ?? "Untitled playlist"}</span>
                  <span style={{ color: "#8a8a8a", fontSize: 12 }}>
                    {playlist.trackCount ? `${playlist.trackCount} tracks` : "No tracks yet"}
                  </span>
                  {playlist.isPrivate && <span style={badgeStyle}>Private</span>}
                </div>
                <button
                  type="button"
                  style={addButtonStyle(addingId === playlist.id)}
                  onClick={() => handleAdd(playlist)}
                  disabled={addingId === playlist.id}
                >
                  {addingId === playlist.id ? "Adding…" : "Add"}
                </button>
              </div>
            ))
          ) : (
            <div style={{ color: "#8c8c8c", fontSize: 13 }}>You have no playlists yet. Create one below.</div>
          ))}
        </div>
        <CreateSection
          onCreate={handleCreate}
          creating={creating}
          creationDisabled={!hasValidTrack}
          initialTrackNote={hasValidTrack ? "The current track will be added as the first track." : "Select a track to add before creating a playlist."}
        />
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
