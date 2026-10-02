import "./CurrentEvent.css";

function CurrentEvent() {
  return (
    <section className="current-event">
      <div className="current-event-content">

        <div className="current-event-text">
          <p className="current-event-label">
            CURRENT EVENT
          </p>

          <h2>
            NASA Space Apps Hurghada 2026
          </h2>

          <p className="current-event-description">
            Join us for an exciting journey of innovation, collaboration,
            and impact. Take on NASA challenges and help build a better
            future — on Earth and beyond.
          </p>

          <div className="event-details">
            <div className="event-detail">
              <span>▣</span>
              <p>April 24 – 26, 2026</p>
            </div>

            <div className="event-detail">
              <span>⌖</span>
              <p>Hurghada, Egypt</p>
            </div>
          </div>
        </div>

        <div className="current-event-image">
          <div className="event-logo">
            <p>NASA</p>
            <h3>SPACE APPS</h3>
            <span>HURGHADA</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default CurrentEvent;