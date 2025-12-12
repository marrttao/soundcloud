import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import SideBar from "./SideBar.jsx";
import Choice from "./Choice.jsx";
import useBreakpoint from "../../hooks/useBreakpoint";
import { fetchProfile } from "../../api/profile";

const SIDEBAR_WIDTH = 360;

const Main = () => {
  const isMobile = useBreakpoint(768);
  const showSidebar = !isMobile;
  const headerOffset = isMobile ? 64 : 56;
  const [mobileSidebarData, setMobileSidebarData] = useState({ tracks: [], artists: [] });
  const [mobileSidebarLoading, setMobileSidebarLoading] = useState(false);

  useEffect(() => {
    if (showSidebar) {
      return;
    }

    let alive = true;
    const loadSidebarData = async () => {
      setMobileSidebarLoading(true);
      try {
        const profile = await fetchProfile();
        if (!alive) {
          return;
        }
        setMobileSidebarData({
          tracks: Array.isArray(profile?.likes) ? profile.likes : [],
          artists: Array.isArray(profile?.following) ? profile.following : []
        });
      } catch (error) {
        console.error("Failed to load profile suggestions for mobile", error);
        if (alive) {
          setMobileSidebarData({ tracks: [], artists: [] });
        }
      } finally {
        if (alive) {
          setMobileSidebarLoading(false);
        }
      }
    };

    loadSidebarData();

    return () => {
      alive = false;
    };
  }, [showSidebar]);

  return (
    <div style={{
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#141414",
    position: "relative",
    overflowX: "hidden"
  }}>
    <Header />
    <div style={{
      display: "flex",
      flex: 1,
      width: "100%",
      marginTop: `${headerOffset}px`,
      position: "relative",
      overflow: "visible",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingLeft: showSidebar ? `${SIDEBAR_WIDTH}px` : 0,
      boxSizing: "border-box"
    }}>
      {showSidebar && (
        <div style={{
          position: "fixed",
          left: 0,
          top: `${headerOffset}px`,
          bottom: 0,
          zIndex: 10,
          width: `${SIDEBAR_WIDTH}px`,
          overflowY: "auto"
        }}>
          <SideBar />
        </div>
      )}
      <div
        className="mainContent"
        style={{
          flex: 1,
          width: "100%",
          maxWidth: showSidebar ? 980 : 760,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile ? "72px 16px 140px" : "96px 32px 160px",
          minHeight: `calc(100vh - ${headerOffset}px)`,
          boxSizing: "border-box",
          gap: isMobile ? 24 : 40
        }}
      >
        <div style={{ width: "100%", maxWidth: isMobile ? "100%" : 760, display: "flex", flexDirection: "column", gap: isMobile ? 24 : 36 }}>
          <Choice title={showSidebar ? "Recently Played" : "Fresh artists & tracks"} />
          {!showSidebar && (
              <Choice
                title="Artists & tracks you might like"
                dataSource="custom"
                customTracks={mobileSidebarData.tracks}
                customArtists={mobileSidebarData.artists}
                customLoading={mobileSidebarLoading}
              />
          )}
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
};

export default Main;