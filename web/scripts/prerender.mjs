// Render the app to static HTML and inject it into the client build, so the page is
// complete before JavaScript runs (readable without JS, indexable) and React hydrates it.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");
const ssr = join(here, "..", "dist-ssr");
const template = readFileSync(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-html-->")) throw new Error("index.html lost its <!--app-html--> slot");
if (!template.includes("<!-- METADATA:START -->")) throw new Error("index.html lost its METADATA region");
const { render } = await import(pathToFileURL(join(ssr, "entry-server.js")).href);
const html = template.replace("<!--app-html-->", render());
writeFileSync(join(dist, "index.html"), html);
rmSync(ssr, { recursive: true, force: true });
console.log(`Prerendered ${(html.length / 1024).toFixed(1)} KB into dist/index.html`);
