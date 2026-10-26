/* ==========================================================================
   Auth context + hook
   --------------------------------------------------------------------------
   The context object and its consumer live here rather than in
   AuthContext.jsx so that file only exports the provider component — which
   keeps React Fast Refresh working in development, the same reason
   components/common/Icons keeps its registry in its own module.
   ========================================================================== */

import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/** Reads the shared authentication state; must be inside <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>.");
  }
  return context;
}
