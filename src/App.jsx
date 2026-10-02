import MainLayout from "./layouts/MainLayout/MainLayout";
import Home from "./pages/Home/Home";

/**
 * Application composition point.
 *
 * Deliberately minimal: it selects which page is rendered inside the shared
 * shell. When page routing is introduced, only this file changes — wrap the
 * page in the router and map paths to pages in pages/. No section, style or
 * data file needs to move.
 */
function App() {
  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}

export default App;