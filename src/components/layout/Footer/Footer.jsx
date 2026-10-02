import { useRef, useState } from "react";
import "./Footer.css";

import { footer, site } from "../../../data/site";
import { socialIcons } from "../../common/Icons/iconRegistry";
import { useRevealGroup } from "../../../hooks/useReveal";

function FooterBrand() {
  const [hasImageFailed, setHasImageFailed] = useState(false);

  /* Graceful degradation: fall back to a text wordmark rather than rendering
     nothing if the logo asset can not be decoded. */
  if (hasImageFailed) {
    return <p className="footer-brand-fallback">{footer.brand.name}</p>;
  }

  return (
    <a href={footer.brand.href} className="footer-brand">
      <span className="logo-frame footer-logo-frame">
        <img
          className="footer-logo"
          src={footer.brand.logo}
          alt={footer.brand.logoAlt}
          decoding="async"
          onError={() => setHasImageFailed(true)}
        />
      </span>
    </a>
  );
}

export default function Footer() {
  const footerRef = useRef(null);

  useRevealGroup(footerRef, { stagger: 100 });

  return (
    <footer className="footer" ref={footerRef}>
      <div className="container footer-inner">
        <div className="footer-top">
          <FooterBrand />

          <nav className="footer-nav" aria-label="Footer navigation" data-reveal-item>
            <ul className="footer-nav-list">
              {footer.links.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="footer-nav-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="footer-socials" data-reveal-item>
            {footer.socials.map((social) => {
              const Icon = socialIcons[social.icon];
              if (!Icon) return null;

              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    className="footer-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon />
                    <span className="visually-hidden">
                      {site.name} on {social.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="footer-bottom" data-reveal-item>
          <p className="footer-copy">{site.copyright}</p>
          <p className="footer-tagline">{footer.bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}