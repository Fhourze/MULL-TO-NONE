import { useMemo, useState } from 'react';
import DeckInput from './components/DeckInput';
import DeckList from './components/DeckList';
import MulliganPractice from './components/MulliganPractice';
import StatsPanel from './components/StatsPanel';
import CategoryFilter from './components/CategoryFilter';
import { parseDeckText } from './services/deckParser';
import { importArchidekt, importMoxfield } from './services/deckImport';
import { enrichDeck } from './services/scryfall';
import { categoryCounts } from './utils/stats';

export default function App() {
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = useMemo(() => (deck ? categoryCounts(deck.cards) : {}), [deck]);

  async function loadDeck(mode, value) {
    setLoading(true);
    setError('');
    try {
      const entries =
        mode === 'archidekt' ? await importArchidekt(value) :
        mode === 'moxfield' ? await importMoxfield(value) :
        parseDeckText(value);
      if (!entries.length) throw new Error('No cards found. Use one card per line, like "4 Lightning Bolt".');
      setDeck(await enrichDeck(entries));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-forest px-6 py-5 text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold">MULL TO NONE</h1>
          {deck && (
            <button onClick={() => setDeck(null)} className="rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-forest">
              Change deck
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {!deck ? (
          <DeckInput onSubmit={loadDeck} loading={loading} error={error} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
            <DeckList cards={deck.cards} activeCategory={activeCategory} />
            <div className="space-y-5">
              {deck.missing.length > 0 && (
                <p className="rounded-lg bg-lilac/30 p-3 text-sm">Not found on Scryfall: {deck.missing.join(', ')}</p>
              )}
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-forest">Highlight a category in your hand</h2>
                <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
              </div>
              <MulliganPractice cards={deck.cards} activeCategory={activeCategory} />
              <StatsPanel cards={deck.cards} categories={categories} activeCategory={activeCategory} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
