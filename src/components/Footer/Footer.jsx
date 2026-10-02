import { useState } from "react";
import "./Footer.css";
import nasaLogo from "../../assets/images/nasa-logo.jpeg";


// تعديل الروابط والمسار 
const links = [
  { label: "Home", href: "/" },
  { label: "Challenges", href: "/challenges" },
  { label: "Live Standings", href: "/standings" },
  { label: "About", href: "/about" },
];

const socials = [
  {
    name: "X",
    href: "https://x.com/",
    icon: (
      <path d="M18.244 2H21.5l-7.1 8.11L22.75 22h-6.54l-5.12-6.7L5.2 22H1.94l7.6-8.68L1.5 2h6.7l4.63 6.12L18.244 2Zm-1.14 18h1.8L7.0 3.9H5.07L17.104 20Z" />
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/",
    icon: (
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-1 1.84-2.04 3.78-2.04 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.69c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48V21h-4V9.75Z" />
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    icon: (
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/",
    icon: (
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.22 22 12 22 12s0-3.22-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    ),
  },
];

function FooterLogo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return ;
  }
  return (
    <img
      className="footer-logo"
      src={nasaLogo}
      alt="NASA Space Apps Hurghada"
      onError={() => setFailed(true)}
    />
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <a href="/" className="footer-brand" aria-label="Home">
            <FooterLogo />
          </a>

          <nav className="footer-nav" aria-label="Footer">
            {links.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="footer-socials">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 NASA Space Apps Hurghada. All rights reserved.</p>
          <p>Space • Science • Technology</p>
        </div>
      </div>
    </footer>
  );
}