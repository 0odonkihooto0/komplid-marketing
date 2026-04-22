import { JsonLd } from './JsonLd';

interface Props {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
}

export function ArticleSchema({
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  modifiedAt,
  authorName,
}: Props) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    inLanguage: 'ru',
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Komplid',
      logo: {
        '@type': 'ImageObject',
        url: 'https://komplid.ru/icons/logo-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  if (imageUrl) {
    data.image = [imageUrl];
  }

  return <JsonLd data={data} />;
}
