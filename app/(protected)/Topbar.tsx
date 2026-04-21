'use client';

import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function Topbar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email || '사용자';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shrink-0 w-full">
      <div className="flex items-center gap-3">
        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium">
          {userName}
        </span>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-[#4186FF] hover:bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
