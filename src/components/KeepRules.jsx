import { LAND, labelOf, normalize } from '../utils/keepRules';
import { pct } from '../utils/format';

export default function KeepRules({ rules, setRules, distinct, setDistinct, categories, probability }) {
  const options = [LAND, ...Object.keys(categories).sort()];
  const unused = options.find((o) => !rules.some((r) => r.key === o));
  const totalMin = rules.reduce((s, r) => s + r.min, 0);
  const capFor = (r) => (distinct ? 7 - (totalMin - r.min) : 7); // 7 minus the other rules' minimums

  const apply = (next, d = distinct) => setRules(normalize(next, d));
  const update = (i, patch) => apply(rules.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const toggleDistinct = (v) => {
    setDistinct(v);
    apply(rules, v);
  };

  const field = 'rounded border border-grape/30 bg-cream px-2 py-1 text-sm';
  const num = (v) => Math.max(0, Number(v) || 0);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-grape">Keep rule</h2>
        <p className="text-sm">
          Chance a 7-card hand qualifies: <b className="text-forest">{probability == null ? '—' : pct(probability)}</b>
        </p>
      </div>

      <div className="space-y-2">
        {rules.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span>Between</span>
            <input type="number" min={0} max={capFor(r)} className={`${field} w-14`} value={r.min}
              onChange={(e) => update(i, { min: num(e.target.value) })} />
            <span>and</span>
            <input type="number" min={r.min} max={capFor(r)} className={`${field} w-14`} value={r.max}
              title={`Highest allowed: ${capFor(r)}`}
              onChange={(e) => update(i, { max: num(e.target.value) })} />
            <select className={field} value={r.key} onChange={(e) => update(i, { key: e.target.value })}>
              {options.map((o) => (
                <option key={o} value={o}>{labelOf(o)}</option>
              ))}
            </select>
            <span className="text-xs text-zinc-400">up to {capFor(r)}</span>
            <button onClick={() => apply(rules.filter((_, j) => j !== i))} className="text-xs text-zinc-400 hover:text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button
          disabled={!unused || (distinct && totalMin >= 7)}
          onClick={() => apply([...rules, { key: unused, min: 1, max: 7 }])}
          className="rounded-lg bg-forest px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Add requirement
        </button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={distinct} onChange={(e) => toggleDistinct(e.target.checked)} />
          Each card counts toward one requirement only
        </label>
      </div>
    </section>
  );
}
