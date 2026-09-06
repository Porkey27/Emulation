# Emulation frontend

## Adding a game

Open an issue and if apporved it will be added

## Files

- `js/data.js` — **auto-generated, don't hand-edit.** Read by
  `systems.html`, `console.html`, and `player.html` to render the grids
  and launch games. Only includes systems that currently have ROMs.
- `tools/generate.js` — the generator (Node, no dependencies). Scans
  `ROMS/*` and writes `js/data.js` only — there's nothing else to generate,
  and no per-system or per-game HTML files.
- `player.html` — the one generic EmulatorJS launcher page. Every game
  tile links here as `/player.html?system=<id>&rom=<filename>`; it looks
  the game up in `js/data.js`, points EmulatorJS at
  `/ROMS/<system>/<filename>`, and boots it.
