import React from "react";
import { Routes, Route } from "react-router-dom";
import Main from "./screens/main/main.jsx";
import FeedPage from "./screens/feed/FeedPage.jsx";
import Profile from "./screens/profile/Profile.jsx";
import NotFound from "./components/404.jsx";
import PlaylistPage from "./screens/playlist/PlaylistPage.jsx";
import Library from "./screens/main/Library.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    <Route path="/library" element={<Library />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:username" element={<Profile />} />
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/playlists/:playlistId" element={<PlaylistPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;