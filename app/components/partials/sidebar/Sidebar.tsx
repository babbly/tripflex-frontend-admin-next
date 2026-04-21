'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Settings,
  Flag,
  Users,
  Shield,
  History,
  FileImage,
} from 'lucide-react';

const MENU_ITEMS = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '홈 배너 관리', href: '/banner', icon: ImageIcon },
  { name: '이미지 분석 목록', href: '/image-analysis', icon: FileImage },
  { name: '유저 제안 관리', href: '/suggestions', icon: MessageSquare },
  { name: 'FAQ 관리', href: '/faq', icon: HelpCircle },
  { name: '국가별 팁 설정', href: '/tips', icon: Settings },
  { name: '국가 관리', href: '/countries', icon: Flag },
  { name: '계정 관리', href: '/accounts', icon: Users },
  { name: '권한 관리', href: '/permissions', icon: Shield },
  { name: '관리자 활동 로그', href: '/activity-log', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] min-h-screen bg-[#242938] text-[#8C90A4] flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#14F1CE]">tripflex</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 rounded-lg transition-colors',
                isActive 
                  ? 'bg-[#2E3348] text-white' 
                  : 'hover:bg-[#2E3348] hover:text-white'
              )}
            >
              <item.icon className={cn('w-5 h-5 mr-3', isActive ? 'text-[#3E97FF]' : 'text-current')} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
