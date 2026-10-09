import { useState } from 'react';

const MODES = [
  { id: 'text', label: 'Paste list' },
  { id: 'archidekt', label: 'Archidekt link', placeholder: 'https://archidekt.com/decks/...' },
  // { id: 'manabox', label: 'ManaBox link', placeholder: 'https://manabox.app/decks/...' },
  // { id: 'moxfield', label: 'Moxfield link', placeholder: 'https://moxfield.com/decks/...' },
];

export default function DeckInput({ onSubmit, loading, error }) {
  const [mode, setMode] = useState('text');
  const [value, setValue] = useState('');
  const current = MODES.find((m) => m.id === mode);

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border-2 border-grape/20 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              mode === m.id ? 'bg-grape text-white' : 'bg-lilac/20 text-grape hover:bg-lilac/40'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={12}
          placeholder={'1 Sol Ring #Ramp\n4 Lightning Bolt [Removal, Burn]\n24 Mountain'}
          className="w-full rounded-lg border border-grape/30 bg-cream p-3 font-mono text-sm focus:outline-2 focus:outline-lilac"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={current.placeholder}
          className="w-full rounded-lg border border-grape/30 bg-cream p-3 text-sm focus:outline-2 focus:outline-lilac"
        />
      )}

      {mode === 'moxfield' && (
        <p className="mt-2 text-xs text-zinc-500">
          Moxfield often blocks link imports. If it fails, export the deck on Moxfield and use Paste list.
        </p>
      )}
      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}

      <button
        disabled={loading || !value.trim()}
        onClick={() => onSubmit(mode, value.trim())}
        className="mt-4 rounded-lg bg-forest px-5 py-2.5 font-semibold text-white transition hover:bg-forest/90 disabled:opacity-40"
      >
        {loading ? 'Loading deck…' : 'Load deck'}
      </button>
    </section>
  );
}
