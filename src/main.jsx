import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Order matters: design tokens must be defined before the reset and
// primitives that consume them, and the shared motion layer loads last so it
// can extend component rules without overriding them.
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/animations.css";

import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* The router wraps the app, not MainLayout, so navigating between pages
        never unmounts the shared shell. AuthProvider sits above the router so
        the session is restored once and every route (including /login) can
        read the same authentication state. */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);