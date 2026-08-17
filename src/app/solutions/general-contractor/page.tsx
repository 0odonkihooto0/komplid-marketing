import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoleSolutionPage } from '@/components/solutions/RoleSolutionPage';
import { getRoleSolution } from '@/lib/solutions-data';

const ROLE_ID = 'general-contractor';

export const metadata: Metadata = {
  title: 'Субподряд сдаёт ИД в одном формате и в срок — «Комплид» для генподрядчика',
  description:
    'Каждый субподрядчик ведёт журналы и акты в общей структуре объекта. Комплект ИД собирается по ходу работ, реестр всегда актуален, маршруты согласования заданы схемой.',
  alternates: { canonical: 'https://komplid.ru/solutions/general-contractor' },
};

export default function Page() {
  const role = getRoleSolution(ROLE_ID);
  if (!role) notFound();

  return <RoleSolutionPage role={role} />;
}
