import React from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";

const TryArtistPro = () => (
  <div style={{ minHeight: "100vh", background: "#141414", display: "flex", flexDirection: "column" }}>
    <Header />
    <main style={{ flex: 1, marginTop: 56, padding: "64px 24px 120px", color: "#f0f0f0" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: 1, color: "#ff5500", fontSize: 12 }}>Artist Pro</p>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 600 }}>All features remain free.</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#c7c7c7" }}>
          Upload without limits, see live analytics, collaborate with teams, and schedule releases at no cost. The platform
          stays open so you can focus on the music instead of managing subscriptions.
        </p>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {["Unlimited uploads", "Real-time stats", "Playlist and collaboration tools", "Hi-res artwork hosting", "Community feedback loops", "API access for automation"].map((item) => (
            <li key={item} style={{ fontSize: 15, color: "#d8d8d8" }}>
              {item}
            </li>
          ))}
        </ul>
        <p style={{ margin: 0, fontSize: 14, color: "#aaaaaa" }}>
          That is the entire pitch: no tiers, no upsell, just the tools you already use.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default TryArtistPro;
