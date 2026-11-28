import ScrollVelocity from "../reactbits/ScrollVelocity";
import { useReduced } from "../lib/hooks";

const METHODS = ["Differential privacy", "Face verification", "NLP ranking", "PySpark", "Power BI & DAX", "PostgreSQL", "Monte Carlo", "TensorFlow", "Calibration"];
const VERBS = ["Measure", "Audit", "Rank", "Reconcile", "Benchmark", "Simulate", "Ship", "Caveat"];

const Row = ({ items }: { items: string[] }) => <>{items.map((item) => <span key={item} className="marquee-item">{item}</span>)}</>;

/** Two rows of real methods and verbs (React Bits ScrollVelocity). Scroll speed
 *  drives their speed, skew and direction; you can also drag them. */
export default function Marquee() {
  const reduced = useReduced();
  return (
    <div className="marquee" aria-hidden="true">
      <ScrollVelocity
        texts={[<Row items={METHODS} />, <Row items={VERBS} />]}
        velocity={reduced ? 0 : 60}
        numCopies={3}
        damping={50}
        stiffness={400}
        velocityMapping={{ input: [0, 1000], output: [0, 4] }}
        skewWithVelocity={6}
        outlineAlternate
        draggable
        separator={<span className="marquee-sep" />}
        parallaxClassName="marquee-row"
        scrollerClassName="marquee-track"
      />
    </div>
  );
}
