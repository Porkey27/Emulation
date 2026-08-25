# Emulation frontend

## Adding a game

1. Drop the ROM file into `ROMS/<system>/` (e.g. `ROMS/snes/EarthBound.sfc`).
2. Run:
   ```
   node tools/generate.js
   ```
3. Commit. That's it — `js/data.js` is regenerated from what's on disk,
   and the tile shows up pointing at `/player.html?system=snes&rom=EarthBound.sfc`.

The game's title is guessed from the filename (`ChronoTrigger.sfc` ->
"Chrono Trigger"). To override it, or to point at custom art, add a
`titles.json` file in that system's folder:

```json
{
  "EarthBound.sfc": { "title": "EarthBound", "image": "/img/earthbound.jpg" }
}
```

## Adding a new system

1. Create `ROMS/<newsystem>/` and drop ROMs in it. An empty folder is
   ignored — the system won't appear on the site until it has at least
   one ROM.
2. If `<newsystem>` isn't already listed in `SYSTEM_META` inside
   `tools/generate.js`, add an entry there for a proper display name,
   accent color, and EmulatorJS core id — otherwise a generic fallback
   is generated automatically from the folder name.
3. Run `node tools/generate.js`.

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
