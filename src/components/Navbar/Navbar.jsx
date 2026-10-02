import "./Navbar.css";
import nasaLogo from "../../assets/images/nasa-logo.jpeg";

function Navbar() {
  return (
    <nav className="navbar">
      
      <a href="/" className="navbar-logo">
        <img src={nasaLogo} alt="NASA Space Apps Hurghada" />
      </a>

      <div className="navbar-links">
        <a href="/" >
          Home
        </a>

        <a href="/challenges">
          Challenges
        </a>

        <a href="/standings">
          Live Standings
        </a>

        <a href="#about">
          About
        </a>
      </div>

      <a href="/standings" className="navbar-standings">
        <span></span>
        Live Standings
      </a>

    </nav>
  );
}

export default Navbar;