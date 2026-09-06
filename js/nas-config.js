// Points the frontend at your NAS API instead of the bundled js/data.js.
window.NAS_CONFIG = {
  baseUrl: "https://nas.weenids.co.uk", // your Cloudflare Tunnel hostname
  key: "ffa152f3b5f1918f9129f5aaa7a2a8764a75b255b2e9b081", // must match NAS_ACCESS_KEY on the server
  // Which BIOS file (inside a "BIOS" folder on the NAS, alongside your
  // system folders) to use for each core that requires one. Only these
  // four cores need a BIOS at all — everything else is left out on
  // purpose. Filenames must match EmulatorJS's exact expected names (see
  // "BIOS files" in the README) — these are just the placeholders/most
  // common region; change them if your discs are a different region.
  bios: {
    psx: "scph5501.bin", // US PS1 BIOS — use scph5500.bin (JP) or scph5502.bin (EU) if that's your region
    segaCD: "bios_CD_U.bin", // US Sega CD BIOS — bios_CD_E.bin (EU) / bios_CD_J.bin (JP)
    segaSaturn: "saturn_bios.bin", // single BIOS, no region variants
    "3do": "panafz10.bin", // pick whichever 3DO BIOS variant you actually have
  },
};

// Loads <baseUrl>/data.js from the NAS (which defines SYSTEMS + getSystem(),
// same shape as the old committed js/data.js), then runs `then`.
function loadNasData(then) {
  const cfg = window.NAS_CONFIG;
  const s = document.createElement("script");
  s.src = `${cfg.baseUrl}/data.js?key=${encodeURIComponent(cfg.key)}`;
  s.onload = then;
  s.onerror = () => {
    console.error("Could not reach NAS games API at", cfg.baseUrl);
    // Fallback stubs so pages that expect SYSTEMS/getSystem() degrade to an
    // empty-state render instead of throwing a ReferenceError.
    if (typeof window.SYSTEMS === "undefined") window.SYSTEMS = [];
    if (typeof window.getSystem === "undefined") window.getSystem = () => undefined;
    then();
  };
  document.head.appendChild(s);
}
