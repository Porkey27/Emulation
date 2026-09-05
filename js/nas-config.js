// Points the frontend at your NAS API instead of the bundled js/data.js.
window.NAS_CONFIG = {
  baseUrl: "https://nas.weenids.co.uk", // your Cloudflare Tunnel hostname
  key: "change-me-to-a-long-random-string", // must match NAS_ACCESS_KEY on the server
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
