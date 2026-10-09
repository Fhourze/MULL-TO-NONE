export default function DeckList({ cards, activeCategory }) {
  const groups = { Lands: [], Spells: [] };
  cards.forEach((c) => groups[c.isLand ? 'Lands' : 'Spells'].push(c));

  return (
    <aside className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-display text-xl font-bold text-grape">Decklist</h2>
      {Object.entries(groups).map(([title, list]) => (
        <div key={title} className="mb-4">
          <h3 className="mb-1 text-sm font-semibold text-forest">
            {title} ({list.reduce((s, c) => s + c.qty, 0)})
          </h3>
          <ul className="space-y-0.5 text-sm">
            {[...list]
              .sort((a, b) => a.cmc - b.cmc || a.name.localeCompare(b.name))
              .map((c) => (
                <li
                  key={c.name}
                  className={`flex justify-between gap-2 rounded px-1 ${
                    activeCategory && c.categories.includes(activeCategory) ? 'bg-mint/40' : ''
                  }`}
                >
                  <span>{c.qty} {c.name}</span>
                  <span className="text-right text-xs text-zinc-400">{c.categories.join(', ')}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
