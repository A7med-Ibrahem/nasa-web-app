import { useState } from "react";
import "./Sponsors.css";

// المسار محتاج يتعدل
const sponsors = [
  { name: "NASA", logo: "/sponsors/nasa.png" },
  { name: "Microsoft", logo: "/sponsors/microsoft.png" },
  { name: "Google", logo: "/sponsors/google.png" },
  { name: "Intel", logo: "/sponsors/intel.png" },
  { name: "AWS", logo: "/sponsors/aws.png" },
  { name: "Esri", logo: "/sponsors/esri.png" },
];

function SponsorLogo({ name, logo }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="sponsor-logo">
      {failed ? (
      //لو الصورة مش موجودة يظهر اسم الراعي بدل الأيقونة 
        <span className="sponsor-fallback">{name}</span>
      ) : (
        <img src={logo} alt={name} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export default function Sponsors() {
  return (
    <section className="sponsors">
      <div className="sponsors-inner">
        <div className="sponsors-text">
          <span className="sponsors-eyebrow">OUR SPONSORS</span>
          <h2 className="sponsors-title">With thanks to our sponsors</h2>
          <p className="sponsors-desc">
            We're grateful to our partners and supporters who make this event
            possible.
          </p>
          <a href="/sponsors" className="sponsors-btn">
            View All Sponsors <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="sponsors-grid">
          {sponsors.map((s) => (
            <SponsorLogo key={s.name} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}