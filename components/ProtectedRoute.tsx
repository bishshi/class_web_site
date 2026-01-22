'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [router, pathname]);

  if (!isAuthenticated()) {
    return <div>加载中...</div>;
  }

  return <>{children}</>;
}