import { expand } from './stats';

// A rule is { key, min, max }. key is LAND or a category name.
export const LAND = '__land';
export const labelOf = (key) => (key === LAND ? 'Land' : key);
export const has = (card, key) => (key === LAND ? card.isLand : card.categories.includes(key));

// Can every required slot be filled by a different card? (small backtracking search)
function assignable(hand, slots, i = 0, used = new Set()) {
  if (i === slots.length) return true;
  for (let h = 0; h < hand.length; h++) {
    if (used.has(h) || !has(hand[h], slots[i])) continue;
    used.add(h);
    if (assignable(hand, slots, i + 1, used)) return true;
    used.delete(h);
  }
  return false;
}

// distinct = true: one card can only satisfy one requirement (a Ramp+Draw card fills Ramp OR Draw, not both)
export function checkRules(hand, rules, distinct) {
  const results = rules.map((r) => {
    const have = hand.filter((c) => has(c, r.key)).length;
    return { ...r, have, ok: have >= r.min && have <= r.max };
  });
  let ok = results.every((r) => r.ok);
  if (ok && distinct) ok = assignable(hand, rules.flatMap((r) => Array(r.min).fill(r.key)));
  return { ok, results };
}

// Monte Carlo: handles overlapping categories exactly where closed-form math can't.
export function simulateKeep(cards, rules, distinct, trials = 20000) {
  const deck = expand(cards);
  if (deck.length < 7 || !rules.length) return null;
  let hits = 0;
  for (let t = 0; t < trials; t++) {
    for (let i = 0; i < 7; i++) {
      const j = i + Math.floor(Math.random() * (deck.length - i));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (checkRules(deck.slice(0, 7), rules, distinct).ok) hits++;
  }
  return hits / trials;
}

// Keeps rules inside a 7-card hand. With `distinct` on, each card fills one requirement,
// so the minimums can't add up past 7 and a rule's max is 7 minus the other rules' minimums.
export function normalize(rules, distinct) {
  let budget = 7;
  const mins = rules.map((r) => {
    const m = Math.max(0, Math.min(r.min, distinct ? budget : 7));
    if (distinct) budget -= m;
    return m;
  });
  const total = mins.reduce((s, m) => s + m, 0);
  return rules.map((r, i) => {
    const cap = distinct ? 7 - (total - mins[i]) : 7;
    return { ...r, min: mins[i], max: Math.max(mins[i], Math.min(r.max, cap)) };
  });
}
