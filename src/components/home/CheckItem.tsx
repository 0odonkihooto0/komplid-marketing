/** Пункт списка возможностей с амбровой галочкой — повторяется во всех тарифах. */
export function CheckItem({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 14 : 15;

  return (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: size === 'sm' ? 13 : 13.5, lineHeight: 1.45, color: 'var(--t2)' }}>
      <span
        className="check-mark"
        aria-hidden="true"
        style={{ marginTop: 3, width: box, height: box, fontSize: size === 'sm' ? 8.5 : 9 }}
      >
        ✓
      </span>
      {text}
    </div>
  );
}
