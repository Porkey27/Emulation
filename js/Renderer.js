/**
 * Renders a grid of tiles. Used identically by systems.html (list of consoles)
 * and console.html (list of games for one console) — same markup, same CSS,
 * different data source.
 *
 * items: array of { title, image, sub, accent, href }
 */
function renderGrid(container, items) {
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "NO ENTRIES YET";
    container.appendChild(empty);
    return;
  }

  for (const item of items) {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = item.href;
    tile.style.setProperty("--tile-accent", item.accent || "#39ff88");

    const art = document.createElement("div");
    art.className = "tile-art";
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;
      art.appendChild(img);
    } else {
      const ph = document.createElement("span");
      ph.className = "placeholder";
      ph.textContent = "IMAGE";
      art.appendChild(ph);
    }
    const glyph = document.createElement("span");
    glyph.className = "glyph";
    glyph.textContent = "▸";
    art.appendChild(glyph);

    const label = document.createElement("div");
    label.className = "tile-label";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.title;
    const sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = item.sub;
    label.appendChild(title);
    label.appendChild(sub);

    tile.appendChild(art);
    tile.appendChild(label);
    container.appendChild(tile);
  }
}
