import React from "react";
import Header from "./Header.jsx";
import { Link } from "react-router-dom";

const NotFound = () => {

  return (
    <>
      <Header />
    <div style={{
      minHeight: "calc(100vh - 56px)",
      background: "#111111",
      paddingTop: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        padding: "60px 32px",
        textAlign: "center",
        color: "#f5f5f5"
      }}>
        <p style={{
          fontSize: 14,
          letterSpacing: "0.4em",
          marginBottom: 20,
          color: "#909090"
        }}>404</p>
        <h1 style={{
          fontSize: 64,
          margin: "0 0 12px",
          fontWeight: 500
        }}>Page not found</h1>
        <p style={{
          fontSize: 16,
          color: "#b0b0b0",
          marginBottom: 32
        }}>
          Looks like this track took a different route. Head back to the main page to keep listening.
        </p>
        <Link to="/" style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 24px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#f5f5f5",
          textDecoration: "none",
          fontWeight: 500
        }}>
          Back to home
        </Link>
      </div>
    </div>
  </>
  );
};

export default NotFound;
