import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Main from "./screens/main/main.jsx";
import Profile from "./screens/profile/Profile.jsx";
import LandingPage from "./screens/main/LandingPage.jsx";
import Upload from "./screens/upload/upload.jsx";
import NotFound from "./components/404.jsx";
import { readAuthFlag } from "./utils/authFlag";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => readAuthFlag());
  const location = useLocation();

  React.useEffect(() => {
    setIsAuthenticated(readAuthFlag());
  }, [location.key]);

  React.useEffect(() => {
    const handleStorage = () => setIsAuthenticated(readAuthFlag());
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const renderMain = isAuthenticated ? <Main /> : <LandingPage />;

  return (
    <Routes>
      <Route path="/" element={renderMain} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <LandingPage />} />
      <Route path="/profile/:username" element={isAuthenticated ? <Profile /> : <LandingPage />} />
      <Route path="/upload" element={isAuthenticated ? <Upload /> : <LandingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;