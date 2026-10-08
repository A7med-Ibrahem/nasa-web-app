import "./LoginHero.css";

import { loginIcons } from "../../common/Icons/iconRegistry";
import { loginPage } from "../../../data/loginData";

/**
 * Left half of the login screen: eyebrow, the page's single <h1>, intro copy
 * and the three portal features.
 *
 * Reveal orchestration lives on the page (one staggered cascade across the
 * intro and the card), so this component is markup + content only. Feature
 * icons come from the icon registry by data key — no icon package.
 */
export default function LoginHero() {
  const { eyebrow, titleLines, description, features } = loginPage.hero;

  return (
    <section className="login-hero" aria-labelledby="login-title">
      <p className="eyebrow login-hero-eyebrow" data-reveal-item>
        {eyebrow}
      </p>

      <h1 className="login-hero-title" id="login-title" data-reveal-item>
        {titleLines.map((line) => (
          <span className="login-hero-title-line" key={line}>
            {line}
          </span>
        ))}
      </h1>

      <p className="login-hero-description" data-reveal-item>
        {description}
      </p>

      <ul className="login-features" data-reveal-item>
        {features.map((feature) => {
          const FeatureIcon = loginIcons[feature.icon];

          return (
            <li className="login-feature" key={feature.id}>
              <span className="login-feature-icon">
                <FeatureIcon size={19} />
              </span>
              <span className="login-feature-text">
                {feature.lines.map((line) => (
                  <span className="login-feature-line" key={line}>
                    {line}
                  </span>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
