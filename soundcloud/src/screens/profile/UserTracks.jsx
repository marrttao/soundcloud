import React from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_COVER = "https://i.imgur.com/6unG5jv.png";

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

const UserTracks = ({ tracks = [], loading = false, title = "Tracks", emptyMessage }) => {
  const navigate = useNavigate();

  return (
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#f5f5f5", letterSpacing: 0.4 }}>{title}</h2>
        <span style={{ color: "#707070", fontSize: 12 }}>{tracks.length} items</span>
      </div>
      {loading ? (
        <div style={{ color: "#8c8c8c", fontSize: 14 }}>Loading…</div>
      ) : (tracks.length ? (
        <div>
          {tracks.map((track, idx) => (
            <div
              key={`${track.trackId ?? track.title ?? "track"}-${idx}`}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: "14px 0",
                borderTop: idx === 0 ? "1px solid #1f1f1f" : "none",
                borderBottom: "1px solid #1f1f1f",
                cursor: track.trackId ? "pointer" : "default"
              }}
              onClick={() => track.trackId && navigate(`/tracks/${track.trackId}`)}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  background: "#181818",
                  overflow: "hidden"
                }}
              >
                <img
                  src={track.coverUrl ?? track.artistAvatar ?? FALLBACK_COVER}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ color: "#f0f0f0", fontWeight: 500, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {track.title ?? "Untitled track"}
                  </div>
                  {track.durationSeconds ? (
                    <div style={{ color: "#6d6d6d", fontSize: 12 }}>{Math.floor(track.durationSeconds / 60)}:{`${track.durationSeconds % 60}`.padStart(2, "0")}</div>
                  ) : null}
                </div>
                <div style={{ color: "#9a9a9a", fontSize: 12, marginBottom: 6 }}>{track.artist ?? "Unknown artist"}</div>
                <div style={{ display: "flex", gap: 18, color: "#6d6d6d", fontSize: 11 }}>
                  <span>▶ {formatCount(track.plays)}</span>
                  <span>♥ {formatCount(track.likes)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#8c8c8c", fontSize: 14 }}>{emptyMessage ?? "This user has not uploaded tracks yet."}</div>
      ))}
    </section>
  );
};

export default UserTracks;
