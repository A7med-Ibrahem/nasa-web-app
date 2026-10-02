import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import CurrentEvent from "./components/CurrentEvent/CurrentEvent";
import TopChallenges from "./components/TopChallenges/TopChallenges";
import PreviousEvents from "./components/PreviousEvents/PreviousEvents";
import CoreTeam from "./components/CoreTeam/CoreTeam";
import Sponsors from "./components/Sponsors/Sponsors";
import Footer from "./components/Footer/Footer";



function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <CurrentEvent />
      <TopChallenges />
      <PreviousEvents />
      <CoreTeam />
      <Sponsors />
      <Footer />
    </>
  );
}

export default App;