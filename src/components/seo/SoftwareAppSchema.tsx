import { JsonLd } from './JsonLd';

interface Price {
  amount: number;
  currency: string;
  period?: string;
}

interface Props {
  name: string;
  description: string;
  url: string;
  price?: Price;
  ratingCount?: number;
  ratingValue?: number;
}

export function SoftwareAppSchema({ name, description, url, price, ratingCount, ratingValue }: Props) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url,
    inLanguage: 'ru',
  };

  if (price) {
    data.offers = {
      '@type': 'Offer',
      price: price.amount,
      priceCurrency: price.currency,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: price.amount,
        priceCurrency: price.currency,
        billingIncrement: price.period ?? 'P1M',
      },
    };
  }

  if (ratingCount && ratingValue) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      ratingCount,
    };
  }

  return <JsonLd data={data} />;
}
