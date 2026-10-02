import  "./About.css";
import AboutSpace from "../../assets/images/about-space.jpeg";

<img src={AboutSpace} alt="space station" />

function About() {
  return (
    <section className="About-section" id="about">
      <div className="About-content">

        <div className="About-text">
          <p className="section-label">
            ABOUT NASA SPACE APPS
          </p>

          <h2>
            From data to
            <br />
            impact
          </h2>

          <p className="About-description">
            NASA Space Apps Challenge is a global hackathon that
            invites participants from all backgrounds to use open
            NASA data and technology to solve real-world problems
            on Earth and beyond.
          </p>

          <button className="About-button">
            Learn More <span>→</span>
          </button>
        </div>

        <div className="About-image">
          <img
            src={AboutSpace}
            alt="NASA satellite in space"
          />
        </div>

        <div className="About-stats">

          <div className="stat">
            <div className="stat-icon">♧</div>
            <div>
              <h3>200+</h3>
              <p>Countries & Regions</p>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">♧</div>
            <div>
              <h3>100,000+</h3>
              <p>Participants</p>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">♧</div>
            <div>
              <h3>1,000+</h3>
              <p>Projects</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default About;