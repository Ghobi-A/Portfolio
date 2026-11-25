/** Letter roll on hover: the label slides up and a fuchsia copy rises in.
 *  The copy is CSS-generated with empty alternative text, so it is read once. */
export default function Roll({ children }: { children: string }) {
  return <span className="roll"><span data-text={children}>{children}</span></span>;
}
