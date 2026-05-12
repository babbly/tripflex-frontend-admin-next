'use client';

import { LogOut } from 'lucide-react';
import { useAdminAuth } from '@/providers/admin-auth-provider';

export default function Topbar() {
  const { user, logout } = useAdminAuth();
  const userName = user?.name || user?.loginId || '사용자';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shrink-0 w-full">
      <div className="flex items-center gap-3">
        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
          {userName}
        </span>
        <button
          onClick={() => logout()}
          className="bg-[#4186FF] hover:bg-blue-600 text-white flex items-center justify-center gap-[6px] h-[38px] px-[16px] rounded-[6px] text-[14px] font-[600] leading-normal transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
