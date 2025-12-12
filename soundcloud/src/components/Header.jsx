import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/logo.png";
import arrow_down from "../assets/icons/arrow_down.png";
import bell from "../assets/icons/bell.png";
import message from "../assets/icons/message.png";
import { search } from "../api/search";
import { useCurrentProfile, clearProfileCache } from "../context/ProfileContext";
import { clearAuthTokens, setAuthFlag } from "../utils/authFlag";
import useBreakpoint from "../hooks/useBreakpoint";
// NOTE: This component must be rendered inside a <Router> (e.g., <BrowserRouter>) for NavLink to work.

const sampleNotifications = [];

const sampleAnnouncements = [];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);
  const { profile } = useCurrentProfile();
  const avatarUrl = profile?.avatar_url ?? null;
  const isMobile = useBreakpoint(768);
  const showActivityButtons = !isMobile;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setMessagesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileNavOpen(false);
      setMobileSearchVisible(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const results = await search(searchQuery);
          setSearchResults(results);
          setSearchOpen(true);
        } catch (error) {
          console.error("Search failed:", error);
          setSearchResults({ profiles: [], tracks: [] });
        }
      } else {
        setSearchResults(null);
        setSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const toggleMenu = () => {
    setMenuOpen((open) => {
      const next = !open;
      if (next) {
        setNotificationsOpen(false);
        setMessagesOpen(false);
      }
      return next;
    });
  };

  const toggleNotifications = () => {
    setNotificationsOpen((open) => {
      const next = !open;
      if (next) {
        setMenuOpen(false);
        setMessagesOpen(false);
      }
      return next;
    });
  };

  const toggleMessages = () => {
    setMessagesOpen((open) => {
      const next = !open;
      if (next) {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
      return next;
    });
  };

  const handleLogout = () => {
    setMenuOpen(false);
    clearAuthTokens();
    setAuthFlag(false);
    clearProfileCache();
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  };

  const profileRoutes = [
    { label: "Profile", to: "/profile" },
    { label: "Likes", to: "/profile?tab=likes" },
    { label: "Playlists", to: "/profile?tab=playlists" },
    { label: "Following", to: "/profile?tab=following" },
    { label: "Tracks", to: "/profile?tab=tracks" }
  ];

  const mainNavLinks = [
    { label: "Home", to: "/", exact: true },
    { label: "Feed", to: "/feed" },
    { label: "Library", to: "/library" }
  ];

  const secondaryLinks = [
    { label: "Try Artist Pro", to: "/artist-pro", primary: true },
    { label: "For Artists", to: "/for-artists" },
    { label: "Upload", to: "/upload" }
  ];

  const toggleMobileNav = () => {
    setMobileNavOpen((open) => !open);
    setMobileSearchVisible(false);
  };

  const renderSearchField = (styleOverrides = {}) => (
    <div
      className="header-search"
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        width: "100%",
        flex: isMobile ? "1 1 100%" : "1 1 360px",
        minWidth: isMobile ? "100%" : "280px",
        maxWidth: isMobile ? "100%" : "100%",
        ...styleOverrides
      }}
      ref={searchRef}
    >
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "100%",
          padding: "8px 12px",
          borderRadius: "4px",
          border: "none",
          background: "#232323",
          color: "#fff"
        }}
      />
      {searchOpen && searchResults && (searchResults.profiles.length > 0 || searchResults.tracks.length > 0) && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#121212",
          border: "1px solid #2d2d2d",
          borderRadius: "8px",
          marginTop: "4px",
          maxHeight: "400px",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 3000
        }}>
          {searchResults.profiles.length > 0 && (
            <div style={{ padding: "8px 12px" }}>
              <div style={{ color: "#999", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>PROFILES</div>
              {searchResults.profiles.map((profile) => (
                <NavLink
                  key={profile.id}
                  to={`/profile/${profile.username}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    setMobileSearchVisible(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#fff",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#444" }} />
                  )}
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500" }}>{profile.username}</div>
                    {profile.full_name && <div style={{ fontSize: "12px", color: "#999" }}>{profile.full_name}</div>}
                  </div>
                </NavLink>
              ))}
            </div>
          )}
          {searchResults.tracks.length > 0 && (
            <div style={{ padding: "8px 12px", borderTop: searchResults.profiles.length > 0 ? "1px solid #2d2d2d" : "none" }}>
              <div style={{ color: "#999", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>TRACKS</div>
              {searchResults.tracks.map((track) => (
                <NavLink
                  key={track.id}
                  to={`/tracks/${track.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    setMobileSearchVisible(false);
                  }}
                  style={{
                    display: "block",
                    padding: "8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#fff",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ fontSize: "14px" }}>{track.title}</div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header
        className="header"
        style={{
          background: "#181818",
          padding: isMobile ? "0 16px" : "0 32px",
          height: isMobile ? "64px" : "56px",
          display: "flex",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          borderBottom: "1px solid #111"
        }}
      >
        <div
          className="header-content"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 1240,
            gap: isMobile ? "12px" : "32px",
            margin: "0 auto",
            flexWrap: isMobile ? "wrap" : "nowrap",
            rowGap: isMobile ? "8px" : 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, minWidth: 0 }}>
            {isMobile && (
              <button
                type="button"
                onClick={toggleMobileNav}
                aria-label="Toggle navigation"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  border: "1px solid #2a2a2a",
                  background: "#202020",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer"
                }}
              >
                ☰
              </button>
            )}
            <img src={logo} alt="SoundCloud Logo" style={{ width: isMobile ? "40px" : "48px", height: isMobile ? "38px" : "46px" }} />
            {!isMobile && (
              <nav style={{ display: "flex", gap: "16px" }}>
                {mainNavLinks.map(({ label, to, exact }) => (
                  <NavLink
                    key={label}
                    to={to}
                    end={Boolean(exact)}
                    style={({ isActive }) => ({
                      color: isActive ? "#fff" : "#ccc",
                      fontWeight: isActive ? "bold" : "normal",
                      textDecoration: "none",
                      paddingBottom: "4px",
                      borderBottom: isActive ? "2px solid #ff5500" : "2px solid transparent",
                      transition: "border-bottom 0.2s, color 0.2s",
                      cursor: "pointer"
                    })}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#ff5500")}
                    onMouseOut={(e) => {
                      const active = e.currentTarget.getAttribute("aria-current") === "page";
                      e.currentTarget.style.color = active ? "#fff" : "#ccc";
                    }}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>
          {!isMobile && renderSearchField()}
          {!isMobile && (
            <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {secondaryLinks.map(({ label, to, primary }) => (
                <NavLink
                  key={label}
                  to={to}
                  style={({ isActive }) => ({
                    color: isActive
                      ? label === "Upload"
                        ? "#ff5500"
                        : "#fff"
                      : primary
                        ? "#ff5500"
                        : "#ccc",
                    fontWeight: primary || label === "Upload" ? "bold" : "normal",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    cursor: "pointer",
                    paddingBottom: "2px",
                    borderBottom: isActive ? "2px solid #ff5500" : "2px solid transparent"
                  })}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => {
                    const active = e.currentTarget.getAttribute("aria-current") === "page";
                    e.currentTarget.style.color = active
                      ? label === "Upload"
                        ? "#ff5500"
                        : "#fff"
                      : primary
                        ? "#ff5500"
                        : "#ccc";
                  }}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          <div
            className="header-icons"
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "12px",
              position: "relative",
              marginLeft: isMobile ? 0 : "auto",
              flexWrap: isMobile ? "wrap" : "nowrap",
              justifyContent: "flex-end",
              flexShrink: 0
            }}
            ref={menuRef}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileSearchVisible((open) => !open)}
                aria-label="Toggle search"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  border: "1px solid #2a2a2a",
                  background: mobileSearchVisible ? "#2a2a2a" : "#202020",
                  color: "#fff",
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                ⌕
              </button>
            )}
          <div
            onClick={toggleMenu}
            style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", position: "relative" }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#444"
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#444"
                }}
              />
            )}
            {!isMobile && (
              <img
                src={arrow_down}
                alt="Arrow Down"
                style={{
                  width: 15,
                  height: 15,
                  marginLeft: "-4px",
                  marginRight: "8px",
                  filter: "invert(1) brightness(2)",
                  transition: "filter 0.2s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.filter = "invert(1) brightness(3)")}
                onMouseOut={(e) => (e.currentTarget.style.filter = "invert(1) brightness(2)")}
              />
            )}
          </div>
          {showActivityButtons && (
          <div ref={notificationsRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={toggleNotifications}
              style={{
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <img
                src={bell}
                alt="Notifications"
                style={{
                  width: 16,
                  height: 16,
                  filter: notificationsOpen ? "invert(1) brightness(3)" : "invert(1) brightness(2)",
                  transition: "filter 0.2s"
                }}
              />
            </button>
            {notificationsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 40,
                  right: 0,
                  width: 320,
                  background: "#121212",
                  border: "1px solid #2d2d2d",
                  borderRadius: 12,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                  padding: 12,
                  zIndex: 3000
                }}
              >
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Notifications</div>
                {sampleNotifications.length === 0 ? (
                  <div style={{ color: "#888", fontSize: 13 }}>Nothing here yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sampleNotifications.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: "#1a1a1a",
                          borderRadius: 10,
                          padding: 10,
                          border: "1px solid #222"
                        }}
                      >
                        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                        <div style={{ color: "#aaa", fontSize: 12 }}>{item.body}</div>
                        <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>{item.time} ago</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
          {showActivityButtons && (
          <div ref={messagesRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={toggleMessages}
              style={{
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <img
                src={message}
                alt="Announcements"
                style={{
                  width: 16,
                  height: 16,
                  filter: messagesOpen ? "invert(1) brightness(3)" : "invert(1) brightness(2)",
                  transition: "filter 0.2s"
                }}
              />
            </button>
            {messagesOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 40,
                  right: 0,
                  width: 320,
                  background: "#121212",
                  border: "1px solid #2d2d2d",
                  borderRadius: 12,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                  padding: 12,
                  zIndex: 3000
                }}
              >
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>News</div>
                {sampleAnnouncements.length === 0 ? (
                  <div style={{ color: "#888", fontSize: 13 }}>Nothing here yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sampleAnnouncements.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: "#171717",
                          borderRadius: 10,
                          padding: 10,
                          border: "1px solid #272727"
                        }}
                      >
                        <div style={{ color: "#ff7a18", fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                        <div style={{ color: "#ddd", fontSize: 12 }}>{item.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: 52,
                right: 0,
                background: "#121212",
                border: "1px solid #2d2d2d",
                borderRadius: 10,
                padding: "12px",
                minWidth: 180,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                zIndex: 3000,
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}
            >
              {profileRoutes.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: "block",
                    color: isActive ? "#ff5500" : "#fff",
                    padding: "6px 8px",
                    textDecoration: "none",
                    fontSize: 14,
                    borderRadius: 6
                  })}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#ff5500")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div style={{ height: 1, background: "#1f1f1f", margin: "4px 0" }} />
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  border: "none",
                  background: "#1d1d1d",
                  color: "#ff8a8a",
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "8px 10px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#2a2a2a";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#1d1d1d";
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      </header>
      {isMobile && mobileSearchVisible && (
        <div style={{
          position: "sticky",
          top: isMobile ? 64 : 56,
          background: "#0f0f0f",
          padding: "12px 16px",
          borderBottom: "1px solid #1f1f1f",
          zIndex: 900
        }}>
          {renderSearchField({ width: "100%" })}
        </div>
      )}
      {isMobile && mobileNavOpen && (
        <div style={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(4,4,4,0.96)",
          backdropFilter: "blur(10px)",
          zIndex: 950,
          padding: "24px 20px",
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={toggleMobileNav}
              aria-label="Close navigation"
              style={{
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: 24,
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
            <div>
              <p style={{ color: "#666", fontSize: 12, margin: "0 0 8px" }}>NAVIGATION</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mainNavLinks.map(({ label, to, exact }) => (
                  <NavLink
                    key={label}
                    to={to}
                    end={Boolean(exact)}
                    onClick={toggleMobileNav}
                    style={({ isActive }) => ({
                      color: isActive ? "#ff5500" : "#fff",
                      textDecoration: "none",
                      fontSize: 18,
                      fontWeight: 600
                    })}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: "#666", fontSize: 12, margin: "0 0 8px" }}>SHORTCUTS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {secondaryLinks.map(({ label, to }) => (
                  <NavLink
                    key={label}
                    to={to}
                    onClick={toggleMobileNav}
                    style={({ isActive }) => ({
                      color: isActive ? "#ff5500" : "#fff",
                      textDecoration: "none",
                      fontSize: 16
                    })}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: "#666", fontSize: 12, margin: "0 0 8px" }}>ACCOUNT</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {profileRoutes.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={toggleMobileNav}
                    style={({ isActive }) => ({
                      color: isActive ? "#ff5500" : "#fff",
                      textDecoration: "none",
                      fontSize: 15
                    })}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    marginTop: 8,
                    border: "1px solid #2a2a2a",
                    background: "transparent",
                    color: "#ff8a8a",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;