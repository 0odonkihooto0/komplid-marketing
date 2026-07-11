import { JsonLd } from './JsonLd';

interface Props {
  name: string;
  description: string;
  steps: string[];
}

// HowTo-разметка для калькуляторов («Как рассчитать…») — AEO-сигнал
// в дополнение к FAQPage (план 02-CALCULATORS-PLAN.md §2 п. 4).
export function HowToSchema({ name, description, steps }: Props) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  };

  return <JsonLd data={data} />;
}
