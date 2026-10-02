import "./MainLayout.css";

import Footer from "../../components/layout/Footer/Footer";
import Navbar from "../../components/layout/Navbar/Navbar";

/**
 * Application shell shared by every page.
 *
 * Owns the landmarks (skip link, header, main, footer) and the persistent
 * chrome. Pages supply only their own content, so a future page such as
 * Challenges or Standings automatically inherits the same Navbar and Footer
 * without duplicating anything:
 *
 *   <MainLayout><Challenges /></MainLayout>
 */
export default function MainLayout({ children }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="layout-main">
        {children}
      </main>

      <Footer />
    </>
  );
}