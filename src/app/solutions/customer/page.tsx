import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoleSolutionPage } from '@/components/solutions/RoleSolutionPage';
import { getRoleSolution } from '@/lib/solutions-data';

const ROLE_ID = 'customer';

export const metadata: Metadata = {
  title: 'Картина по объекту без запроса «пришлите свод» — «Комплид» для заказчика',
  description:
    'КС-2 сверяются с версией сметы, а не глазами. Ход работ, замечания и комплект ИД — в одном месте, со своим доступом на чтение по каждому объекту.',
  alternates: { canonical: 'https://komplid.ru/solutions/customer' },
};

export default function Page() {
  const role = getRoleSolution(ROLE_ID);
  if (!role) notFound();

  return <RoleSolutionPage role={role} />;
}
