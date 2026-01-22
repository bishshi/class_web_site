// contexts/RevalidateContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

const RevalidateContext = createContext<string>('');

export function RevalidateProvider({ 
  children, 
  revalidateTime 
}: { 
  children: ReactNode;
  revalidateTime: string;
}) {
  return (
    <RevalidateContext.Provider value={revalidateTime}>
      {children}
    </RevalidateContext.Provider>
  );
}

export function useRevalidateTime() {
  return useContext(RevalidateContext);
}