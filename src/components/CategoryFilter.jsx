export default function CategoryFilter({ categories, active, onChange }) {
  const names = Object.keys(categories).sort();
  if (!names.length) return <p className="text-sm text-zinc-500">No categories found in this deck.</p>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((n) => (
        <button
          key={n}
          onClick={() => onChange(active === n ? null : n)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            active === n ? 'bg-forest text-white' : 'bg-mint/40 text-forest hover:bg-mint/70'
          }`}
        >
          {n} <span className="opacity-60">{categories[n]}</span>
        </button>
      ))}
    </div>
  );
}
