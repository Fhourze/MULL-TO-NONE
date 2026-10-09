import { useMemo, useState } from 'react';
import { avgCmc, landCount, manaCurve, probAtLeast, probBetween, totalCards } from '../utils/stats';
import { pct } from '../utils/format';
import ManaCurve from './ManaCurve';

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-cream p-3">
    <p className="text-xs text-zinc-500">{label}</p>
    <p className="font-display text-2xl font-bold text-forest">{value}</p>
  </div>
);

export default function StatsPanel({ cards, categories, activeCategory }) {
  const [range, setRange] = useState({ lo: 2, hi: 5 });
  const [onPlay, setOnPlay] = useState(true);

  const N = totalCards(cards);
  const L = landCount(cards);
  const curve = useMemo(() => manaCurve(cards), [cards]);
  const seen = (t) => 7 + (onPlay ? t - 1 : t);
  const input = 'w-14 rounded border border-grape/30 bg-cream px-2 py-1 text-sm';

  return (
    <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-bold text-grape">Deck stats</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Cards" value={N} />
        <Stat label="Lands" value={`${L} (${pct(L / N)})`} />
        <Stat label="Avg. mana value" value={avgCmc(cards).toFixed(2)} />
        <Stat label="Spells" value={N - L} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-forest">Mana curve (nonland)</h3>
        <ManaCurve curve={curve} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-forest">Opening hand</h3>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          Keepable with
          <input type="number" min={0} max={7} value={range.lo} className={input} onChange={(e) => setRange({ ...range, lo: +e.target.value })} />
          to
          <input type="number" min={0} max={7} value={range.hi} className={input} onChange={(e) => setRange({ ...range, hi: +e.target.value })} />
          lands:
          <b className="text-grape">{pct(probBetween(N, L, 7, range.lo, range.hi))}</b>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <span key={k}>{k} lands: {pct(probBetween(N, L, 7, k, k))}</span>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-forest">Hitting land drops</h3>
          <button onClick={() => setOnPlay(!onPlay)} className="rounded-full bg-lilac/20 px-3 py-1 text-xs font-medium text-grape">
            {onPlay ? 'On the play' : 'On the draw'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm sm:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((t) => (
            <div key={t} className="rounded bg-cream p-2">
              <p className="text-xs text-zinc-500">Turn {t}</p>
              <p className="font-semibold text-grape">{pct(probAtLeast(N, L, seen(t), t))}</p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-500">Chance of having at least as many lands as the turn number (no mulligans).</p>
      </div>

      {Object.keys(categories).length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-forest">Chance of at least 1 in the opening 7</h3>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {Object.entries(categories).sort().map(([name, K]) => (
              <li key={name} className={`flex justify-between rounded px-2 py-1 ${activeCategory === name ? 'bg-mint/40' : ''}`}>
                <span>{name} ({K})</span>
                <b className="text-grape">{pct(probAtLeast(N, K, 7, 1))}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
