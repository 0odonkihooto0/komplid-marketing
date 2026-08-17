import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoleSolutionPage } from '@/components/solutions/RoleSolutionPage';
import { getRoleSolution } from '@/lib/solutions-data';

const ROLE_ID = 'designer';

export const metadata: Metadata = {
  title: 'Авторский надзор с привязкой к модели, а не к почте — «Комплид» для проектировщика',
  description:
    'Замечание авторского надзора ставится на элемент IFC, а не описывается словами в письме. Коллизии, ответы подрядчика и журнал авторского надзора — в одном месте.',
  alternates: { canonical: 'https://komplid.ru/solutions/designer' },
};

export default function Page() {
  const role = getRoleSolution(ROLE_ID);
  if (!role) notFound();

  return <RoleSolutionPage role={role} />;
}
