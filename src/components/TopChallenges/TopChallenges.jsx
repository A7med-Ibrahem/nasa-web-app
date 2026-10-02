import "./TopChallenges.css";

import earthImage from "../../assets/images/earth-climate.jpeg";
import spaceImage from "../../assets/images/space-exploration.jpeg";
import technologyImage from "../../assets/images/technology.jpeg";
import sustainabilityImage from "../../assets/images/sustainability.jpeg";

function TopChallenges() {
  const challenges = [
    {
      image: earthImage,
      category: "EARTH & CLIMATE",
      title: "Climate Resilience",
      description:
        "Build solutions to help communities adapt to climate change and natural disasters.",
    },
    {
      image: spaceImage,
      category: "SPACE EXPLORATION",
      title: "Future of Exploration",
      description:
        "Support the next generation of space exploration and human settlement.",
    },
    {
      image: technologyImage,
      category: "TECHNOLOGY",
      title: "Open Data",
      description:
        "Use NASA open data to build tools that improve lives on Earth.",
    },
    {
      image: sustainabilityImage,
      category: "SUSTAINABILITY",
      title: "Sustainable Future",
      description:
        "Develop solutions for a more sustainable and resilient planet.",
    },
  ];

  return (
    <section className="top-challenges">
      <div className="challenges-container">

        <div className="challenges-header">
          <div>
            <p className="challenges-label">
              TOP CHALLENGES
            </p>

            <h2>Explore the Challenges</h2>

            <p className="challenges-description">
              Discover real-world problems and use the power of
              space data to create innovative solutions.
            </p>
          </div>

          <a href="/challenges" className="view-all">
            View All Challenges <span>→</span>
          </a>
        </div>


        <div className="challenge-cards">
          {challenges.map((challenge, index) => (
            <div className="challenge-card" key={index}>

              <div className="challenge-image">
                <img
                  src={challenge.image}
                  alt={challenge.title}
                />
              </div>

              <div className="challenge-info">

                <p className="challenge-category">
                  {challenge.category}
                </p>

                <h3>{challenge.title}</h3>

                <p className="challenge-description">
                  {challenge.description}
                </p>

                <button className="challenge-arrow">
                  →
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TopChallenges;
