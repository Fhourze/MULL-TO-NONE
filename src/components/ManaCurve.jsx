export default function ManaCurve({ curve }) {
  const max = Math.max(1, ...curve.map((b) => b.count));
  return (
    <div className="flex h-32 items-end gap-2">
      {curve.map((b) => (
        <div key={b.cmc} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-zinc-500">{b.count}</span>
          <div className="w-full rounded-t bg-lilac" style={{ height: `${(b.count / max) * 80}px` }} />
          <span className="text-xs font-medium text-grape">{b.cmc === 7 ? '7+' : b.cmc}</span>
        </div>
      ))}
    </div>
  );
}
