// Reads the text of a public ManaBox deck page (https://manabox.app/decks/<id>).
// The page lists cards under type headings, each card as: quantity, then name (shown twice, once per view mode).
const HEADINGS = new Set([
  'Commander', 'Planeswalker', 'Planeswalkers', 'Creature', 'Creatures', 'Artifact', 'Artifacts',
  'Instant', 'Instants', 'Sorcery', 'Sorceries', 'Enchantment', 'Enchantments', 'Land', 'Lands',
  'Battle', 'Battles', 'Sideboard', 'Maybeboard',
]);
const EXCLUDED = new Set(['Commander', 'Sideboard', 'Maybeboard']); // not part of the library
const UI_TEXT = /^(Download|Get the app|Group by|Sort by|View mode)$|^\d+ \/ \d+ cards|^\d+\/\d+\/\d+$/;

export function parseManaboxHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const tokens = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement?.closest('script,style,noscript')) continue;
    const t = n.textContent.trim();
    if (t) tokens.push(t);
  }

  const start = Math.max(tokens.indexOf('View mode'), tokens.indexOf('Download')) + 1;
  const end = tokens.lastIndexOf('Mana Value'); // footer stats
  const body = tokens.slice(start, end > start ? end : undefined);

  const entries = [];
  let section = null;
  let qty = null;
  let seen = new Set();

  for (const t of body) {
    if (UI_TEXT.test(t)) continue;
    if (HEADINGS.has(t)) { section = t; qty = null; seen = new Set(); continue; }
    if (/^\d+$/.test(t)) { qty = Number(t); continue; } // section count, then card quantity: last one wins
    if (t.length === 1 || qty === null) continue; // single-letter flags, stray text
    if (section && !EXCLUDED.has(section) && !seen.has(t)) {
      seen.add(t);
      entries.push({ name: t, qty, categories: [] });
    }
    qty = null;
  }
  return entries;
}
