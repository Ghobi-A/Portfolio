import "./styles/privacy-chart.css";
import "./styles/lab.css";
import { useEffect } from "react";
import Choreography from "./components/Choreography";
import CollectionRail from "./components/CollectionRail";
import Cursor from "./components/Cursor";
import Featured from "./components/Featured";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import SmoothScroll from "./components/SmoothScroll";
import Statement from "./components/Statement";
import WorkHeading from "./components/WorkHeading";
import ContactBody from "./content/ContactBody";
import Projects from "./content/Projects";
import Sections from "./content/Sections";
import { initEvidence } from "./lib/evidence";
import { initPrivacyCharts } from "./lib/privacyChart";

export default function App() {
  // The evidence figures (case-study disclosures, method inspectors, the privacy
  // and partition charts) enhance the prerendered markup once React has hydrated.
  useEffect(() => {
    const stopCharts = initPrivacyCharts();
    const stopEvidence = initEvidence();
    return () => { stopEvidence(); stopCharts(); };
  }, []);

  return (
    <SmoothScroll>
      <a className="skip-link" href="#projects">Skip to selected work</a>
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        <Statement />
        <div className="work-layout">
          <CollectionRail />
          <section id="projects" className="section" aria-labelledby="work-title">
            <WorkHeading />
            <Featured />
            <Projects />
          </section>
        </div>
        <Sections />
      </main>
      <footer id="contact" className="contact"><ContactBody /></footer>
      <Cursor />
      <Choreography />
    </SmoothScroll>
  );
}
