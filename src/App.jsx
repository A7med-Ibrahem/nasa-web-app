import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";
import ChallengeDetails from "./pages/ChallengeDetails/ChallengeDetails";
import Challenges from "./pages/Challenges/Challenges";
import Home from "./pages/Home/Home";
import LiveStandings from "./pages/LiveStandings/LiveStandings";

/**
 * Application composition point.
 *
 * MainLayout is a layout route, so the Navbar, skip link and Footer are mounted
 * once and survive every navigation — pages are swapped inside <main> without
 * remounting the shared chrome. Adding a page means adding a <Route> here and a
 * file in pages/; no section, style or data file moves.
 */
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        {/* Static listing and dynamic details are sibling routes: the
            literal path wins for /challenges, :slug catches everything
            below it, and neither shadows the other. */}
        <Route path="challenges" element={<Challenges />} />
        <Route path="challenges/:slug" element={<ChallengeDetails />} />
        <Route path="live-standings" element={<LiveStandings />} />
        {/* Pages still to be built keep the shell and land on Home for now,
            rather than 404ing on a link that is already in the chrome. */}
        <Route path="about" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;