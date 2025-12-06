import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/logo.png";
import arrow_down from "../assets/icons/arrow_down.png";
import bell from "../assets/icons/bell.png";
import message from "../assets/icons/message.png";
// NOTE: This component must be rendered inside a <Router> (e.g., <BrowserRouter>) for NavLink to work.

const Header = ({ avatarUrl }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((open) => !open);

  const profileRoutes = ["Profile", "Likes", "Playlists", "Following", "Tracks"];

  return (
    <header
      className="header"
      style={{
        background: "#181818",
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000
      }}
    >
      <div
        className="header-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1240px",
          gap: "40px",
          margin: "0 auto"
        }}
      >
        {/* Logo */}
        <img src={logo} alt="SoundCloud Logo" style={{ width: "48px", height: "46px", marginRight: "8px" }} />

        {/* Navigation */}
        <nav style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "Home", to: "/" },
            { label: "Feed", to: "/feed" },
            { label: "Library", to: "/library" }
          ].map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
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
                const isActive = e.currentTarget.getAttribute("aria-current") === "page";
                e.currentTarget.style.color = isActive ? "#fff" : "#ccc";
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <div className="header-search" style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              width: "340px",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              background: "#232323",
              color: "#fff"
            }}
          />
        </div>

        {/* Right links */}
        <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {[
            { label: "Try Artist Pro", href: "#", primary: true },
            { label: "For Artists", href: "#" },
            { label: "Upload", href: "#" }
          ].map(({ label, href, primary }) => (
            <a
              key={label}
              href={href}
              style={{
                color: primary ? "#ff5500" : "#ccc",
                fontWeight: primary ? "bold" : "normal",
                textDecoration: "none",
                transition: "color 0.2s",
                cursor: "pointer"
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = primary ? "#ff5500" : "#ccc")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Avatar and icons */}
        <div className="header-icons" style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }} ref={menuRef}>
          <div onClick={toggleMenu} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
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
          </div>
          <img
            src={bell}
            alt="Notifications"
            style={{
              width: 15,
              height: 15,
              filter: "invert(1) brightness(2)",
              transition: "filter 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = "invert(1) brightness(3)")}
            onMouseOut={(e) => (e.currentTarget.style.filter = "invert(1) brightness(2)")}
          />
          <img
            src={message}
            alt="Messages"
            style={{
              width: 15,
              height: 15,
              filter: "invert(1) brightness(2)",
              transition: "filter 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = "invert(1) brightness(3)")}
            onMouseOut={(e) => (e.currentTarget.style.filter = "invert(1) brightness(2)")}
          />
          <span
            style={{
              color: "#fff",
              fontSize: 18,
              transition: "color 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#ff5500")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
          >
            ⋮
          </span>

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
                minWidth: 160,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                zIndex: 3000
              }}
            >
              {profileRoutes.map((item) => (
                <NavLink
                  key={item}
                  to={`/${item.toLowerCase()}`}
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
                  {item}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;