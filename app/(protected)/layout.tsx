'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/partials/sidebar/Sidebar';
import Topbar from './Topbar';
import { useAdminAuth } from '@/providers/admin-auth-provider';

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isReady /* , user */ } = useAdminAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    // mustChangePassword 강제 흐름 — 디자인/기획 확정 후 다시 활성화
    // if (user?.mustChangePassword) {
    //   router.replace('/change-password');
    // }
  }, [isReady, isAuthenticated, /* user?.mustChangePassword, */ router]);

  if (!isReady || !isAuthenticated /* || user?.mustChangePassword */) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
