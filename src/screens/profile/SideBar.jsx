import React from 'react';

const artists = [
  {
    avatar: "https://i.imgur.com/1.jpg",
    name: "CODE80",
    followers: "8,848",
    tracks: "90"
  },
  {
    avatar: "https://i.imgur.com/2.jpg",
    name: "angelgrind",
    followers: "6,945",
    tracks: "9"
  },
  {
    avatar: "https://i.imgur.com/3.jpg",
    name: "#pixelated kisses",
    followers: "234",
    tracks: "11"
  }
];

const likes = [
  {
    avatar: "https://i.imgur.com/4zQJ7j8.jpg",
    user: "королевский XVII",
    title: "я больше не на дне ск",
    stats: { plays: "166K", likes: "2,638", reposts: "56", comments: "46" }
  },
  {
    avatar: "https://i.imgur.com/1.jpg",
    user: "redzyx1",
    title: "All The Things She Said (Radio Mix) (D...",
    stats: { plays: "1.08M", likes: "14.2K", reposts: "99", comments: "35" }
  },
  {
    avatar: "https://i.imgur.com/2.jpg",
    user: "goth girl",
    title: "goth girl - LOVE DESTROY",
    stats: { plays: "121K", likes: "1,435", reposts: "9", comments: "35" }
  },
  {
    avatar: "https://i.imgur.com/3.jpg",
    user: "володя",
    title: "в темных очках Anonymous Ember",
    stats: { plays: "86K", likes: "1,210", reposts: "26", comments: "8" }
  }
];

const stats = [
  { label: "Followers", value: "0" },
  { label: "Following", value: "3" },
  { label: "Tracks", value: "0" }
];

const following = [
  {
    avatar: "https://i.imgur.com/vA5Xq5u.jpg",
    name: "тёмный принц",
    followers: "128K",
    tracks: "23"
  },
  {
    avatar: "https://i.imgur.com/4zQJ7j8.jpg",
    name: "королевский XVII",
    followers: "52.8K",
    tracks: "11"
  },
  {
    avatar: "https://i.imgur.com/Btj3zq1.jpg",
    name: "uglystephan",
    followers: "32.8K",
    tracks: "81",
    verified: true
  }
];

const TrackList = ({ title, tracks }) => (
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
      {tracks.map((track, idx) => (
        <div key={track.user + idx} style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 18
        }}>
          <img src={track.avatar} alt="" style={{
            width: 40,
            height: 40,
            borderRadius: "6px",
            objectFit: "cover",
            marginRight: 14,
            background: "#222"
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{track.user}</div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{track.title}</div>
            <div style={{ display: "flex", gap: 12, color: "#bbb", fontSize: 12 }}>
              <span>▶ {track.stats.plays}</span>
              <span>♥ {track.stats.likes}</span>
              <span>⟳ {track.stats.reposts}</span>
              <span>💬 {track.stats.comments}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SideBar = () => (
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
        {stats.map(stat => (
          <div key={stat.label} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ color: "#bbb", fontSize: 13, letterSpacing: 0.5 }}>{stat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{stat.value}</div>
          </div>
        ))}
      </div>
      <TrackList title="294 LIKES" tracks={likes} />
      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>3 FOLLOWING</span>
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
          {following.map(person => (
            <div key={person.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={person.avatar} alt="" style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                objectFit: "cover",
                background: "#222"
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14 }}>
                  {person.name}
                  {person.verified && (
                    <span style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: "#4dd0e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "#111"
                    }}>✔</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12, color: "#bbb", fontSize: 12, marginTop: 2 }}>
                  <span>👥 {person.followers}</span>
                  <span>🎵 {person.tracks}</span>
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

export default SideBar;
