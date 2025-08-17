import { Outlet } from 'react-router-dom';

import SubNav from '@/components/layout/SubNav';

export default function FinanceLayout(){
  return (
    <div data-clr="financas">
      <SubNav />
      <Outlet />
    </div>
  );
}
