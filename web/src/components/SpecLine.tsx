import { useHydrated } from "../lib/hooks";
import DecryptedText from "../reactbits/DecryptedText";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** LABEL ——— LABEL. Decorative (aria-hidden); after hydration each label
 *  decodes once with React Bits' DecryptedText as it scrolls into view. */
export default function SpecLine({ a, b }: { a: string; b: string }) {
  const hydrated = useHydrated();
  const label = (text: string) =>
    hydrated ? <DecryptedText text={text} animateOn="view" sequential revealDirection="start" speed={45} characters={LETTERS} /> : text;
  return (
    <p className="spec-line" aria-hidden="true"><span>{label(a)}</span><span>{label(b)}</span></p>
  );
}
