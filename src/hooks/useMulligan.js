import { useCallback, useState } from 'react';
import { expand } from '../utils/stats';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// London mulligan: draw 7 every time, then bottom one card per mulligan taken.
// `bottomed` = how many cards at the end of `library` are the ones put on the bottom.
export function useMulligan(cards) {
  const [state, setState] = useState(null);

  const deal = useCallback(
    (mulls = 0) => {
      const deck = shuffle(expand(cards));
      setState({ hand: deck.slice(0, 7), library: deck.slice(7), bottom: [], bottomed: 0, mulls, kept: false });
    },
    [cards]
  );

  const toggleBottom = (i) =>
    setState((s) => {
      if (s.kept) return s;
      const on = s.bottom.includes(i);
      if (!on && s.bottom.length >= s.mulls) return s;
      return { ...s, bottom: on ? s.bottom.filter((x) => x !== i) : [...s.bottom, i] };
    });

  const keep = () =>
    setState((s) => ({
      ...s,
      kept: true,
      hand: s.hand.filter((_, i) => !s.bottom.includes(i)),
      library: [...s.library, ...s.bottom.map((i) => s.hand[i])],
      bottomed: s.bottom.length,
      bottom: [],
    }));

  const mulligan = () => state && deal(state.mulls + 1);
  const drawCard = () =>
    setState((s) => (s.library.length ? { ...s, hand: [...s.hand, s.library[0]], library: s.library.slice(1) } : s));

  return { state, deal, keep, mulligan, drawCard, toggleBottom };
}
