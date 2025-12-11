import React from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { NavLink } from "react-router-dom";

const steps = [
  "Prepare high-quality WAV or AIFF files and square artwork (3000x3000 recommended).",
  "Open the Upload section from the header and fill out titles, genres, and mood tags.",
  "Choose whether to publish instantly or pick a scheduled release time.",
  "Describe the track, credit collaborators, and add any useful links or lyrics.",
  "Publish, copy the share link, and post it wherever your listeners hang out."
];

const ForArtists = () => (
  <div style={{ minHeight: "100vh", background: "#101010", display: "flex", flexDirection: "column" }}>
    <Header />
    <main style={{ flex: 1, marginTop: 56, padding: "64px 24px 120px", color: "#f0f0f0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: 1, color: "#ff5500", fontSize: 12 }}>For artists</p>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 600 }}>Release flow</h1>
          <p style={{ margin: 0, fontSize: 16, color: "#c7c7c7", lineHeight: 1.7 }}>
            Use this short checklist each time you prepare a track. Nothing fancy—just the essential steps in plain text.
          </p>
        </section>

        <section>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {steps.map((step, index) => (
              <li key={step} style={{ fontSize: 15, color: "#d2d2d2", lineHeight: 1.6 }}>
                <span style={{ color: "#fff", fontWeight: 600 }}>{`Step ${index + 1}: `}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#fff" }}>Quick navigation</h2>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Upload a track", to: "/upload" },
              { label: "Manage playlists", to: "/profile?tab=playlists" },
              { label: "See community feed", to: "/feed" }
            ].map((link) => (
              <NavLink key={link.label} to={link.to} style={{ color: "#ff5500", textDecoration: "none", fontSize: 15 }}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default ForArtists;
