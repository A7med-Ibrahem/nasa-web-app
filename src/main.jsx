import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Order matters: design tokens must be defined before the reset and
// primitives that consume them, and the shared motion layer loads last so it
// can extend component rules without overriding them.
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/animations.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);