interface Logo {
  name: string;
}

interface SocialProofProps {
  label?: string;
  logos?: Logo[];
}

const DEFAULT_LOGOS: Logo[] = [
  { name: 'СевЗапСтрой' },
  { name: 'Строй-Инвест' },
  { name: 'МонолитСпец' },
  { name: 'ФасадПлюс' },
  { name: 'Архитектон-М' },
  { name: 'ТеплоИнж' },
];

export function SocialProof({
  label = 'Доверяют подрядчики и заказчики',
  logos = DEFAULT_LOGOS,
}: SocialProofProps) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-inset)',
        padding: '24px 0',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-mute)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            flexWrap: 'wrap',
            color: 'var(--ink-mute)',
          }}
        >
          {logos.map((logo) => (
            <span
              key={logo.name}
              style={{
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: '-0.01em',
                opacity: 0.75,
              }}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
