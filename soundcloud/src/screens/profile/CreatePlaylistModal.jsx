import React, { useEffect, useRef, useState } from "react";
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
  minHeight: 100
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

const CreatePlaylistModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Playlist name is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createPlaylist({
        title: trimmedTitle,
        description: description.trim() ? description.trim() : null,
        coverUrl: null,
        isPrivate
      });

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error("Failed to create playlist", err);
      const serverMessage = err?.response?.data?.title ?? err?.response?.data?.detail ?? err?.response?.data;
      setError(typeof serverMessage === "string" && serverMessage.trim().length ? serverMessage : err?.message ?? "Unable to create playlist.");
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
            style={primaryButtonStyle(submitting)}
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlaylistModal;
