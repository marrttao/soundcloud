import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPlaylist } from "../../api/playlist";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.65)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  boxSizing: "border-box"
};

const modalStyle = {
  width: "100%",
  maxWidth: 420,
  background: "#1b1b1b",
  border: "1px solid #2a2a2a",
  borderRadius: 12,
  padding: 24,
  boxSizing: "border-box",
  color: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  gap: 16
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.4,
  color: "#d5d5d5"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #2c2c2c",
  background: "#121212",
  color: "#f5f5f5",
  fontSize: 14,
  boxSizing: "border-box"
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 80
};

const buttonRowStyle = {
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  marginTop: 8
};

const primaryButtonStyle = (disabled) => ({
  background: disabled ? "#444" : "#ff5500",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "10px 28px",
  fontWeight: 600,
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

const CreatePlaylistModal = ({ onClose, onSuccess, availableTracks = [] }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const isMounted = useRef(true);
  const trackOptions = useMemo(() => {
    const seen = new Set();
    return availableTracks
      .map((track) => {
        const idCandidate = track?.trackId ?? track?.id ?? track?.track?.id;
        const numericId = Number(idCandidate);
        if (!Number.isFinite(numericId) || numericId <= 0 || seen.has(numericId)) {
          return null;
        }
        seen.add(numericId);
        const rawTitle = track?.title ?? track?.name ?? track?.track?.title;
        const label = typeof rawTitle === "string" && rawTitle.trim().length
          ? rawTitle.trim()
          : `Track #${numericId}`;
        return { id: numericId, label };
      })
      .filter(Boolean);
  }, [availableTracks]);
  const [initialTrackId, setInitialTrackId] = useState(() => (trackOptions[0]?.id ? String(trackOptions[0].id) : ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInitialTrackId(trackOptions[0]?.id ? String(trackOptions[0].id) : "");
  }, [trackOptions]);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Playlist name is required.");
      return;
    }
    if (!initialTrackId) {
      setError("Select a track to include in the new playlist.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const numericInitialTrackId = Number(initialTrackId);
      if (!Number.isFinite(numericInitialTrackId) || numericInitialTrackId <= 0) {
        throw new Error("Invalid track selected. Choose another track.");
      }
      await createPlaylist({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        coverUrl: null,
        isPrivate,
        initialTrackId: numericInitialTrackId
      });
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error("Failed to create playlist", err);
      setError(err?.message ?? "Unable to create playlist.");
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <div style={overlayStyle}>
      <form style={modalStyle} onSubmit={handleSubmit}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>New playlist</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle} htmlFor="playlist-title">Name</label>
          <input
            id="playlist-title"
            type="text"
            style={inputStyle}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your playlist a name"
            disabled={submitting}
            autoFocus
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle} htmlFor="playlist-description">Description</label>
          <textarea
            id="playlist-description"
            style={textareaStyle}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is this playlist about?"
            disabled={submitting}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle} htmlFor="playlist-initial-track">First track</label>
          {trackOptions.length ? (
            <select
              id="playlist-initial-track"
              style={{
                ...inputStyle,
                appearance: "none"
              }}
              value={initialTrackId}
              onChange={(event) => setInitialTrackId(event.target.value)}
              disabled={submitting}
            >
              {trackOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          ) : (
            <div style={{ color: "#ff9f6f", fontSize: 13 }}>
              Upload a track before creating a playlist. A playlist must contain at least one track.
            </div>
          )}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.target.checked)}
            disabled={submitting}
          />
          <span>Make playlist private</span>
        </label>
        {error && <div style={{ color: "#ff9090", fontSize: 13 }}>{error}</div>}
        <div style={buttonRowStyle}>
          <button type="button" style={secondaryButtonStyle} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            style={primaryButtonStyle(submitting || !trackOptions.length)}
            disabled={submitting || !trackOptions.length}
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlaylistModal;
