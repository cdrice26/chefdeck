'use client';

import useRequireAuth from '@/hooks/useRequireAuth';

const Groceries = () => {
  useRequireAuth();
  return (
    <div>
      <h1>Groceries</h1>
    </div>
  );
};

export default Groceries;
