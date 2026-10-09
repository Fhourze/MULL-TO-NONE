export const expand = (cards) => cards.flatMap((c) => Array.from({ length: c.qty }, () => c));
export const totalCards = (cards) => cards.reduce((s, c) => s + c.qty, 0);
export const landCount = (cards) => cards.filter((c) => c.isLand).reduce((s, c) => s + c.qty, 0);

export function avgCmc(cards) {
  const spells = expand(cards).filter((c) => !c.isLand);
  return spells.length ? spells.reduce((s, c) => s + c.cmc, 0) / spells.length : 0;
}

export function manaCurve(cards) {
  const buckets = Array.from({ length: 8 }, (_, cmc) => ({ cmc, count: 0 }));
  expand(cards).filter((c) => !c.isLand).forEach((c) => (buckets[Math.min(c.cmc, 7)].count += 1));
  return buckets;
}

// category -> copies in deck (a card with 2 categories counts toward both)
export function categoryCounts(cards) {
  const map = {};
  cards.forEach((c) => c.categories.forEach((cat) => (map[cat] = (map[cat] ?? 0) + c.qty)));
  return map;
}

// Hypergeometric: N = deck size, K = successes in deck, n = cards seen, k = wanted
const choose = (n, k) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
};
export const pmf = (N, K, n, k) => (choose(K, k) * choose(N - K, n - k)) / choose(N, n);
export const probBetween = (N, K, n, lo, hi) => {
  let p = 0;
  for (let k = lo; k <= Math.min(hi, K, n); k++) p += pmf(N, K, n, k);
  return p;
};
export const probAtLeast = (N, K, n, k) => probBetween(N, K, n, k, n);
