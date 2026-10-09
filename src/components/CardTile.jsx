export default function CardTile({ card, highlighted, dimmed, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`${card.name}${card.categories.length ? ` — ${card.categories.join(', ')}` : ''}`}
      className={`relative w-28 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-32 ${
        selected ? '-translate-y-3 border-red-500' : highlighted ? 'border-mint ring-2 ring-mint' : 'border-transparent'
      } ${dimmed ? 'opacity-40' : ''}`}
    >
      {card.image ? (
        <img src={card.image} alt={card.name} className="w-full" loading="lazy" />
      ) : (
        <div className="grid h-40 place-items-center bg-lilac/30 p-2 text-xs">{card.name}</div>
      )}
    </button>
  );
}
