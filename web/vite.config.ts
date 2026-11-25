import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works under GitHub Pages' /Portfolio/ prefix and in previews.
// Bundles go to dist/app/ so they never collide with the site's own assets/ folder.
export default defineConfig({
  base: "./",
  plugins: [react()],
  publicDir: false,
  build: { outDir: "dist", assetsDir: "app", emptyOutDir: true, target: "es2020" },
});
