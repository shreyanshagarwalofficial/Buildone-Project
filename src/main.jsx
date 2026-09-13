import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("BuildOne root element is missing.");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
