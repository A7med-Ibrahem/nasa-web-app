import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-small-title">NASA SPACE APPS HURGHADA</p> 

        <h1>
          Big Challenges.
          <br />
          Bigger Impact.
        </h1>

        <p className="hero-description">
          NASA Space Apps Hurghada is a global hackathon that brings together innovators, creators, and problem-solvers to tackle real-world challenges using space data.
        </p>

        <div className="hero-buttons">
          <button className="hero-primary-btn">
            Explore Challenges <span>→</span>
          </button>

          <button className="hero-secondary-btn">
            Learn More 
          </button>
        </div>
      </div>

    
    </section>
  );
}

export default Hero;