import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/img/logo.png";
import arrow_down from "../assets/icons/arrow_down.png";
import bell from "../assets/icons/bell.png";
import message from "../assets/icons/message.png";
// NOTE: This component must be rendered inside a <Router> (e.g., <BrowserRouter>) for NavLink to work.

const Header = ({ avatarUrl }) => {
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
      <div className="header-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1240px", gap: "40px", margin: "0 auto" }}>
        {/* Logo */}
        <img src={logo} alt="SoundCloud Logo" style={{ width: "48px", height: "46px", marginRight: "8px" }} />

        {/* Navigation */}
        <nav style={{ display: "flex", gap: "16px" }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              color: isActive ? "#fff" : "#ccc",
              fontWeight: isActive ? "bold" : "normal",
              textDecoration: "none",
              paddingBottom: "4px",
              borderBottom: isActive ? "2px solid #ff5500" : "2px solid transparent",
              transition: "border-bottom 0.2s, color 0.2s",
              cursor: "pointer"
            })}
            onMouseOver={e => e.currentTarget.style.color = "#ff5500"}
            onMouseOut={e => {
              const isActive = e.currentTarget.getAttribute("aria-current") === "page";
              e.currentTarget.style.color = isActive ? "#fff" : "#ccc";
            }}
          >
            Home
          </NavLink>
          <NavLink
            to="/feed"
            style={({ isActive }) => ({
              color: isActive ? "#fff" : "#ccc",
              fontWeight: isActive ? "bold" : "normal",
              textDecoration: "none",
              paddingBottom: "4px",
              borderBottom: isActive ? "2px solid #ff5500" : "2px solid transparent",
              transition: "border-bottom 0.2s, color 0.2s",
              cursor: "pointer"
            })}
            onMouseOver={e => e.currentTarget.style.color = "#ff5500"}
            onMouseOut={e => {
              const isActive = e.currentTarget.getAttribute("aria-current") === "page";
              e.currentTarget.style.color = isActive ? "#fff" : "#ccc";
            }}
          >
            Feed
          </NavLink>
          <NavLink
            to="/library"
            style={({ isActive }) => ({
              color: isActive ? "#fff" : "#ccc",
              fontWeight: isActive ? "bold" : "normal",
              textDecoration: "none",
              paddingBottom: "4px",
              borderBottom: isActive ? "2px solid #ff5500" : "2px solid transparent",
              transition: "border-bottom 0.2s, color 0.2s",
              cursor: "pointer"
            })}
            onMouseOver={e => e.currentTarget.style.color = "#ff5500"}
            onMouseOut={e => {
              const isActive = e.currentTarget.getAttribute("aria-current") === "page";
              e.currentTarget.style.color = isActive ? "#fff" : "#ccc";
            }}
          >
            Library
          </NavLink>
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
          <a href="#" style={{
            color: "#ff5500",
            fontWeight: "bold",
            textDecoration: "none",
            transition: "color 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "#ff5500"}
          >Try Artist Pro</a>
          <a href="#" style={{
            color: "#ccc",
            textDecoration: "none",
            transition: "color 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "#ccc"}
          >For Artists</a>
          <a href="#" style={{
            color: "#ccc",
            textDecoration: "none",
            transition: "color 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "#ccc"}
          >Upload</a>
        </div>

        {/* Avatar and icons */}
        <div className="header-icons" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <img src={arrow_down} alt="Arrow Down" style={{
            width: 15,
            height: 15,
            marginLeft: "-4px",
            marginRight: "8px",
            filter: "invert(1) brightness(2)",
            transition: "filter 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.filter = "invert(1) brightness(3)"}
            onMouseOut={e => e.currentTarget.style.filter = "invert(1) brightness(2)"}
          />
          <img src={bell} alt="Notifications" style={{
            width: 15,
            height: 15,
            filter: "invert(1) brightness(2)",
            transition: "filter 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.filter = "invert(1) brightness(3)"}
            onMouseOut={e => e.currentTarget.style.filter = "invert(1) brightness(2)"}
          />
          <img src={message} alt="Messages" style={{
            width: 15,
            height: 15,
            filter: "invert(1) brightness(2)",
            transition: "filter 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.filter = "invert(1) brightness(3)"}
            onMouseOut={e => e.currentTarget.style.filter = "invert(1) brightness(2)"}
          />
          <span style={{
            color: "#fff",
            fontSize: 18,
            transition: "color 0.2s",
            cursor: "pointer"
          }}
            onMouseOver={e => e.currentTarget.style.color = "#ff5500"}
            onMouseOut={e => e.currentTarget.style.color = "#fff"}
          >⋮</span>
        </div>
      </div>
    </header>
  );
};

export default Header;