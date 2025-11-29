import React from "react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import SideBar from "./SideBar.jsx";
import Banner from "./Banner.jsx";

const Profile = () => (
  <div style={{
    minHeight: "100vh",
    background: "#141414",
    display: "flex",
    flexDirection: "column"
  }}>
    <Header />
    <div style={{
      marginTop: 56,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "28px 16px",
      boxSizing: "border-box",
      gap: 32
    }}>
      <div style={{ width: "100%", maxWidth: 1240 }}>
        <Banner />
      </div>
      <div style={{ width: "100%", maxWidth: 1240, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 360 }}>
          <SideBar />
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Profile;
