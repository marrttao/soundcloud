import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";

const formatCount = (value = 0) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K` : value.toString();

const TrackList = ({ title, tracks }) => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const queueDescriptors = useMemo(() => (
    tracks?.map((track) => ({
      id: track.trackId,
      title: track.title,
      artistName: track.artist,
      artistId: track.artistId ?? null,
      audioUrl: track.audioUrl ?? null,
      durationSeconds: track.durationSeconds ?? null
    })) ?? []
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

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>{title}</span>
        <button style={{
          background: "none",
          border: "none",
          color: "#bbb",
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 500
        }}>View all</button>
      </div>
      <div>
        {tracks?.length ? tracks.map((track, idx) => (
          <div key={`${track.trackId ?? track.title}-${idx}`} style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 18,
            gap: 12
          }}>
            <button
              type="button"
              onClick={handlePlay(idx)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid #2f2f2f",
                background: "#1f1f1f",
                color: "#fff",
                cursor: "pointer"
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
              <img src={track.artistAvatar ?? "https://i.imgur.com/6unG5jv.png"} alt="" style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }} />
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
              </div>
            </div>
          </div>
        )) : (
          <p style={{ color: "#777", fontSize: 13 }}>No tracks yet.</p>
        )}
      </div>
    </div>
  );
};

const SideBar = ({ stats, likes, following, loading }) => {
  const statItems = [
    { label: "Followers", value: stats?.followers ?? 0 },
    { label: "Following", value: stats?.following ?? 0 },
    { label: "Tracks", value: stats?.tracks ?? 0 }
  ];
  const likeTitle = `${stats?.likes ?? 0} LIKES`;

  return (
    <aside
      style={{
        width: "100%",
        background: "#141414",
        color: "#fff",
        boxSizing: "border-box",
        paddingBottom: 56
      }}
    >
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          {statItems.map(stat => (
            <div key={stat.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ color: "#bbb", fontSize: 13, letterSpacing: 0.5 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{loading ? "—" : stat.value}</div>
            </div>
          ))}
        </div>
        <TrackList title={likeTitle} tracks={likes} />
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>{(following?.length ?? 0).toString()} FOLLOWING</span>
            <button style={{
              background: "none",
              border: "none",
              color: "#bbb",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500
            }}>View all</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(following?.length ? following : []).map(person => (
              <div key={person.id.toString()} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={person.avatarUrl ?? "https://i.imgur.com/6unG5jv.png"} alt="" style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#222"
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14 }}>
                    {person.username}
                  </div>
                  <div style={{ display: "flex", gap: 12, color: "#bbb", fontSize: 12, marginTop: 2 }}>
                    <span>👥 {formatCount(person.followers)}</span>
                    <span>🎵 {formatCount(person.tracks)}</span>
                  </div>
                </div>
                <button style={{
                  background: "#2c2c2c",
                  color: "#fff",
                  border: "1px solid #2c2c2c",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 14,
                  padding: "6px 18px",
                  cursor: "pointer"
                }}>Following</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: 1, marginBottom: 10 }}>GO MOBILE</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#101010",
              border: "1px solid #202020"
            }}>
              <div style={{ fontSize: 10, letterSpacing: 0.6, color: "#9c9c9c" }}>Download on the</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>App Store</div>
            </div>
            <div style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#101010",
              border: "1px solid #202020"
            }}>
              <div style={{ fontSize: 10, letterSpacing: 0.6, color: "#9c9c9c" }}>GET IT ON</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Google Play</div>
            </div>
          </div>
          <p style={{ marginTop: 16, color: "#9c9c9c", fontSize: 11 }}>Language: English (US)</p>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
