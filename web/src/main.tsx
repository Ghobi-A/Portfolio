import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root")!;
// The production page is prerendered, so hydrate it; the dev server starts empty.
if (root.firstElementChild) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
