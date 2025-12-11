import React from "react";

const FALLBACK_PLAYLIST_COVER = "https://i.imgur.com/6unG5jv.png";

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

const resolveTrackTotal = (playlist) => {
  if (!playlist || typeof playlist !== "object") {
    return 0;
  }
  if (typeof playlist.trackCount === "number") {
    return playlist.trackCount;
  }
  if (typeof playlist.tracksCount === "number") {
    return playlist.tracksCount;
  }
  if (Array.isArray(playlist.tracks)) {
    return playlist.tracks.length;
  }
  return 0;
};

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

const pickTrackCover = (track) => {
  if (!track || typeof track !== "object") {
    return null;
  }
  const candidate = track.coverUrl
    ?? track.cover_url
    ?? track.artwork
    ?? track.artworkUrl
    ?? track.image
    ?? track.imageUrl
    ?? track.image_url
    ?? track.thumbnail
    ?? track.thumbnailUrl
    ?? track.artistAvatar;
  return hasValue(candidate) ? candidate.trim() : null;
};

const resolvePlaylistCover = (playlist) => {
  if (!playlist || typeof playlist !== "object") {
    return FALLBACK_PLAYLIST_COVER;
  }

  const leadCover = playlist.firstTrackCoverUrl ?? playlist.first_track_cover_url;
  if (hasValue(leadCover)) {
    return leadCover.trim();
  }

  const firstTrack = playlist.firstTrack
    ?? (Array.isArray(playlist.previewTracks) && playlist.previewTracks.length ? playlist.previewTracks[0] : null)
    ?? (Array.isArray(playlist.tracks) && playlist.tracks.length ? playlist.tracks[0] : null);

  const derivedCover = pickTrackCover(firstTrack);
  if (derivedCover) {
    return derivedCover;
  }

  const explicitCover = playlist.coverUrl ?? playlist.cover_url ?? playlist.artwork ?? playlist.artworkUrl;
  if (hasValue(explicitCover)) {
    return explicitCover.trim();
  }

  return FALLBACK_PLAYLIST_COVER;
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  background: "#232323",
  color: "#ff8a65",
  padding: "4px 10px",
  borderRadius: 999
};

const createButtonStyle = (disabled) => ({
  background: disabled ? "#3a3a3a" : "#ff5500",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "8px 20px",
  fontWeight: 600,
  fontSize: 13,
  cursor: disabled ? "not-allowed" : "pointer"
});

const UserPlaylists = ({
  playlists = [],
  loading = false,
  title = "Playlists",
  isOwnProfile = false,
  onCreate,
  onPlaylistClick,
  emptyMessage = "This user has not created playlists yet."
}) => (
  <section
    style={{
      width: "100%",
      maxWidth: 880,
      background: "#121212",
      border: "1px solid #1f1f1f",
      borderRadius: 0,
      padding: 24,
      boxSizing: "border-box",
      marginBottom: 24
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#f5f5f5", letterSpacing: 0.4 }}>{title}</h2>
      <span style={{ color: "#707070", fontSize: 12 }}>{playlists.length} items</span>
      {isOwnProfile && (
        <button type="button" style={createButtonStyle(loading)} onClick={onCreate} disabled={loading}>
          New playlist
        </button>
      )}
    </div>
    {loading ? (
      <div style={{ color: "#8c8c8c", fontSize: 14 }}>Loading…</div>
    ) : (playlists.length ? (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 18
      }}>
        {playlists.map((playlist, idx) => {
          const trackTotal = resolveTrackTotal(playlist);
          const cover = resolvePlaylistCover(playlist);
          const titleText = playlist?.title ?? playlist?.name ?? "Untitled playlist";
          const descriptionText = playlist?.description ?? playlist?.summary ?? "Add tracks to start building this playlist.";

          return (
            <div
              key={`${playlist?.id ?? playlist?.slug ?? "playlist"}-${idx}`}
              role={onPlaylistClick ? "button" : undefined}
              tabIndex={onPlaylistClick ? 0 : undefined}
              onClick={() => {
                if (onPlaylistClick && playlist?.id) {
                  onPlaylistClick(playlist.id);
                }
              }}
              onKeyUp={(event) => {
                if (onPlaylistClick && playlist?.id && (event.key === "Enter" || event.key === " ")) {
                  onPlaylistClick(playlist.id);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 18,
                border: "1px solid #1f1f1f",
                borderRadius: 0,
                background: "#161616",
                cursor: onPlaylistClick ? "pointer" : "default"
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#181818",
                  overflow: "hidden"
                }}
              >
                <img
                  src={cover}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ color: "#f0f0f0", fontWeight: 500, fontSize: 15 }}>{titleText}</div>
                {playlist?.isPrivate && (
                  <span style={badgeStyle}>Private</span>
                )}
                <div style={{ color: "#9a9a9a", fontSize: 12, lineHeight: "18px" }}>{descriptionText}</div>
                <div style={{ color: "#6d6d6d", fontSize: 11 }}>
                  {trackTotal ? `${formatCount(trackTotal)} tracks` : "No tracks yet"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div style={{ color: "#8c8c8c", fontSize: 14 }}>{emptyMessage}</div>
    ))}
  </section>
);

export default UserPlaylists;
