import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout/MainLayout";
import ParticipantLayout from "./layouts/ParticipantLayout/ParticipantLayout";
import StaffLayout from "./layouts/StaffLayout/StaffLayout";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import RequireAuth from "./auth/RequireAuth";
import DataState from "./components/common/DataState/DataState";
import ChallengeDetails from "./pages/ChallengeDetails/ChallengeDetails";
import Challenges from "./pages/Challenges/Challenges";
import GameLeaderboard from "./pages/GameLeaderboard/GameLeaderboard";
import Home from "./pages/Home/Home";
import LiveStandings from "./pages/LiveStandings/LiveStandings";
import Login from "./pages/Login/Login";
import SeasonMedia from "./pages/SeasonMedia/SeasonMedia";
import Sponsors from "./pages/Sponsors/Sponsors";
import TeamDetails from "./pages/TeamDetails/TeamDetails";
import Teams from "./pages/Teams/Teams";

/* The public pages above stay eager: they are the first paint and the shared
   marketing surface. Everything behind a role gate is a separate chunk, so an
   anonymous visitor never downloads the staff, judge, participant or admin
   dashboards. One Suspense boundary (below) shows the existing DataState
   spinner while the requested chunk arrives. */
const JudgeDashboard = lazy(() =>
  import("./pages/JudgeDashboard/JudgeDashboard"),
);
const JudgeEvaluation = lazy(() =>
  import("./pages/JudgeEvaluation/JudgeEvaluation"),
);
const ParticipantDashboard = lazy(() =>
  import("./pages/ParticipantDashboard/ParticipantDashboard"),
);
const ParticipantGame = lazy(() =>
  import("./pages/ParticipantGame/ParticipantGame"),
);
const ParticipantRequests = lazy(() =>
  import("./pages/ParticipantRequests/ParticipantRequests"),
);
const StaffAttendanceCheckIn = lazy(() =>
  import("./pages/StaffAttendanceCheckIn/StaffAttendanceCheckIn"),
);
const StaffAttendanceRecords = lazy(() =>
  import("./pages/StaffAttendanceRecords/StaffAttendanceRecords"),
);
const StaffRequests = lazy(() =>
  import("./pages/StaffRequests/StaffRequests"),
);
const StaffTeams = lazy(() => import("./pages/StaffTeams/StaffTeams"));
const AdminStaff = lazy(() => import("./pages/AdminStaff/AdminStaff"));
const AdminSponsors = lazy(() =>
  import("./pages/AdminSponsors/AdminSponsors"),
);
const AdminCriteria = lazy(() => import("./pages/AdminCriteria/AdminCriteria"));
const AdminPublishing = lazy(() =>
  import("./pages/AdminPublishing/AdminPublishing"),
);
const AdminQuestions = lazy(() =>
  import("./pages/AdminQuestions/AdminQuestions"),
);

function RouteFallback() {
  return (
    <div className="container">
      <DataState status="loading" title="Loading page…" tone="dark" />
    </div>
  );
}

/**
 * Application composition point.
 *
 * MainLayout is a layout route, so the Navbar, skip link and Footer are mounted
 * once and survive every navigation — pages are swapped inside <main> without
 * remounting the shared chrome. Adding a page means adding a <Route> here and a
 * file in pages/; no section, style or data file moves.
 *
 * The one exception is /login: a full-screen login experience with its own
 * compact header, so it sits beside the layout route instead of inside it.
 *
 * The /judge area is wrapped in RequireAuth: an unauthenticated visitor is
 * sent to /login (remembering the route they asked for) and an authenticated
 * account without the Judge role is shown an access-denied panel instead of
 * the dashboard. The role itself always comes from the backend session.
 */
function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* Static listing and dynamic details are sibling routes: the
              literal path wins for /challenges, :challengeId catches everything
              below it, and neither shadows the other. */}
          <Route path="challenges" element={<Challenges />} />
          <Route path="challenges/:challengeId" element={<ChallengeDetails />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:teamId" element={<TeamDetails />} />
          <Route path="sponsors" element={<Sponsors />} />
          <Route path="season-media" element={<SeasonMedia />} />
          <Route path="leaderboard/game" element={<GameLeaderboard />} />
          <Route path="live-standings" element={<LiveStandings />} />

          <Route
            path="admin"
            element={
              <RequireAuth requiredRole="Admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="staff" replace />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="sponsors" element={<AdminSponsors />} />
            <Route path="criteria" element={<AdminCriteria />} />
            <Route path="criteria/publish" element={<AdminPublishing />} />
            <Route path="questions" element={<AdminQuestions />} />
          </Route>

          <Route
            path="judge"
            element={
              <RequireAuth requiredRole="Judge">
                <JudgeDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="judge/teams/:teamId/evaluate"
            element={
              <RequireAuth requiredRole="Judge">
                <JudgeEvaluation />
              </RequireAuth>
            }
          />

          <Route
            path="staff"
            element={
              <RequireAuth requiredRole={["Admin", "CoreTeam", "Judge"]}>
                <StaffLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="requests" replace />} />
            <Route path="requests" element={<StaffRequests />} />
            <Route path="attendance" element={<StaffAttendanceRecords />} />
            <Route
              path="attendance/check-in"
              element={
                <RequireAuth requiredRole="CoreTeam">
                  <StaffAttendanceCheckIn />
                </RequireAuth>
              }
            />
            <Route path="teams" element={<StaffTeams />} />
          </Route>

          <Route
            path="participant"
            element={
              <RequireAuth requiredRole="Participant">
                <ParticipantLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParticipantDashboard />} />
            <Route path="game" element={<ParticipantGame />} />
            <Route path="requests" element={<ParticipantRequests />} />
          </Route>

          {/* Pages still to be built keep the shell and land on Home for now,
              rather than 404ing on a link that is already in the chrome. */}
          <Route path="about" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;