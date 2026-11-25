import { useEffect, useRef, useState } from "react";
import { useHydrated } from "../lib/hooks";
import Roll from "./Roll";

const LINKS = [
  ["#projects", "Work"],
  ["#GA-DP-05", "Research"],
  ["#about", "About"],
  ["assets/Ghobikan-Aravindan-CV.pdf", "CV ↗"],
] as const;

export default function Header() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("nav-enhanced");
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen((was) => { if (was) button.current?.focus(); return false; }); } };
    const onClick = (event: MouseEvent) => { if (!header.current?.contains(event.target as Node)) close(); };
    const media = window.matchMedia("(max-width: 760px)");
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    media.addEventListener("change", close);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); media.removeEventListener("change", close); };
  }, []);

  return (
    <header className="header" ref={header} onBlur={(event) => { if (event.relatedTarget && !header.current?.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="Ghobikan Aravindan, back to top">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-wordmark">Ghobikan Aravindan</span>
        </a>
        <button ref={button} className="menu-button" type="button" aria-expanded={open} aria-controls="primary-nav" hidden={!hydrated} onClick={() => setOpen((was) => !was)}>
          Menu <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        <nav id="primary-nav" aria-label="Primary navigation" className={open ? "is-open" : undefined} onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>
          {LINKS.map(([href, label]) => <a key={href} href={href}><Roll>{label}</Roll></a>)}
          <a className="nav-contact" href="#contact"><span aria-hidden="true">+</span> Get in touch</a>
        </nav>
      </div>
    </header>
  );
}
