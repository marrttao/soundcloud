import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "All", path: "/profile" },
  { label: "Popular Tracks", path: "/profile/popular" },
  { label: "Tracks", path: "/profile/tracks" },
  { label: "Playlists", path: "/profile/playlists" }
];

const Banner = ({ profile, loading, onEdit = () => {} }) => {
  const avatarUrl = profile?.avatarUrl ?? "https://i.imgur.com/6unG5jv.png";
  const name = profile?.fullName ?? profile?.username ?? "Creator";
  const subtitle = profile?.bio ?? "Share your sound with the world.";
  const bannerStyle = profile?.bannerUrl
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%), url(${profile.bannerUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    : {
        background: "linear-gradient(90deg, #a7a17b 0%, #d6d6af 100%)"
      };

  return (
    <>
      <section
        style={{
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          ...bannerStyle
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "#f7f7f7",
              padding: 4,
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img
                  src={avatarUrl}
                  alt="avatar"
                  style={{ width: "90%", height: "90%", objectFit: "cover" }}
                />
              </div>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 700,
                color: "#101010",
                background: "#000",
                display: "inline-block",
                padding: "4px 12px"
              }}>{loading ? "Loading profile" : name}</h1>
              <p style={{ margin: "8px 0 0", color: "#101010", fontWeight: 500 }}>{subtitle}</p>
            </div>
          </div>
          <button style={{
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "10px 22px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }} onClick={onEdit}>Edit profile</button>
        </div>
      </section>
      <div style={{
        background: "#0d0d0d",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", gap: 28, fontSize: 14, color: "#cfcfcf" }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                background: "none",
                border: "none",
                color: isActive ? "#fff" : "#cfcfcf",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                paddingBottom: 4,
                borderBottom: isActive ? "2px solid #f50" : "2px solid transparent",
                textDecoration: "none"
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            background: "#181818",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 600,
            cursor: "pointer"
          }}>Share</button>
          <button style={{
            background: "#181818",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 600,
            cursor: "pointer"
          }}>Edit</button>
        </div>
      </div>
    </>
  );
};

export default Banner;