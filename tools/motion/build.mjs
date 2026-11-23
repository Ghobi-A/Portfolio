// Build-time only. Regenerates committed runtime files so GitHub Pages needs no npm step:
//   assets/js/lab-scene.js          tree-shaken, minified Three.js hero sculpture (ES module)
//   assets/vendor/gsap/*.min.js     GSAP core + the plugins motion.js uses
//   assets/vendor/lenis/lenis.min.js  Lenis smooth scrolling (MIT)
// Usage: cd tools/motion && npm ci && npm run build
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const threeVersion = JSON.parse(readFileSync(join(here, "node_modules/three/package.json"))).version;
const gsapVersion = JSON.parse(readFileSync(join(here, "node_modules/gsap/package.json"))).version;

const field = join(root, "assets/js/lab-scene.js");
await build({
  entryPoints: [join(here, "lab-scene.src.js")],
  outfile: field,
  bundle: true,
  format: "esm",
  minify: true,
  target: ["es2020"],
  legalComments: "none",
  banner: { js: `/* Portfolio lab sculpture. Built from tools/motion/lab-scene.src.js with three.js r${threeVersion.split(".")[1]} (MIT, (c) 2010-2025 three.js authors). */` },
});

const vendor = join(root, "assets/vendor/gsap");
mkdirSync(vendor, { recursive: true });
for (const file of ["gsap.min.js", "CustomEase.min.js", "ScrollTrigger.min.js", "SplitText.min.js"]) {
  copyFileSync(join(here, "node_modules/gsap/dist", file), join(vendor, file));
}
writeFileSync(join(vendor, "LICENSE.md"),
  `GSAP ${gsapVersion} is distributed under GreenSock's Standard "no charge" license:\nhttps://gsap.com/standard-license\n\nThese files are unmodified copies of gsap/dist from npm, vendored so the site loads no remote script.\n`);

const lenisVersion = JSON.parse(readFileSync(join(here, "node_modules/lenis/package.json"))).version;
const lenisDir = join(root, "assets/vendor/lenis");
mkdirSync(lenisDir, { recursive: true });
copyFileSync(join(here, "node_modules/lenis/dist/lenis.min.js"), join(lenisDir, "lenis.min.js"));
copyFileSync(join(here, "node_modules/lenis/LICENSE"), join(lenisDir, "LICENSE"));
writeFileSync(join(lenisDir, "VERSION"), `lenis ${lenisVersion}\n`);

for (const file of [field, join(lenisDir, "lenis.min.js"), ...["gsap.min.js", "CustomEase.min.js", "ScrollTrigger.min.js", "SplitText.min.js"].map((f) => join(vendor, f))]) {
  const bytes = readFileSync(file);
  console.log(`${file.replace(root + "/", "").padEnd(40)} ${(statSync(file).size / 1024).toFixed(1).padStart(7)} KB  ${(gzipSync(bytes).length / 1024).toFixed(1).padStart(6)} KB gzip`);
}
