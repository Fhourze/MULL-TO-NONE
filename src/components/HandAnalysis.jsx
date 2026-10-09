import { useState } from 'react';
import { LAND, checkRules, has, labelOf } from '../utils/keepRules';
import { probAtLeast } from '../utils/stats';
import { pct } from '../utils/format';

// hand: cards you're holding · pool: cards you can still draw (library minus bottomed cards)
export default function HandAnalysis({ hand, pool, categories, rules, distinct }) {
  const [x, setX] = useState(3);
  const draws = Math.min(x, pool.length);
  const verdict = checkRules(hand, rules, distinct);

  const keys = [LAND, ...Object.keys(categories).sort()];
  const rows = keys
    .map((key) => ({
      key,
      inHand: hand.filter((c) => has(c, key)).length,
      left: pool.filter((c) => has(c, key)).length,
    }))
    .filter((r) => r.inHand || r.left);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-grape">This hand</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${verdict.ok ? 'bg-mint text-forest' : 'bg-red-100 text-red-700'}`}>
          {verdict.ok ? 'Meets your keep rule' : 'Fails your keep rule'}
        </span>
      </div>

      <ul className="mb-4 flex flex-wrap gap-2 text-xs">
        {verdict.results.map((r) => (
          <li key={r.key} className={`rounded-full px-3 py-1 ${r.ok ? 'bg-mint/40 text-forest' : 'bg-red-100 text-red-700'}`}>
            {labelOf(r.key)}: {r.have} (need {r.min}–{r.max})
          </li>
        ))}
      </ul>

      <label className="mb-3 flex items-center gap-3 text-sm">
        Next draws: <b className="w-5 text-grape">{draws}</b>
        <input type="range" min={1} max={10} value={x} onChange={(e) => setX(+e.target.value)} className="accent-grape" />
      </label>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500">
              <th className="py-1">Type</th>
              <th>In hand</th>
              <th>In library</th>
              <th>Draw ≥1 in {draws}</th>
              <th>Expected</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-grape/10">
                <td className="py-1 font-medium text-forest">{labelOf(r.key)}</td>
                <td>{r.inHand}</td>
                <td>{r.left}</td>
                <td className="font-semibold text-grape">{pct(probAtLeast(pool.length, r.left, draws, 1))}</td>
                <td>{((draws * r.left) / Math.max(1, pool.length)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
