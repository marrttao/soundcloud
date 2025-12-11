import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "All", tab: "all" },
  { label: "Popular Tracks", tab: "popular" },
  { label: "Tracks", tab: "tracks" },
  { label: "Playlists", tab: "playlists" }
];

const Banner = ({
  profile,
  loading,
  onEdit = () => {},
  isOwnProfile = false,
  activeTab = "all",
  onToggleFollow = () => {},
  followBusy = false,
  isFollowing = false
}) => {
  const avatarUrl = profile?.avatar_url ?? "https://i.imgur.com/6unG5jv.png";
  const name = profile?.full_name ?? profile?.username ?? "Creator";
  const subtitle = profile?.bio ?? "Share your sound with the world.";
  const basePath = useMemo(() => {
    if (isOwnProfile) {
      return "/profile";
    }

    const username = profile?.username;
    if (!username) {
      return "/profile";
    }

    return `/profile/${username}`;
  }, [isOwnProfile, profile]);

  const buildDestination = (tab) => {
    if (tab === "all") {
      return { pathname: basePath, search: "" };
    }
    return { pathname: basePath, search: `?tab=${tab}` };
  };

  const isTabActive = (tab) => {
    if (tab === "all") {
      return activeTab === "all";
    }
    return activeTab === tab;
  };
  const bannerStyle = profile?.banner_url
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%), url(${profile.banner_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    : {
        background: "linear-gradient(90deg, #a7a17b 0%, #d6d6af 100%)"
      };
  const canFollow = !isOwnProfile && Boolean(profile?.id);
  const followLabel = isFollowing ? "Following" : "Follow";

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
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)"
            }}>
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 6px 18px rgba(0,0,0,0.35)",
                letterSpacing: 0.3
              }}>{loading ? "Loading profile" : name}</h1>
              <p style={{
                margin: "8px 0 0",
                color: "#fff",
                fontWeight: 500,
                textShadow: "0 6px 18px rgba(0,0,0,0.35)"
              }}>{subtitle}</p>
            </div>
          </div>
          {isOwnProfile && (
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
          )}
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
              key={item.tab}
              to={buildDestination(item.tab)}
              style={() => ({
                background: "none",
                border: "none",
                color: isTabActive(item.tab) ? "#fff" : "#cfcfcf",
                fontWeight: isTabActive(item.tab) ? 600 : 500,
                cursor: "pointer",
                paddingBottom: 4,
                borderBottom: isTabActive(item.tab) ? "2px solid #f50" : "2px solid transparent",
                textDecoration: "none"
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div>
          {canFollow && (
            <button
              type="button"
              onClick={onToggleFollow}
              disabled={followBusy}
              style={{
                background: isFollowing ? "#1d1d1d" : "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 999,
                padding: "8px 22px",
                fontWeight: 600,
                fontSize: 13,
                cursor: followBusy ? "not-allowed" : "pointer",
                opacity: followBusy ? 0.6 : 1,
                letterSpacing: 0.2
              }}
            >
              {followBusy ? "Updating" : followLabel}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Banner;