// Стоимость человеко-часа и трудозатрат бригады.
//
// Источники и допущения:
// - ст. 425 НК РФ: единый тариф страховых взносов 30% (в пределах базы) —
//   значение по умолчанию, редактируется (взносы «на травматизм» 0,2–8,5%
//   зависят от класса риска и добавляются пользователем при необходимости);
// - ст. 91 ТК РФ: нормальная продолжительность рабочего времени 40 ч/нед,
//   среднемесячное число рабочих часов (~164) пользователь берёт из
//   производственного календаря — константа в код не зашивается (blindspot B-4);
// - трудоёмкость работ в чел-ч берётся из ГЭСН или хронометража.

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Часовая ставка из месячного оклада: оклад / часов в месяце (0 при нулевых часах). */
export function hourlyRateFromSalary(monthlySalary: number, hoursPerMonth: number): number {
  const salary = clampNonNegative(monthlySalary);
  const hours = clampNonNegative(hoursPerMonth);
  return hours > 0 ? salary / hours : 0;
}

/** Полная стоимость чел-часа: ставка × (1 + взносы%) × (1 + накладные%). */
export function computeManHourCost(
  hourlyRate: number,
  insurancePct: number,
  overheadPct: number,
): number {
  const rate = clampNonNegative(hourlyRate);
  const ins = clampNonNegative(insurancePct);
  const ovh = clampNonNegative(overheadPct);
  return rate * (1 + ins / 100) * (1 + ovh / 100);
}

export interface CrewCostResult {
  /** Стоимость бригады за час, ₽ */
  crewPerHour: number;
  /** Стоимость бригады за смену, ₽ */
  crewPerShift: number;
}

/** Стоимость бригады: чел-час × человек, за смену — × часов в смене. */
export function computeCrewCost(
  costPerManHour: number,
  workers: number,
  hoursPerShift: number,
): CrewCostResult {
  const cost = clampNonNegative(costPerManHour);
  const w = clampNonNegative(workers);
  const h = clampNonNegative(hoursPerShift);
  const crewPerHour = cost * w;
  return { crewPerHour, crewPerShift: crewPerHour * h };
}

/** Стоимость работ заданной трудоёмкости: чел-час × трудоёмкость (чел-ч). */
export function computeLaborCost(costPerManHour: number, laborHours: number): number {
  return clampNonNegative(costPerManHour) * clampNonNegative(laborHours);
}
