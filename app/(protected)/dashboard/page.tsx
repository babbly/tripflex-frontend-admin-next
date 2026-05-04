'use client';

import { PageTitle } from '@/components/ui/page-title';
import { 
  Users, 
  Image as ImageIcon, 
  MessageSquare, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const STATS = [
  {
    name: '신규 가입자',
    value: '1,284',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: '분석된 이미지',
    value: '42,892',
    change: '+8.2%',
    trend: 'up',
    icon: ImageIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    name: '유저 제안',
    value: '156',
    change: '-2.4%',
    trend: 'down',
    icon: MessageSquare,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    name: '활동 로그',
    value: '8,421',
    change: '+15.3%',
    trend: 'up',
    icon: Activity,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageTitle>대시보드</PageTitle>
        <div className="text-sm text-gray-500">
          최근 업데이트: {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col items-center justify-center text-gray-400">
          <p>방문자 통계 그래프 (준비 중)</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px] flex flex-col items-center justify-center text-gray-400">
          <p>최근 활동 내역 (준비 중)</p>
        </div>
      </div>
    </div>
  );
}
