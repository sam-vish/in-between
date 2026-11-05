// Bundles the pixel world so the HyperFrames compositions run the same code as the site.
import { build } from "esbuild";
import { mkdirSync } from "node:fs";

for (const dir of ["hero", "clips"]) {
  mkdirSync(`video/${dir}/assets`, { recursive: true });
  await build({
  entryPoints: ["src/world/engine.ts"],
  bundle: true,
  format: "iife",
  globalName: "IB",
  target: "es2020",
  outfile: `video/${dir}/assets/world.js`,
  logLevel: "info",
  });
}
