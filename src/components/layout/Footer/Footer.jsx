import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import { footer, site } from "../../../data/site";
import { socialIcons } from "../../common/Icons/iconRegistry";
import { ExternalLinkIcon, MailIcon } from "../../common/Icons/Icons";
import { useRevealGroup } from "../../../hooks/useReveal";

function FooterBrand() {
  const [hasImageFailed, setHasImageFailed] = useState(false);

  /* Graceful degradation: fall back to a text wordmark rather than rendering
     nothing if the logo asset can not be decoded. */
  if (hasImageFailed) {
    return <p className="footer-brand-fallback">{footer.brand.name}</p>;
  }

  return (
    <Link to={footer.brand.href} className="footer-brand">
      <span className="logo-frame footer-logo-frame">
        <img
          className="footer-logo"
          src={footer.brand.logo}
          alt={footer.brand.logoAlt}
          decoding="async"
          onError={() => setHasImageFailed(true)}
        />
      </span>
    </Link>
  );
}

export default function Footer() {
  const footerRef = useRef(null);

  useRevealGroup(footerRef, { stagger: 100 });

  return (
    <footer className="footer" ref={footerRef}>
      <div className="container footer-inner">
        <div className="footer-main">
          <div className="footer-about" data-reveal-item>
            <FooterBrand />

            <h2 className="footer-heading footer-about-heading">
              {footer.about.title}
            </h2>

            <p className="footer-about-text">{footer.about.description}</p>

            <a
              className="footer-event-link"
              href={footer.about.eventLink.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{footer.about.eventLink.label}</span>
              <ExternalLinkIcon size={14} />
            </a>
          </div>

          <nav
            className="footer-column"
            aria-labelledby="footer-quick-links-title"
            data-reveal-item
          >
            <h2 id="footer-quick-links-title" className="footer-heading">
              {footer.quickLinksTitle}
            </h2>

            <ul className="footer-link-list">
              {footer.quickLinks.map((link) => (
                <li key={link.id}>
                  <Link to={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-column" data-reveal-item>
            <h2 className="footer-heading">{footer.contactTitle}</h2>

            <ul className="footer-link-list">
              <li>
                <a
                  className="footer-contact-link"
                  href={`mailto:${footer.contact.email}`}
                >
                  <MailIcon size={16} />
                  <span>{footer.contact.email}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column" data-reveal-item>
            <h2 className="footer-heading">{footer.socialTitle}</h2>

            <ul className="footer-socials">
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
                      aria-label={`${site.name} on ${social.label}`}
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="footer-bottom" data-reveal-item>
          <p className="footer-copy">{site.copyright}</p>
          <p className="footer-tagline">{footer.bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}
