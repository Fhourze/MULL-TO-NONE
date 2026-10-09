// Parses plain-text decklists.
// Supported lines:  "4 Lightning Bolt", "1x Sol Ring (C21) 263", "1 Sol Ring #Ramp #Artifact", "1 Sol Ring [Ramp, Artifact]"
// A "Commander" / "Companion" header skips its cards; "Sideboard" and below is ignored.
const STOP = /^(sideboard|maybeboard|considering)/i;

export function parseDeckText(text) {
  const entries = [];
  let skip = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (STOP.test(line)) break;
    if (/^(commander|companion):?$/i.test(line)) { skip = true; continue; }
    if (/^(deck|mainboard):?$/i.test(line)) { skip = false; continue; }
    if (!line) { skip = false; continue; } // a blank line ends the commander block
    if (skip) continue;

    const m = line.match(/^(\d+)x?\s+(.+)$/i);
    if (!m) continue;

    const categories = [];
    let rest = m[2].replace(/#([\w-]+)|\[([^\]]+)\]/g, (_, hash, bracket) => {
      (hash ? [hash] : bracket.split(',')).forEach((c) => categories.push(c.trim()));
      return '';
    });
    rest = rest.replace(/\s+\([A-Za-z0-9]+\)\s*\S*$/, '').trim(); // strip "(SET) 123"
    entries.push({ name: rest, qty: Number(m[1]), categories });
  }
  return entries;
}
