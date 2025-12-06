import React, { useEffect } from 'react';

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
    avatar: "https://i.imgur.com/1.jpg",
    user: "redzyx1",
    title: "All The Things She Said (Radio Mix) (D...",
    stats: { plays: "1.07M", likes: "141K", reposts: "99", comments: "33" }
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

const history = [
  {
    avatar: "https://i.imgur.com/1.jpg",
    user: "redzyx1",
    title: "All The Things She Said (Radio Mix) (D...",
    stats: { plays: "1.07M", likes: "141K", reposts: "99", comments: "33" }
  },
  {
    avatar: "https://i.imgur.com/4.jpg",
    user: "GEWOONRAVES",
    title: "[FREE DL] Roncero x Gewoonraves - A...",
    stats: { plays: "8,830", likes: "689", reposts: "182", comments: "234" }
  },
  {
    avatar: "https://i.imgur.com/5.jpg",
    user: "ktoto",
    title: "Платина - XTT",
    stats: { plays: "145K", likes: "1,658", reposts: "5", comments: "17" }
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
  <div
    style={{
      position: "fixed",
      top: 56, // если есть header, иначе 0
      right: "calc(50% - 620px)", // 1240/2=620, sidebar справа от центра
      width: 360,
      height: "calc(100vh - 112px)", // 56px header + 56px footer
      background: "#141414",
      color: "#fff",
      boxSizing: "border-box",
      overflowY: "auto",
      zIndex: 1100,
      paddingBottom: 56 // чтобы контент не прилипал к футеру
    }}
  >
    <div style={{ padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}>ARTISTS YOU SHOULD FOLLOW</span>
        <button style={{
          background: "none",
          border: "none",
          color: "#bbb",
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 500
        }}>Refresh list</button>
      </div>
      <div>
        {artists.map((artist, idx) => (
          <div key={artist.name} style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 18
          }}>
            <img src={artist.avatar} alt="" style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: 16,
              background: "#222"
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{artist.name}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                <span style={{ color: "#bbb", fontSize: 13 }}>
                  <span style={{ marginRight: 3 }}>👤</span>{artist.followers}
                </span>
                <span style={{ color: "#bbb", fontSize: 13 }}>
                  <span style={{ marginRight: 3 }}>🎵</span>{artist.tracks}
                </span>
              </div>
            </div>
            <button style={{
              background: "#fff",
              color: "#181818",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              padding: "7px 18px",
              cursor: "pointer",
              marginLeft: 16
            }}>Follow</button>
          </div>
        ))}
      </div>
      <TrackList title="293 LIKES" tracks={likes} />
      <TrackList title="LISTENING HISTORY" tracks={history} />
    </div>
    <div style={{
      padding: "24px 20px",
      borderTop: "1px solid #222",
      marginTop: 0
    }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18 }}>GO MOBILE</div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <a href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="App Store" style={{ height: 40 }} />
        </a>
        <a href="https://play.google.com/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: 40 }} />
        </a>
      </div>
      <div style={{ color: "#bbb", fontSize: 13, marginBottom: 18, lineHeight: "22px" }}>
        Legal · Privacy · Cookie Policy · Cookie Manager · Imprint · Artist Resources · Newsroom · Charts · Transparency Reports
      </div>
      <div style={{ color: "#bbb", fontSize: 13 }}>
        Language: <span style={{ color: "#fff" }}>English (US)</span>
      </div>
    </div>
  </div>
);

export default SideBar;