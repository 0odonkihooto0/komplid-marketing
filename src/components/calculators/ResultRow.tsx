// Строка результата в панели виджета — вынесена из AvansCalculator,
// используется всеми калькуляторами (DRY, CLAUDE.md §10).
export function ResultRow({
  label,
  value,
  accent,
  large,
}: {
  label: string;
  value: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
      <strong
        style={{
          fontSize: large ? 20 : accent ? 16 : 14,
          color: accent || large ? 'var(--accent-strong)' : 'var(--ink)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  );
}
