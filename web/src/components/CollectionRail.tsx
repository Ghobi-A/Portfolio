import Roll from "./Roll";

export const RAIL = [
  ["#file-dp", "DP—05", "Privacy audit"],
  ["#file-kh4", "KH—01", "Demand intelligence"],
  ["#GA-RA-07", "RA—07", "Restaurant operations"],
  ["#file-di", "DI—02", "Image ML"],
  ["#file-cd", "CD—03", "Crestbound"],
  ["#experimental", "CA—06", "Audio lab"],
] as const;

/** Sticky project rail. The current item is tracked by lib/evidence.ts. */
export default function CollectionRail() {
  return (
    <nav className="collection-index" aria-label="Project collection">
      {RAIL.map(([href, code, name], index) => (
        <a key={href} href={href} aria-current={index === 0 ? "location" : undefined}><b>{code}</b><Roll>{name}</Roll></a>
      ))}
    </nav>
  );
}
