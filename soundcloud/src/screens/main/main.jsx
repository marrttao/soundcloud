import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import SideBar from "./SideBar.jsx";
import Choice from "./Choice.jsx";
import { fetchProfile } from "../../api/profile";

const recentlyPlayed = [
  {
    id: 1,
    image: "https://via.placeholder.com/160x160?text=Track+1",
    title: "Track 1",
    author: "Artist A"
  },
  {
    id: 2,
    image: "https://via.placeholder.com/160x160?text=Track+2",
    title: "Track 2",
    author: "Artist B"
  }
];

const moreOfWhatYouLike = [
  {
    id: 3,
    image: "https://via.placeholder.com/160x160?text=Track+3",
    title: "Track 3",
    author: "Artist C"
  },
  {
    id: 4,
    image: "https://via.placeholder.com/160x160?text=Track+4",
    title: "Track 4",
    author: "Artist D"
  }
];

const Main = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setAvatarUrl(data?.profile?.avatar_url);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
  }, []);

  return (
    <div style={{
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#141414",
    position: "relative"
  }}>
    <Header avatarUrl={avatarUrl} />
    <div style={{
      display: "flex",
      flex: 1,
      marginTop: "56px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "fixed",
        left: 0,
        top: "56px",
        bottom: 0,
        zIndex: 10
      }}>
        <SideBar />
      </div>
      <div
        className="mainContent"
        style={{
          flex: 1,
          marginRight: "360px",
          display: "flex",
          justifyContent: "center",
          padding: "80px 16px",
          minHeight: "calc(100vh - 56px)",
          boxSizing: "border-box"
        }}
      >
        <div style={{ width: "100%", maxWidth: 720 }}>
          <Choice />
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
};

export default Main;