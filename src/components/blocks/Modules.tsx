import {
  FileText, FolderOpen, Scale, Briefcase, BookOpen, Camera, UsersRound,
  Info, Mail, Layers, Box, Calendar, Package, BadgeCheck, Shield,
  BarChart2, Bot, MessageSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Module {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Список повторяет реальный состав модулей приложения:
 * stroydocs/src/lib/ui/object-modules.ts (CORE_MODULES + OPTIONAL_MODULES),
 * подписи — из stroydocs/src/lib/ui/nav-registry.ts (OBJECT_MODULE_LABELS).
 * При расхождении источник правды — приложение, а не этот файл (CLAUDE.md §21).
 *
 * «Обзор» в приложении лежит в CORE_MODULES, но это рабочий стол объекта,
 * а не модуль, — поэтому здесь его нет и счёт сходится: 7 + 11 = 18.
 */
const CORE_MODULES: Module[] = [
  { key: 'id',         name: 'ИД',             description: 'Исполнительная документация: АОСР, акты, реестры, XML по схемам Минстроя', icon: FileText },
  { key: 'documents',  name: 'Все документы',  description: 'Сводный реестр всех документов объекта',                                    icon: FolderOpen },
  { key: 'estimates',  name: 'Сметы',          description: 'Импорт, версии, сравнение, подготовка к госэкспертизе',                     icon: Scale },
  { key: 'contracts',  name: 'Договоры',       description: 'Условия, стороны, финансы, ход исполнения',                                 icon: Briefcase },
  { key: 'journals',   name: 'Журналы',        description: 'ОЖР, журнал входного контроля и специальные журналы',                       icon: BookOpen },
  { key: 'photos',     name: 'Фото',           description: 'Фотофиксация хода работ с привязкой к договорам',                           icon: Camera },
  { key: 'team',       name: 'Команда',        description: 'Участники объекта и их роли',                                               icon: UsersRound },
];

const OPTIONAL_MODULES: Module[] = [
  { key: 'passport',      name: 'Паспорт',         description: 'Адрес, заказчик, разрешения, кадастр',                    icon: Info },
  { key: 'sed',           name: 'Документооборот',  description: 'Письма, корреспонденция, маршруты согласования',          icon: Mail },
  { key: 'pir',           name: 'ПИР',              description: 'Задания на проектирование, изыскания, проектная документация', icon: Layers },
  { key: 'tim',           name: 'ТИМ',              description: 'IFC-модели, коллизии, BCF-замечания',                     icon: Box },
  { key: 'gpr',           name: 'ГПР',              description: 'График производства работ: структура, сроки, план и факт', icon: Calendar },
  { key: 'resources',     name: 'Ресурсы',          description: 'Материалы, склад, заявки и движение ресурсов',            icon: Package },
  { key: 'certificates',  name: 'Сертификаты',      description: 'Сертификаты и паспорта качества материалов',              icon: BadgeCheck },
  { key: 'sk',            name: 'Стройконтроль',    description: 'Инспекции, дефекты, предписания, устранение',             icon: Shield },
  { key: 'reports',       name: 'Отчёты',           description: 'Сводные отчёты по объекту',                               icon: BarChart2 },
  { key: 'assistant',     name: 'AI-ассистент',     description: 'Помощник инженера ПТО: проверки, поиск по нормативам',    icon: Bot },
  { key: 'communication', name: 'Связь',            description: 'Чат и обсуждения по объекту',                             icon: MessageSquare },
];

const ALL_MODULES = [...CORE_MODULES, ...OPTIONAL_MODULES];

function ModuleCard({ mod }: { mod: Module }) {
  const Icon = mod.icon;
  return (
    <div className="mod-card">
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
      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>
        {mod.name}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
        {mod.description}
      </p>
    </div>
  );
}

export function Modules() {
  return (
    <section className="section" id="modules">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">{ALL_MODULES.length} модулей · 1 система</span>
          <h2>Один контур для всего жизненного цикла объекта.</h2>
          <p>
            Семь модулей включены на каждом объекте, остальные одиннадцать подключаются
            по необходимости — чтобы у прораба на экране не висело то, чем он не пользуется.
          </p>
        </div>

        <div className="modules-grid">
          {ALL_MODULES.map((mod) => (
            <ModuleCard key={mod.key} mod={mod} />
          ))}
        </div>
      </div>
    </section>
  );
}
