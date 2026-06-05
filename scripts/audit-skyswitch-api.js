#!/usr/bin/env node
/**
 * Compare apiDocumentation.md SkySwitch paths vs portal /api/pbx proxy registry.
 * Run: npm run audit:skyswitch
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  SKYSWITCH_API_REGISTRY,
  SKYSWITCH_OUT_OF_SCOPE,
} from "../server/services/skyswitch/apiRegistry.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const doc = fs.readFileSync(path.join(root, "apiDocumentation.md"), "utf8");

const docPaths = [
  ...new Set([...doc.matchAll(/"(\/[^"]+)":\s*\{/g)].map((m) => m[1])),
].sort();
const accountPaths = docPaths.filter((p) => p.includes("{account_id}"));

const implementedSkyswitch = new Set(
  SKYSWITCH_API_REGISTRY.flatMap((r) =>
    r.skyswitch.includes("multiple") || r.skyswitch.includes("|")
      ? []
      : [
          r.skyswitch
            .replace("GET ", "")
            .replace("POST ", "")
            .replace("PUT ", "")
            .replace("DELETE ", "")
            .replace("{id}", "{account_id}"),
        ],
  ),
);

const pbxDocPaths = accountPaths.filter((p) => p.includes("/pbx"));

console.log("=== SkySwitch API audit ===\n");
console.log(`Documentation paths (total):     ${docPaths.length}`);
console.log(`Account-scoped paths:            ${accountPaths.length}`);
console.log(`PBX paths in documentation:      ${pbxDocPaths.length}`);
console.log(
  `Portal proxy routes registered:  ${SKYSWITCH_API_REGISTRY.length}`,
);
console.log("\nPBX paths in apiDocumentation.md:");
for (const p of pbxDocPaths) {
  const suffix = p.replace("/accounts/{account_id}", "");
  const covered = SKYSWITCH_API_REGISTRY.some((r) =>
    r.skyswitch.includes(suffix),
  );
  console.log(`  ${covered ? "✓" : "○"} ${p}`);
}

console.log("\nOut of portal scope (by design):");
for (const area of SKYSWITCH_OUT_OF_SCOPE) console.log(`  - ${area}`);

console.log(
  "\nOAuth scopes referenced in doc: account, pbx, routing, e911, report, log, messaging, …",
);
console.log("Set SKYSWITCH_SCOPE=* or list required scopes in .env");
