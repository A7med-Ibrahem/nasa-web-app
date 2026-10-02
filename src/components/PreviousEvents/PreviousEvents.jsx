import "./PreviousEvents.css";

function PreviousEvents() {
  const events = [
    {
      year: "2025",
      title: "NASA Space Apps Hurghada 2025",
      description:
        "A global hackathon bringing together innovators to solve challenges using NASA open data.",
    },
    {
      year: "2024",
      title: "NASA Space Apps Hurghada 2024",
      description:
        "Participants collaborated, created, and developed innovative solutions for real-world challenges.",
    },
  ];

  return (
    <section className="previous-events">
      <div className="previous-events-container">

        <div className="previous-events-header">
          <div>
            <p className="previous-events-label">
              PREVIOUS EVENTS
            </p>

            <h2>Past Seasons</h2>

            <p className="previous-events-description">
              Explore our previous NASA Space Apps Hurghada events
              and discover the ideas and projects created by our
              community.
            </p>
          </div>
        </div>

        <div className="events-list">
          {events.map((event) => (
            <div className="event-card" key={event.year}>

              <div className="event-year">
                {event.year}
              </div>

              <div className="event-info">
                <h3>{event.title}</h3>

                <p>{event.description}</p>

                <a href={`/events/${event.year}`}>
                <button className="event-button">
                  View Event
                </button>
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default PreviousEvents;