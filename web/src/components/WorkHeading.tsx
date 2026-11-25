import SpecLine from "./SpecLine";

export default function WorkHeading() {
  return (
    <div className="work-heading">
      <h2 id="work-title" className="giant">Work<span className="sr-only">: selected projects and research</span></h2>
      <div className="work-intro">
        <SpecLine a="Claim" b="Evidence" />
        <p className="verbs"><em>Measure</em> <em>Caveat</em> <em>Link</em></p>
        <p>Five projects, each with its evidence open. Every figure links to the repository it came from, and limits sit beside results, not in the footnotes.</p>
      </div>
    </div>
  );
}
