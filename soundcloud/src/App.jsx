import React from "react";
import { Routes, Route } from "react-router-dom";
import Main from "./screens/main/main.jsx";
import Profile from "./screens/profile/Profile.jsx";
import NotFound from "./components/404.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:username" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;