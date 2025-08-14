import MilhasLivelo from './MilhasLivelo';

import { BRANDS } from '@/lib/brands';

export default function MilhasLatam() {
  // Reuso da página principal, alterando apenas o programa.
  return <MilhasLivelo program={BRANDS.latam} />;
}
