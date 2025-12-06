import React from "react";
import { Routes, Route } from "react-router-dom";
import Main from "./screens/main/main.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    {/* ...удалите/закомментируйте другие страницы, если не нужны... */}
  </Routes>
);

export default App;