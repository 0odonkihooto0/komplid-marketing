import {
  FileCheck2, Scale, NotebookPen, ShieldCheck, Gauge, FileSignature, CalendarRange,
  Camera, Box, PackageCheck, Truck, FolderOpen, BarChart3, Building2,
  Sun, Layers, ListChecks, Inbox, Library, Users, Settings2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Module } from '@/lib/home-data';

/** Иконка на модуль. Ключ — номер из эталона, чтобы порядок не разъезжался. */
const ICONS: Record<string, LucideIcon> = {
  '01': Gauge, '02': FileSignature, '03': Scale, '04': CalendarRange,
  '05': FileCheck2, '06': NotebookPen, '07': Camera, '08': ShieldCheck,
  '09': Box, '10': PackageCheck, '11': Truck, '12': FolderOpen,
  '13': BarChart3, '14': Building2, '15': Sun, '16': Layers,
  '17': ListChecks, '18': Inbox, '19': Library, '20': Users, '21': Settings2,
};

function ModuleIcon({ no, size }: { no: string; size: number }) {
  const Icon = ICONS[no] ?? FolderOpen;
  return <Icon size={size} strokeWidth={1.7} />;
}

/** Крупная карточка ключевого модуля: описание и ярлыки возможностей. */
export function FeaturedModuleCard({ mod }: { mod: Module }) {
  return (
    <div className="mod-featured">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            flex: 'none',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--accSoft)',
            color: 'var(--acc)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ModuleIcon no={mod.no} size={19} />
        </span>
        <div>
          <div className="counter-label" style={{ marginTop: 0, letterSpacing: '0.12em' }}>
            {mod.no}
          </div>
          <h3 style={{ margin: '3px 0 0', fontSize: 17, fontWeight: 500, letterSpacing: 0 }}>
            {mod.name}
          </h3>
        </div>
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 12.5, lineHeight: 1.55, color: 'var(--t3)' }}>
        {mod.description}
      </p>
      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {mod.tags?.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '4px 9px',
              borderRadius: 6,
              background: 'var(--panel3)',
              border: '1px solid var(--line2)',
              fontSize: 11,
              color: 'var(--t3)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Компактная карточка: номер, название и подпись одной строкой. */
export function CompactModuleCard({ mod }: { mod: Module }) {
  return (
    <div className="mod-compact">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span
          style={{
            flex: 'none',
            width: 26,
            height: 26,
            borderRadius: 8,
            border: '1px solid var(--line2)',
            color: 'var(--acc)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ModuleIcon no={mod.no} size={15} />
        </span>
        <span className="counter-label" style={{ marginTop: 0, letterSpacing: '0.12em' }}>
          {mod.no}
        </span>
      </div>
      <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 500, color: 'var(--t2)' }}>
        {mod.name}
      </div>
      <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.4, color: 'var(--t4)' }}>
        {mod.summary}
      </div>
    </div>
  );
}

/** Заголовок контура: подпись, пояснение и черта на всю оставшуюся ширину. */
export function ContourHead({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, margin: '0 0 14px' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--t2)',
          flex: 'none',
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 12.5, color: 'var(--t4)' }}>{hint}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}
