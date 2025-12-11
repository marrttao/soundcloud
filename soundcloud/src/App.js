import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Main from "./screens/main/main.jsx";
import Profile from "./screens/profile/Profile.jsx";
import LandingPage from "./screens/main/LandingPage.jsx";
import FeedPage from "./screens/feed/FeedPage.jsx";
import Upload from "./screens/upload/upload.jsx";
import NotFound from "./components/404.jsx";
import TrackPage from "./screens/track/TrackPage.jsx";
import PlaylistPage from "./screens/playlist/PlaylistPage.jsx";
import Library from "./screens/main/Library.jsx";
import TryArtistPro from "./screens/info/TryArtistPro.jsx";
import ForArtists from "./screens/info/ForArtists.jsx";
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
      <Route path="/feed" element={isAuthenticated ? <FeedPage /> : <LandingPage />} />
      <Route path="/library" element={isAuthenticated ? <Library /> : <LandingPage />} />
      <Route path="/upload" element={isAuthenticated ? <Upload /> : <LandingPage />} />
      <Route path="/tracks/:trackId" element={isAuthenticated ? <TrackPage /> : <LandingPage />} />
      <Route path="/playlists/:playlistId" element={isAuthenticated ? <PlaylistPage /> : <LandingPage />} />
      <Route path="/artist-pro" element={isAuthenticated ? <TryArtistPro /> : <LandingPage />} />
      <Route path="/for-artists" element={isAuthenticated ? <ForArtists /> : <LandingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;