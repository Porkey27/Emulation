#!/usr/bin/env node
/**
 * Scans ROMS/<system>/ folders and writes js/data.js — the SYSTEMS array
 * both systems.html and console.html render from. A system folder with no
 * ROMs in it is skipped entirely (it won't appear on the site until a ROM
 * is added). Games are played through the single generic
 * /player.html?system=<id>&rom=<filename> — there's nothing else to
 * generate per system or per game, just this one file.
 *
 * Adding a game = drop the ROM file in the right ROMS/<system>/ folder and
 * rerun this script (`node tools/generate.js`). Nothing else to edit.
 *
 * Adding a whole new system = create ROMS/<newsystem>/ and drop ROMs in it.
 * If <newsystem> isn't in SYSTEM_META below, a best-effort fallback entry is
 * generated automatically (folder name used as both the EJS core and the
 * display name) — add a proper entry to SYSTEM_META for a nicer label/accent.
 *
 * Per-game overrides: if ROMS/<system>/titles.json exists, it can map a ROM
 * filename to a custom { "title": "...", "image": "..." }, e.g.:
 *   { "DonkeyKongCountry.sfc": { "title": "Donkey Kong Country" } }
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ROMS_DIR = path.join(ROOT, "ROMS");
const DATA_JS = path.join(ROOT, "js", "data.js");

// Known systems: folder name -> metadata. Unknown folders still work via
// the fallback further down, just with a generic label/accent.
const SYSTEM_META = {
  snes: { name: "Super Nintendo", short: "SNES", core: "snes", accent: "#7c5cff" },
  nes: { name: "Nintendo Entertainment System", short: "NES", core: "nes", accent: "#e8e8e0" },
  n64: { name: "Nintendo 64", short: "N64", core: "n64", accent: "#39ff88" },
  megadrive: { name: "Sega Mega Drive / Genesis", short: "Megadrive", core: "segaMD", accent: "#3ddc97" },
  genesis: { name: "Sega Genesis", short: "Genesis", core: "segaMD", accent: "#3ddc97" },
  ps1: { name: "PlayStation", short: "PS1", core: "psx", accent: "#ffb000" },
  psx: { name: "PlayStation", short: "PS1", core: "psx", accent: "#ffb000" },
  gba: { name: "Game Boy Advance", short: "GBA", core: "gba", accent: "#ffd966" },
  gb: { name: "Game Boy / Color", short: "GB", core: "gb", accent: "#8bc34a" },
  gbc: { name: "Game Boy Color", short: "GBC", core: "gb", accent: "#8bc34a" },
};

// Files to ignore when scanning a system folder for ROMs.
const IGNORE_EXT = new Set([".html", ".json"]);
const IGNORE_NAMES = new Set([".DS_Store"]);

function metaFor(folderName) {
  const known = SYSTEM_META[folderName.toLowerCase()];
  if (known) return known;
  // Fallback for a folder the script doesn't know about yet.
  return {
    name: folderName,
    short: folderName,
    core: folderName.toLowerCase(),
    accent: "#8a9490",
  };
}

// "DonkeyKongCountry" -> "Donkey Kong Country", "chrono_trigger" -> "Chrono Trigger"
function titleFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, "");
  let words = base.replace(/[_-]+/g, " ").trim();
  if (!words.includes(" ")) {
    // split camelCase boundaries: DonkeyKongCountry -> Donkey Kong Country
    words = words.replace(/([a-z])([A-Z])/g, "$1 $2");
    // only split a trailing number off if there's a lowercase letter earlier
    // (mario64 -> mario 64) — leave pure acronym+number alone (SM64 stays SM64)
    if (/[a-z]/.test(words)) {
      words = words.replace(/([A-Za-z])(\d)/g, "$1 $2");
    }
  }
  return words
    .split(/\s+/)
    .map((w) => (w === w.toLowerCase() ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")
    .trim();
}

function loadOverrides(systemDir) {
  const p = path.join(systemDir, "titles.json");
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    console.warn(`  ! could not parse ${p}: ${err.message}`);
    return {};
  }
}

function main() {
  if (!fs.existsSync(ROMS_DIR)) {
    console.error(`ROMS/ folder not found at ${ROMS_DIR}`);
    process.exit(1);
  }

  const systemFolders = fs
    .readdirSync(ROMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const systems = [];

  for (const folder of systemFolders) {
    const systemDir = path.join(ROMS_DIR, folder);
    const meta = metaFor(folder);
    const overrides = loadOverrides(systemDir);

    const romFiles = fs
      .readdirSync(systemDir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => !IGNORE_NAMES.has(name) && !IGNORE_EXT.has(path.extname(name).toLowerCase()))
      .sort();

    if (romFiles.length === 0) {
      console.log(`${folder}: 0 game(s) — skipped, no ROMs`);
      continue;
    }

    const games = romFiles.map((filename) => {
      const override = overrides[filename] || {};
      const title = override.title || titleFromFilename(filename);
      return {
        title,
        image: override.image || "",
        rom: filename, // resolved at play time to /ROMS/<system>/<rom>
      };
    });

    systems.push({
      id: folder,
      name: meta.name,
      short: meta.short,
      core: meta.core,
      emulator: `EmulatorJS \u00b7 ${meta.core} core`,
      accent: meta.accent,
      image: "",
      games,
    });

    console.log(`${folder}: ${games.length} game(s)`);
  }

  const body = systems
    .map(
      (s) => `  {
    id: ${JSON.stringify(s.id)},
    name: ${JSON.stringify(s.name)},
    short: ${JSON.stringify(s.short)},
    core: ${JSON.stringify(s.core)},
    emulator: ${JSON.stringify(s.emulator)},
    accent: ${JSON.stringify(s.accent)},
    image: ${JSON.stringify(s.image)},
    games: [${
      s.games.length === 0
        ? ""
        : "\n" +
          s.games
            .map(
              (g) =>
                `      { title: ${JSON.stringify(g.title)}, image: ${JSON.stringify(g.image)}, rom: ${JSON.stringify(
                  g.rom
                )} },`
            )
            .join("\n") +
          "\n    "
    }],
  },`
    )
    .join("\n");

  const output = `// AUTO-GENERATED by tools/generate.js — do not hand-edit.
// To add a game: drop the ROM file in ROMS/<system>/ and run:
//   node tools/generate.js
// To add a system: create ROMS/<newsystem>/, optionally add it to
// SYSTEM_META in tools/generate.js for a nicer name/accent, then run it.
// Games are played via the generic /player.html?system=<id>&rom=<filename>.

const SYSTEMS = [
${body}
];

// Lookup helper used by console.html and player.html
function getSystem(id) {
  return SYSTEMS.find((s) => s.id === id);
}
`;

  fs.writeFileSync(DATA_JS, output);
  console.log(`\nWrote js/data.js (${systems.length} systems)`);
}

main();
