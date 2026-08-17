import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoleSolutionPage } from '@/components/solutions/RoleSolutionPage';
import { getRoleSolution } from '@/lib/solutions-data';

const ROLE_ID = 'technical-supervisor';

export const metadata: Metadata = {
  title: 'Замечание не теряется, устранение видно — «Комплид» для технадзора',
  description:
    'Предписания с фото и пином на плане, срок устранения в системе, а не в переписке. Комплект ИД приходит на согласование по ходу работ. Данные в РФ, ФЗ-152.',
  alternates: { canonical: 'https://komplid.ru/solutions/technical-supervisor' },
};

export default function Page() {
  const role = getRoleSolution(ROLE_ID);
  if (!role) notFound();

  return <RoleSolutionPage role={role} />;
}
