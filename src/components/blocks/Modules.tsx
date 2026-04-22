import Link from 'next/link';
import {
  LayoutDashboard, Info, Briefcase, Calculator, BookOpen, FileText,
  Shield, GanttChart, Package, BarChart3, Box, KeyRound,
  CheckSquare, CreditCard, Smartphone, Bot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Module {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

const MODULES: Module[] = [
  { slug: 'dashboard',    name: 'Дашборд',                    description: 'Виджеты, KPI, лента событий',                  icon: LayoutDashboard },
  { slug: 'info',         name: 'Информация',                 description: 'Паспорт объекта, показатели, финансирование',   icon: Info },
  { slug: 'management',   name: 'Управление',                 description: 'Контракты, мероприятия, документарий',          icon: Briefcase },
  { slug: 'estimates',    name: 'Сметы',                      description: 'Парсинг XML, сравнение версий, ФГИС ЦС',        icon: Calculator },
  { slug: 'journals',     name: 'Журналы работ',              description: 'ОЖР, ЖВК, спецжурналы',                        icon: BookOpen },
  { slug: 'id',           name: 'Исполнительная документация',description: 'АОСР, КС-2, КС-3, маршруты',                  icon: FileText },
  { slug: 'sk',           name: 'Стройконтроль',              description: 'Дефекты, предписания, инспекции',               icon: Shield },
  { slug: 'gantt',        name: 'График работ',               description: 'Гантт, критический путь, версионирование',      icon: GanttChart },
  { slug: 'resources',    name: 'Ресурсы и закупки',          description: 'Материалы, накладные, остатки',                 icon: Package },
  { slug: 'reports',      name: 'Отчёты',                     description: 'PDF за период, AI-сводки',                      icon: BarChart3 },
  { slug: 'tim',          name: 'ТИМ / BIM',                  description: 'IFC-вьюер, привязка ИД к элементам',            icon: Box },
  { slug: 'ecp',          name: 'ЭЦП и регуляторика',         description: 'КриптоПро, ИСУП, МЧД',                         icon: KeyRound },
  { slug: 'planner',      name: 'Планировщик задач',          description: 'Задачи, роли, группы, шаблоны',                icon: CheckSquare },
  { slug: 'monetization', name: 'Монетизация',                description: 'Подписки, рефералы, Профи-пакеты',              icon: CreditCard },
  { slug: 'pwa',          name: 'Мобильное приложение',       description: 'Офлайн, GPS, push, геозоны',                   icon: Smartphone },
  { slug: 'ai',           name: 'AI-ассистент',               description: 'RAG-поиск, проверка ИД, подсказки',             icon: Bot },
];

export function Modules() {
  return (
    <section className="section" id="modules">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">18 модулей · 1 система</span>
          <h2>Один контур для всего жизненного цикла объекта.</h2>
          <p>От первой заявки на ПИР до ЗОС. Документы, сроки и деньги ссылаются друг на друга — меняется одно, пересчитывается всё.</p>
        </div>

        <div className="modules-grid">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.slug} href={`/modules/${mod.slug}`} className="mod-card">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--ink-soft)',
                    marginBottom: 16,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <h3
                  style={{
                    margin: '0 0 8px',
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {mod.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.5,
                  }}
                >
                  {mod.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
