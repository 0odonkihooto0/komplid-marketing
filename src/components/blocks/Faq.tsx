import { FaqSchema } from '@/components/seo/FaqSchema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  title: string;
  items: FaqItem[];
  eyebrow?: string;
  centered?: boolean;
}

export function Faq({ title, items, eyebrow, centered = false }: FaqProps) {
  const align = centered ? { textAlign: 'center' as const, margin: '0 auto 48px' } : { margin: '0 0 48px' };

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="section-head" style={align}>
          {eyebrow && (
            <span className="eyebrow" style={centered ? { justifyContent: 'center' } : undefined}>
              {eyebrow}
            </span>
          )}
          <h2 style={centered ? { marginLeft: 'auto', marginRight: 'auto' } : undefined}>{title}</h2>
        </div>

        <div style={{ maxWidth: 820, margin: centered ? '0 auto' : undefined }}>
          <Accordion type="single" collapsible>
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.005em',
                    textAlign: 'left',
                  }}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent
                  style={{
                    fontSize: 14.5,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.55,
                  }}
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* FaqSchema — критично для AEO: инжектируется автоматически при наличии блока */}
        <FaqSchema items={items} />
      </div>
    </section>
  );
}
