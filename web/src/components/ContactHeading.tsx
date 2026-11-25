import { useRef } from "react";
import VariableProximity from "../reactbits/VariableProximity";

/** "Let's talk." with React Bits VariableProximity: weight follows the cursor. */
export default function ContactHeading() {
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <h2 ref={heading}>
      <VariableProximity label="Let’s" containerRef={heading} fromFontVariationSettings="'wght' 600" toFontVariationSettings="'wght' 150"
        radius={300} falloff="gaussian" idleWave />{" "}
      <em><VariableProximity label="talk." containerRef={heading} fromFontVariationSettings="'wght' 300" toFontVariationSettings="'wght' 900"
        radius={300} falloff="gaussian" idleWave /></em>
    </h2>
  );
}
