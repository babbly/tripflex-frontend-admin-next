'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/partials/sidebar/Sidebar';
import Topbar from './Topbar';
import { useAdminAuth } from '@/providers/admin-auth-provider';
import { ChangePasswordModal } from '@/components/auth/change-password-modal';

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isReady, user } = useAdminAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) router.replace('/login');
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) return null;

  const needsPasswordChange = !!user?.mustChangePassword;

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
      {/* 첫 로그인 시 비밀번호 변경 강제 모달 — 닫기 불가 */}
      <ChangePasswordModal open={needsPasswordChange} />
    </div>
  );
}
