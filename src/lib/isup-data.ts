/**
 * XSD-схемы Минстроя для сдачи в ИСУП.
 *
 * Данные перенесены из прототипа «ИСУП и XSD-схемы» (архив komplidLanding).
 * Правило §21 действует и здесь: заявляем только то, что работает.
 *
 * Ссылки на несуществующие разделы (/otkazy, /kurs) вычищены, а короткие
 * обозначения СП развёрнуты в реальные слаги корпуса — иначе перелинковка
 * вела бы в 404.
 */


export interface SchemaField {
  /** Имя элемента в XML */
  name: string;
  /** Тип по схеме */
  type: string;
  note: string;
}

export interface SchemaError {
  /** Код ошибки валидатора */
  tag: string;
  /** Текст, который выдаёт валидатор */
  code: string;
  /** Что это означает на самом деле */
  cause: string;
  fix: string;
}

export interface SchemaFaq {
  q: string;
  a: string;
}

export interface XmlLine {
  text: string;
  /** tag — служебная строка, val — строка со значением */
  tone: 'tag' | 'val';
}

export interface XsdSchema {
  slug: string;
  code: string;
  group: string;
  version: string;
  /** Порядок схемы внутри пакета */
  order: number;
  fileName: string;
  short: string;
  name: string;
  h1: string;
  /** Короткое пояснение для карточки */
  teaser: string;
  /** Что это простыми словами — прямой ответ, для AEO */
  plain: string;
  fields: readonly SchemaField[];
  /** Фрагмент пакета: строки с пометкой, тег это или значение */
  xml: readonly XmlLine[];
  errors: readonly SchemaError[];
  faq: readonly SchemaFaq[];
}

export interface FlowStep {
  n: string;
  title: string;
  text: string;
}

/** Группы схем для фильтра. */
export const SCHEMA_GROUPS: readonly string[] = [
  'Все группы',
  'Акты',
  'Журналы',
  'Формы КС',
  'Схемы',
];

/** Порядок сдачи, если делаете это впервые. */
export const ISUP_FLOW: readonly FlowStep[] = [
  {
    n: '01',
    title: 'Уточнить требования',
    text: 'Какие схемы и версии принимает заказчик — до начала работ, а не перед сдачей.',
  },
  {
    n: '02',
    title: 'Согласовать идентификаторы',
    text: 'Объект и договор в ИСУП: внутренние номера схема не принимает.',
  },
  {
    n: '03',
    title: 'Сформировать пакет',
    text: 'Файлы по схемам плюс опись. Один документ — один файл.',
  },
  {
    n: '04',
    title: 'Проверить валидатором',
    text: 'До отправки. Отказ после подачи стоит дороже, чем прогон схемой.',
  },
  {
    n: '05',
    title: 'Подать и зафиксировать',
    text: 'Выгрузку подаёте сами. Сохранить квитанцию и состав пакета.',
  },
];

export const XSD_SCHEMAS: readonly XsdSchema[] = [
  {
    slug: 'aosr',
    code: 'AOSR',
    group: 'Акты',
    version: '2.4',
    order: 1,
    fileName: 'aosr_00412.xml',
    short: 'Акт скрытых работ',
    name: 'Акт освидетельствования скрытых работ',
    h1: 'XSD-схема акта освидетельствования скрытых работ',
    teaser: 'Самая частая схема в пакете. Валидатор чаще всего спотыкается на перечне материалов и составе подписантов.',
    plain: 'Схема описывает акт скрытых работ как структуру: идентификатор объекта, состав работ по участку, перечень применённых материалов с реквизитами документов о качестве и блок подписантов с их ролями. Каждый акт выгружается отдельным файлом, реквизиты объекта должны совпадать с данными разрешения на строительство.',
    fields: [
      {
        name: 'ObjectID',
        type: 'string',
        note: 'Идентификатор объекта в ИСУП, а не внутренний номер',
      },
      {
        name: 'WorkDescription',
        type: 'string',
        note: 'Состав работ по участку — не «работы по проекту»',
      },
      {
        name: 'DateStart / DateEnd',
        type: 'date',
        note: 'Окончание не позже даты акта и начала следующего этапа',
      },
      {
        name: 'MaterialList/Material',
        type: 'complex',
        note: 'На каждую позицию: наименование, производитель, номер и дата документа о качестве',
      },
      {
        name: 'SignerList/Signer',
        type: 'complex',
        note: 'ФИО, должность, роль, реквизиты приказа о назначении',
      },
      {
        name: 'AttachmentList/File',
        type: 'complex',
        note: 'Нумерация приложений в порядке позиций акта',
      },
    ],
    xml: [
      {
        text: '<AOSR SchemaVersion="2.4">',
        tone: 'tag',
      },
      {
        text: '  <ObjectID>77-0412-2026</ObjectID>',
        tone: 'val',
      },
      {
        text: '  <WorkDescription>Устройство армокаркаса, оси 1-4, 3 этаж</WorkDescription>',
        tone: 'val',
      },
      {
        text: '  <DateEnd>2026-08-11</DateEnd>',
        tone: 'val',
      },
      {
        text: '  <MaterialList>',
        tone: 'tag',
      },
      {
        text: '    <Material name="Арматура А500С ⌀12" producer="ЗМК" doc="ПК-4412" date="2026-07-28"/>',
        tone: 'val',
      },
      {
        text: '  </MaterialList>',
        tone: 'tag',
      },
      {
        text: '  <SignerList>',
        tone: 'tag',
      },
      {
        text: '    <Signer role="contractor" order="ПР-88" date="2026-01-15">Кузнецов А. В.</Signer>',
        tone: 'val',
      },
      {
        text: '    <Signer role="supervision" order="ПР-12" date="2026-02-02">Орлова М. С.</Signer>',
        tone: 'val',
      },
      {
        text: '  </SignerList>',
        tone: 'tag',
      },
      {
        text: '</AOSR>',
        tone: 'tag',
      },
    ],
    errors: [
      {
        tag: 'cvc-complex-type.2.4.a',
        code: 'Invalid content was found starting with element \'SignerList\'. One of \'{MaterialList}\' is expected.',
        cause: 'Порядок элементов в схеме строгий: MaterialList идёт перед SignerList. Если перечень материалов пуст, блок выпадает целиком — и валидатор видит нарушение последовательности.',
        fix: 'Заполнить перечень материалов. Если материалов на этом виде работ действительно нет, блок всё равно передаётся с обоснованием — пустой элемент по схеме допустим, отсутствующий нет.',
      },
      {
        tag: 'cvc-datatype-valid.1.2.1',
        code: '\'11.08.2026\' is not a valid value for \'date\'.',
        cause: 'Даты в схеме — в формате ISO (ГГГГ-ММ-ДД). Русский формат из шаблона Word попадает в пакет при ручной сборке XML.',
        fix: 'Привести все даты к 2026-08-11. Проверять не только DateEnd, но и даты в реквизитах документов о качестве и приказов.',
      },
      {
        tag: 'cvc-minLength-valid',
        code: 'Value \'\' with length = \'0\' is not facet-valid with respect to minLength \'1\' for type \'nonEmptyString\'.',
        cause: 'Пустая строка вместо отсутствующего значения. Чаще всего — в реквизитах приказа подписанта или номере документа о качестве.',
        fix: 'Не отдавать пустые строки: либо реальное значение, либо элемент вообще не передаётся, если по схеме он необязателен.',
      },
    ],
    faq: [
      {
        q: 'Один файл на акт или один на объект?',
        a: 'Один файл на акт. Пакет — это набор файлов с описью; попытка сложить все акты в один XML не проходит валидацию по корневому элементу.',
      },
      {
        q: 'Обязателен ли идентификатор объекта из ИСУП?',
        a: 'Да, внутренний номер объекта из вашей системы схема не принимает. Идентификатор берётся из карточки объекта в ИСУП.',
      },
      {
        q: 'Как передавать сканы приложений?',
        a: 'Файлы прикладываются к пакету, а в XML передаются их имена и порядковые номера. Имя в XML и имя файла должны совпадать посимвольно.',
      },
    ],
  },
  {
    slug: 'aook',
    code: 'AOOK',
    group: 'Акты',
    version: '2.4',
    order: 2,
    fileName: 'aook_00118.xml',
    short: 'Акт ответственных конструкций',
    name: 'Акт освидетельствования ответственных конструкций',
    h1: 'XSD-схема акта освидетельствования ответственных конструкций',
    teaser: 'Отличается от АОСР обязательным блоком прочности и подписью проектировщика.',
    plain: 'Схема описывает промежуточную приёмку ответственной конструкции: идентификация элемента по проекту, результаты контроля прочности на дату приёмки и расширенный состав подписантов с обязательным участием проектировщика. Для монолитных конструкций блок прочности обязателен — без него пакет не проходит валидацию.',
    fields: [
      {
        name: 'ObjectID',
        type: 'string',
        note: 'Идентификатор объекта в ИСУП',
      },
      {
        name: 'StructureRef',
        type: 'string',
        note: 'Обозначение конструкции по проекту, например К-14',
      },
      {
        name: 'ProjectSheet',
        type: 'string',
        note: 'Лист проекта, где конструкция отнесена к ответственным',
      },
      {
        name: 'StrengthControl',
        type: 'complex',
        note: 'Протокол, дата испытаний, фактическая прочность',
      },
      {
        name: 'SignerList/Signer',
        type: 'complex',
        note: 'Роль designer обязательна для этой схемы',
      },
      {
        name: 'AttachmentList/File',
        type: 'complex',
        note: 'Съёмка, протокол, лист проекта',
      },
    ],
    xml: [
      {
        text: '<AOOK SchemaVersion="2.4">',
        tone: 'tag',
      },
      {
        text: '  <StructureRef>К-14</StructureRef>',
        tone: 'val',
      },
      {
        text: '  <ProjectSheet>АР-12.4</ProjectSheet>',
        tone: 'val',
      },
      {
        text: '  <StrengthControl protocol="ЛП-2211" date="2026-08-09">',
        tone: 'tag',
      },
      {
        text: '    <ActualStrength unit="MPa">27.4</ActualStrength>',
        tone: 'val',
      },
      {
        text: '  </StrengthControl>',
        tone: 'tag',
      },
      {
        text: '  <SignerList>',
        tone: 'tag',
      },
      {
        text: '    <Signer role="designer" order="ГИП-4" date="2026-03-01">Белов И. И.</Signer>',
        tone: 'val',
      },
      {
        text: '  </SignerList>',
        tone: 'tag',
      },
      {
        text: '</AOOK>',
        tone: 'tag',
      },
    ],
    errors: [
      {
        tag: 'cvc-complex-type.2.4.b',
        code: 'The content of element \'AOOK\' is not complete. One of \'{StrengthControl}\' is expected.',
        cause: 'Блок контроля прочности отсутствует. Типовая ситуация: акт выпущен раньше, чем лаборатория выдала протокол.',
        fix: 'Дождаться протокола и указать фактическую прочность на дату приёмки. Дата протокола не может быть позже даты акта — иначе замечание придёт уже не от валидатора, а от проверяющего.',
      },
      {
        tag: 'cvc-enumeration-valid',
        code: 'Value \'proektirovshik\' is not facet-valid with respect to enumeration \'[contractor, supervision, designer, subcontractor]\'.',
        cause: 'Роль подписанта передана транслитом или по-русски. Схема принимает только значения из перечисления.',
        fix: 'Использовать значения строго из enumeration: designer для проектировщика, supervision для технадзора.',
      },
      {
        tag: 'cvc-attribute.3',
        code: 'The value \'27,4\' of attribute \'ActualStrength\' is not valid with respect to its type, \'decimal\'.',
        cause: 'Десятичный разделитель — точка. Запятая приходит из Excel при выгрузке результатов испытаний.',
        fix: 'Заменить запятую на точку во всех числовых значениях пакета, включая объёмы и суммы в других схемах.',
      },
    ],
    faq: [
      {
        q: 'Нужен ли блок прочности для металлоконструкций?',
        a: 'Для конструкций, где контроль прочности бетона не применяется, блок передаётся с результатами предусмотренного проектом контроля. Полностью опустить его схема не позволяет.',
      },
      {
        q: 'Можно ли подать АООК без подписи проектировщика?',
        a: 'Схема требует роль designer. Если авторский надзор фактически не ведётся, порядок согласуется с заказчиком до формирования пакета.',
      },
    ],
  },
  {
    slug: 'ozhr',
    code: 'OZHR',
    group: 'Журналы',
    version: '1.9',
    order: 3,
    fileName: 'ozhr_2026_07.xml',
    short: 'Общий журнал работ',
    name: 'Общий журнал работ',
    h1: 'XSD-схема общего журнала работ для ИСУП',
    teaser: 'Выгружается периодами. Основная сложность — непрерывность записей и корректные ссылки на акты.',
    plain: 'Схема передаёт журнал как последовательность записей за период: дата, описание работ, участок, ответственный и ссылки на оформленные акты. Валидатор проверяет структуру, но заказчик проверяет непрерывность: пропуски дат и записи, внесённые задним числом, видны по служебным полям.',
    fields: [
      {
        name: 'PeriodStart / PeriodEnd',
        type: 'date',
        note: 'Границы выгрузки, обычно календарный месяц',
      },
      {
        name: 'EntryList/Entry',
        type: 'complex',
        note: 'Одна запись — один день и участок',
      },
      {
        name: 'Entry/@created',
        type: 'dateTime',
        note: 'Время фактического внесения, заполняется системой',
      },
      {
        name: 'Entry/ResponsibleRef',
        type: 'string',
        note: 'Ссылка на ответственного из блока приказов',
      },
      {
        name: 'Entry/ActRef',
        type: 'string',
        note: 'Номер акта, если запись связана с освидетельствованием',
      },
      {
        name: 'RemarkList/Remark',
        type: 'complex',
        note: 'Замечания контроля со сроком и отметкой о закрытии',
      },
    ],
    xml: [
      {
        text: '<OZHR SchemaVersion="1.9">',
        tone: 'tag',
      },
      {
        text: '  <PeriodStart>2026-07-01</PeriodStart>',
        tone: 'val',
      },
      {
        text: '  <EntryList>',
        tone: 'tag',
      },
      {
        text: '    <Entry date="2026-07-14" created="2026-07-14T18:22:05">',
        tone: 'val',
      },
      {
        text: '      <Work>Армирование плиты, оси 1-4</Work>',
        tone: 'val',
      },
      {
        text: '      <ActRef>АОСР-118</ActRef>',
        tone: 'val',
      },
      {
        text: '    </Entry>',
        tone: 'tag',
      },
      {
        text: '  </EntryList>',
        tone: 'tag',
      },
      {
        text: '  <RemarkList>',
        tone: 'tag',
      },
      {
        text: '    <Remark id="14" issued="2026-07-16" due="2026-07-20" closed="2026-07-19"/>',
        tone: 'val',
      },
      {
        text: '  </RemarkList>',
        tone: 'tag',
      },
      {
        text: '</OZHR>',
        tone: 'tag',
      },
    ],
    errors: [
      {
        tag: 'cvc-datatype-valid.1.2.1',
        code: '\'2026-07-14 18:22\' is not a valid value for \'dateTime\'.',
        cause: 'dateTime требует разделитель T и секунды. Значение из выгрузки таблицы приходит с пробелом.',
        fix: 'Формат 2026-07-14T18:22:05. Часовой пояс указывается, если это требует версия схемы у вашего заказчика.',
      },
      {
        tag: 'cvc-identity-constraint',
        code: 'Duplicate unique value [АОСР-118] declared for identity constraint of element \'OZHR\'.',
        cause: 'Один и тот же акт указан в нескольких записях журнала. Обычно результат копирования записи за соседний день.',
        fix: 'Одна ссылка на акт — одна запись. Работы за другие дни описываются своими записями без переиспользования номера акта.',
      },
      {
        tag: 'cvc-complex-type.4',
        code: 'Attribute \'closed\' must appear on element \'Remark\' when \'due\' is present.',
        cause: 'Замечание с установленным сроком передано без отметки о закрытии. Формально пакет неполон, даже если работы устранены.',
        fix: 'Заполнить дату закрытия. Открытые замечания передаются без due либо с признаком, предусмотренным версией схемы.',
      },
    ],
    faq: [
      {
        q: 'Каким периодом выгружать журнал?',
        a: 'Обычно месяц. Период согласуется с заказчиком: некоторые принимают выгрузку по этапам работ, а не по календарю.',
      },
      {
        q: 'Что если журнал вели на бумаге?',
        a: 'Записи придётся перенести в структуру схемы. Поле created при этом честно отражает дату переноса — заказчик увидит расхождение с датами работ.',
      },
    ],
  },
  {
    slug: 'ks2',
    code: 'KS2',
    group: 'Формы КС',
    version: '3.1',
    order: 4,
    fileName: 'ks2_07_2026.xml',
    short: 'Акт КС-2',
    name: 'Акт о приёмке выполненных работ КС-2',
    h1: 'XSD-схема акта КС-2 для сдачи в ИСУП',
    teaser: 'Позиции акта должны сходиться со сметой и по коду, и по объёму. Расхождение ловится не валидатором, а заказчиком.',
    plain: 'Схема описывает акт приёмки выполненных работ: отчётный период, ссылку на договор, перечень позиций с кодами из сметы, объёмами, ценами и итоговыми суммами. Валидатор проверяет типы и структуру; сверку позиций со сметой делает заказчик, поэтому расхождение по коду или объёму даёт возврат уже после успешной валидации.',
    fields: [
      {
        name: 'ContractRef',
        type: 'string',
        note: 'Реквизиты договора как в карточке объекта ИСУП',
      },
      {
        name: 'ReportPeriod',
        type: 'complex',
        note: 'Границы отчётного периода',
      },
      {
        name: 'PositionList/Position',
        type: 'complex',
        note: 'Код позиции сметы, наименование, единица, объём',
      },
      {
        name: 'Position/@price',
        type: 'decimal',
        note: 'Цена за единицу с точкой как разделителем',
      },
      {
        name: 'TotalAmount',
        type: 'decimal',
        note: 'Итог должен совпадать с суммой позиций до копейки',
      },
      {
        name: 'VATRate',
        type: 'decimal',
        note: 'Ставка по договору, а не по умолчанию',
      },
    ],
    xml: [
      {
        text: '<KS2 SchemaVersion="3.1">',
        tone: 'tag',
      },
      {
        text: '  <ContractRef>Д-114/2026 от 2026-02-10</ContractRef>',
        tone: 'val',
      },
      {
        text: '  <PositionList>',
        tone: 'tag',
      },
      {
        text: '    <Position code="ФЕР06-01-001-01" unit="100 м3" volume="1.42" price="184250.00"/>',
        tone: 'val',
      },
      {
        text: '    <Position code="ФЕР06-01-015-04" unit="т" volume="8.60" price="61200.00"/>',
        tone: 'val',
      },
      {
        text: '  </PositionList>',
        tone: 'tag',
      },
      {
        text: '  <VATRate>20.00</VATRate>',
        tone: 'val',
      },
      {
        text: '  <TotalAmount>788867.00</TotalAmount>',
        tone: 'val',
      },
      {
        text: '</KS2>',
        tone: 'tag',
      },
    ],
    errors: [
      {
        tag: 'cvc-attribute.3',
        code: 'The value \'1,42\' of attribute \'volume\' is not valid with respect to its type, \'decimal\'.',
        cause: 'Объёмы выгружены из Excel с запятой. Самая частая ошибка при ручной сборке КС-2.',
        fix: 'Заменить разделитель на точку во всех числовых атрибутах: volume, price, TotalAmount, VATRate.',
      },
      {
        tag: 'cvc-pattern-valid',
        code: 'Value \'ФЕР 06-01-001-01\' is not facet-valid with respect to pattern for type \'positionCode\'.',
        cause: 'Пробел внутри кода позиции. Возникает при копировании из печатной формы сметы.',
        fix: 'Код передаётся без пробелов, строго в формате нормативной базы. Проверять весь перечень, а не первую позицию.',
      },
      {
        tag: 'business-rule',
        code: 'TotalAmount does not match sum of positions (delta 0.02).',
        cause: 'Округление по каждой позиции вместо округления итога. Расхождение в копейках останавливает приёмку акта.',
        fix: 'Считать итог из неокругленных значений и округлять один раз на итоге — так же, как это делает смета.',
      },
    ],
    faq: [
      {
        q: 'Нужно ли передавать смету вместе с КС-2?',
        a: 'Схема КС-2 ссылается на коды позиций; смета передаётся отдельно, если это требует заказчик. Коды должны совпадать с той версией сметы, которая согласована.',
      },
      {
        q: 'Что делать с позициями без кода?',
        a: 'Позиции по договорной цене оформляются по правилам, согласованным с заказчиком. Произвольный код придумывать нельзя — валидатор пропустит, приёмка нет.',
      },
    ],
  },
  {
    slug: 'ks3',
    code: 'KS3',
    group: 'Формы КС',
    version: '3.1',
    order: 5,
    fileName: 'ks3_07_2026.xml',
    short: 'Справка КС-3',
    name: 'Справка о стоимости выполненных работ КС-3',
    h1: 'XSD-схема справки КС-3 для сдачи в ИСУП',
    teaser: 'Накопительные суммы с начала года и с начала работ должны быть согласованы между периодами.',
    plain: 'Схема передаёт справку о стоимости: суммы за отчётный период, с начала года и с начала строительства, со ссылками на акты КС-2 периода. Основная сложность не в структуре, а в согласованности: накопительные суммы текущей справки должны продолжать предыдущую без разрывов.',
    fields: [
      {
        name: 'ContractRef',
        type: 'string',
        note: 'Тот же договор, что в связанных КС-2',
      },
      {
        name: 'PeriodAmount',
        type: 'decimal',
        note: 'Сумма за отчётный период',
      },
      {
        name: 'YearToDateAmount',
        type: 'decimal',
        note: 'С начала года, накопительно',
      },
      {
        name: 'TotalToDateAmount',
        type: 'decimal',
        note: 'С начала строительства, накопительно',
      },
      {
        name: 'ActRefList/ActRef',
        type: 'complex',
        note: 'Ссылки на все КС-2 отчётного периода',
      },
    ],
    xml: [
      {
        text: '<KS3 SchemaVersion="3.1">',
        tone: 'tag',
      },
      {
        text: '  <PeriodAmount>788867.00</PeriodAmount>',
        tone: 'val',
      },
      {
        text: '  <YearToDateAmount>4120480.00</YearToDateAmount>',
        tone: 'val',
      },
      {
        text: '  <TotalToDateAmount>9845310.00</TotalToDateAmount>',
        tone: 'val',
      },
      {
        text: '  <ActRefList>',
        tone: 'tag',
      },
      {
        text: '    <ActRef>КС2-07-114</ActRef>',
        tone: 'val',
      },
      {
        text: '  </ActRefList>',
        tone: 'tag',
      },
      {
        text: '</KS3>',
        tone: 'tag',
      },
    ],
    errors: [
      {
        tag: 'business-rule',
        code: 'YearToDateAmount is less than previous period value.',
        cause: 'Накопительная сумма уменьшилась. Обычно из-за корректировки прошлого периода, внесённой только в текущую справку.',
        fix: 'Корректировки прошлых периодов оформляются отдельно, а не вычитанием из накопительных сумм. Порядок согласуется с заказчиком.',
      },
      {
        tag: 'cvc-complex-type.2.4.b',
        code: 'The content of element \'ActRefList\' is not complete. One of \'{ActRef}\' is expected.',
        cause: 'Справка передана без ссылок на акты периода — например, при нулевом периоде.',
        fix: 'Нулевой период оформляется по правилам заказчика; список актов не может быть пустым при наличии сумм.',
      },
    ],
    faq: [
      {
        q: 'Обязательна ли КС-3, если акт один?',
        a: 'Справка формируется по периодам независимо от количества актов, если это предусмотрено договором.',
      },
      {
        q: 'Как связаны КС-2 и КС-3 в пакете?',
        a: 'Через номера актов в ActRefList. Номера должны совпадать с идентификаторами файлов КС-2 в том же пакете.',
      },
    ],
  },
  {
    slug: 'geo',
    code: 'GEO',
    group: 'Схемы',
    version: '1.6',
    order: 6,
    fileName: 'geo_00412.xml',
    short: 'Исполнительная съёмка',
    name: 'Исполнительная геодезическая схема',
    h1: 'XSD-схема исполнительной геодезической съёмки',
    teaser: 'Отклонения передаются вместе с допуском. Без допуска значение читается как дефект.',
    plain: 'Схема описывает результаты исполнительной съёмки: элемент конструкции, проектные и фактические отметки, отклонение и нормативный допуск со ссылкой на пункт СП. Отдельный блок — реквизиты поверки прибора, действующей на дату измерений.',
    fields: [
      {
        name: 'StructureRef',
        type: 'string',
        note: 'Элемент, к которому относится съёмка',
      },
      {
        name: 'PointList/Point',
        type: 'complex',
        note: 'Проектная и фактическая отметки по точке',
      },
      {
        name: 'Point/@deviation',
        type: 'decimal',
        note: 'Отклонение в мм, со знаком',
      },
      {
        name: 'Point/@tolerance',
        type: 'decimal',
        note: 'Допуск по норме — обязателен вместе с отклонением',
      },
      {
        name: 'ToleranceSource',
        type: 'string',
        note: 'Пункт СП, из которого взят допуск',
      },
      {
        name: 'InstrumentCert',
        type: 'complex',
        note: 'Номер и срок действия поверки прибора',
      },
    ],
    xml: [
      {
        text: '<GeoSurvey SchemaVersion="1.6">',
        tone: 'tag',
      },
      {
        text: '  <StructureRef>Плита П-3, оси 1-4</StructureRef>',
        tone: 'val',
      },
      {
        text: '  <PointList>',
        tone: 'tag',
      },
      {
        text: '    <Point id="1" design="12.400" actual="12.392" deviation="-8" tolerance="15"/>',
        tone: 'val',
      },
      {
        text: '  </PointList>',
        tone: 'tag',
      },
      {
        text: '  <ToleranceSource>СП 70.13330.2012, п. 5.16</ToleranceSource>',
        tone: 'val',
      },
      {
        text: '  <InstrumentCert num="П-2026-441" validUntil="2027-03-14"/>',
        tone: 'val',
      },
      {
        text: '</GeoSurvey>',
        tone: 'tag',
      },
    ],
    errors: [
      {
        tag: 'cvc-complex-type.4',
        code: 'Attribute \'tolerance\' must appear on element \'Point\' when \'deviation\' is present.',
        cause: 'Отклонение указано без допуска. Валидатор это ловит, потому что без допуска значение невозможно оценить.',
        fix: 'Указать допуск по норме на этот вид работ и заполнить ToleranceSource ссылкой на пункт СП.',
      },
      {
        tag: 'business-rule',
        code: 'InstrumentCert.validUntil is earlier than survey date.',
        cause: 'Поверка прибора истекла до даты съёмки. Результаты формально недействительны.',
        fix: 'Съёмку выполнить заново поверенным прибором. Задним числом заменить сертификат нельзя — дата поверки проверяется.',
      },
    ],
    faq: [
      {
        q: 'Можно передать схему как скан вместо XML?',
        a: 'Скан прикладывается к пакету как файл, но структура точек и отклонений передаётся в XML, если схема входит в требуемый комплект.',
      },
      {
        q: 'Какой допуск указывать при отсутствии в СП?',
        a: 'Берётся из проекта или технических требований. Ссылка в ToleranceSource должна вести на реальный источник, а не на «по проекту».',
      },
    ],
  },
];

/** Схема по слагу. */
export function getXsdSchema(slug: string): XsdSchema | undefined {
  return XSD_SCHEMAS.find((s) => s.slug === slug);
}
