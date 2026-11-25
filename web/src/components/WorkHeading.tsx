import { useRef } from "react";
import VariableProximity from "../reactbits/VariableProximity";
import SpecLine from "./SpecLine";

export default function WorkHeading() {
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <div className="work-heading">
      {/* React Bits VariableProximity: letters thin out and turn fuchsia near the cursor (Inter Tight's weight axis). */}
      <h2 id="work-title" className="giant" ref={heading}>
        <VariableProximity label="Work" containerRef={heading} fromFontVariationSettings="'wght' 620" toFontVariationSettings="'wght' 140"
          radius={320} falloff="gaussian" toColor="#ff3d9a" idleWave />
        <span className="sr-only">: selected projects and research</span>
      </h2>
      <div className="work-intro">
        <SpecLine a="Claim" b="Evidence" />
        <p className="verbs"><em>Measure</em> <em>Caveat</em> <em>Link</em></p>
        <p>Five projects, each with its evidence open. Every figure links to the repository it came from, and limits sit beside results, not in the footnotes.</p>
      </div>
    </div>
  );
}
