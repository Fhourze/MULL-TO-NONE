import { useEffect, useMemo, useState } from 'react';
import { useMulligan } from '../hooks/useMulligan';
import { categoryCounts } from '../utils/stats';
import { LAND, simulateKeep } from '../utils/keepRules';
import CardTile from './CardTile';
import KeepRules from './KeepRules';
import HandAnalysis from './HandAnalysis';

export default function MulliganPractice({ cards, activeCategory }) {
  const { state, deal, keep, mulligan, drawCard, toggleBottom } = useMulligan(cards);
  const [rules, setRules] = useState([{ key: LAND, min: 2, max: 5 }]);
  const [distinct, setDistinct] = useState(true);
  const categories = useMemo(() => categoryCounts(cards), [cards]);
  const probability = useMemo(() => simulateKeep(cards, rules, distinct), [cards, rules, distinct]);

  useEffect(() => deal(0), [deal]);
  if (!state) return null;

  const { hand, mulls, kept, bottom, library, bottomed } = state;
  const holding = kept ? hand : hand.filter((_, i) => !bottom.includes(i)); // minus cards picked for the bottom
  const pool = kept ? library.slice(0, library.length - bottomed) : library; // bottomed cards can't be drawn
  const lands = holding.filter((c) => c.isLand).length;
  const needBottom = !kept && mulls > 0 && bottom.length < mulls;
  const btn = 'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-40';

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-grape p-5 text-white shadow-sm">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold">{kept ? 'Your hand' : 'Opening hand'}</h2>
          <p className="text-sm text-lilac">{holding.length} cards · {lands} lands · mulligans: {mulls}</p>
        </div>

        <div className="flex min-h-44 flex-wrap gap-2">
          {hand.map((c, i) => (
            <CardTile
              key={i}
              card={c}
              selected={bottom.includes(i)}
              highlighted={activeCategory && c.categories.includes(activeCategory)}
              dimmed={activeCategory && !c.categories.includes(activeCategory)}
              onClick={() => toggleBottom(i)}
            />
          ))}
        </div>

        {needBottom && <p className="mt-3 text-sm text-mint">Click {mulls - bottom.length} more card(s) to put on the bottom.</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {!kept ? (
            <>
              <button disabled={needBottom} onClick={keep} className={`${btn} bg-mint text-forest`}>Keep</button>
              <button onClick={mulligan} className={`${btn} bg-lilac text-white hover:bg-lilac/80`}>Mulligan</button>
            </>
          ) : (
            <button disabled={!pool.length} onClick={drawCard} className={`${btn} bg-mint text-forest`}>Draw a card</button>
          )}
          <button onClick={() => deal(0)} className={`${btn} border border-lilac text-lilac hover:bg-white/10`}>New hand</button>
        </div>
      </section>

      <HandAnalysis hand={holding} pool={pool} categories={categories} rules={rules} distinct={distinct} />
      <KeepRules rules={rules} setRules={setRules} distinct={distinct} setDistinct={setDistinct} categories={categories} probability={probability} />
    </div>
  );
}
