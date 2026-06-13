// Общие inline-иконки для списков фич в тарифах (Pricing, RolePricing).
// Раньше CheckIcon/CrossIcon дублировались в каждом блоке один-в-один.

interface IconProps {
  size?: number;
}

export const CheckIcon = ({ size = 12 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const CrossIcon = ({ size = 12 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
);
