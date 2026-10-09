// Enriches [{ name, qty, categories }] with Scryfall data via the /cards/collection endpoint.
const API = 'https://api.scryfall.com/cards/collection';

const imageOf = (c) => (c.image_uris ?? c.card_faces?.[0]?.image_uris)?.normal ?? null;
// Scryfall's collection endpoint matches the front face of MDFC / split cards, not "A // B"
const front = (name) => name.split(' // ')[0].trim().toLowerCase();

export async function enrichDeck(entries) {
  const unique = [...new Map(entries.map((e) => [front(e.name), e.name.split(' // ')[0].trim()])).values()];
  const found = new Map();
  const missing = [];

  for (let i = 0; i < unique.length; i += 75) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiers: unique.slice(i, i + 75).map((name) => ({ name })) }),
    });
    if (!res.ok) throw new Error('Scryfall request failed. Try again in a moment.');
    const json = await res.json();
    json.data.forEach((c) => found.set(front(c.name), c));
    json.not_found.forEach((n) => missing.push(n.name));
  }

  const cards = entries
    .map((e) => {
      const sc = found.get(front(e.name));
      if (!sc) return null;
      return {
        name: sc.name,
        qty: e.qty,
        categories: e.categories,
        cmc: sc.cmc,
        typeLine: sc.type_line,
        // Lands, plus modal DFCs with a land on the back (e.g. Bala Ged Recovery // Bala Ged Sanctuary)
        isLand: /\bLand\b/.test(sc.layout === 'modal_dfc' ? sc.type_line : sc.type_line.split(' // ')[0]),
        image: imageOf(sc),
      };
    })
    .filter(Boolean);

  return { cards, missing };
}
