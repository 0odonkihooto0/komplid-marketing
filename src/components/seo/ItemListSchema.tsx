import { JsonLd } from './JsonLd';

interface Props {
  name: string;
  items: { name: string; url: string }[];
}

// ItemList-разметка каталожных страниц (хаб /kalkulyator) — помогает
// поисковикам и AI-ботам понять состав каталога (план 02 §5).
export function ItemListSchema({ name, items }: Props) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };

  return <JsonLd data={data} />;
}
