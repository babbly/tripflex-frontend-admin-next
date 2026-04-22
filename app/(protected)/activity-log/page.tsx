'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
interface ActivityLog {
  id: string;
  time: string;
  actionType: string;
  workerName: string;
  workerEmail: string;
  targetName: string;
  targetEmail: string;
}

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const logs: ActivityLog[] = [
    {
      id: '1',
      time: '2026-03-27 15:17:20',
      actionType: '권한 변경',
      workerName: '조은채',
      workerEmail: 'ecjo@example.com',
      targetName: '오인석',
      targetEmail: 'ico@example.com',
    },
    {
      id: '2',
      time: '2026-03-27 11:10:42',
      actionType: '계정 수정',
      workerName: '오인석',
      workerEmail: 'ico@example.com',
      targetName: '오인석',
      targetEmail: 'ico@example.com',
    },
    {
      id: '3',
      time: '2026-03-26 13:58:42',
      actionType: '계정 생성',
      workerName: '유명호',
      workerEmail: 'mhu@example.com',
      targetName: '조은채',
      targetEmail: 'ecjo@example.com',
    },
    {
      id: '4',
      time: '2026-03-25 14:32:48',
      actionType: '계정 삭제',
      workerName: '유명호',
      workerEmail: 'mhu@example.com',
      targetName: '허지은',
      targetEmail: 'jehur@example.com',
    },
  ];

  const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE));

  return (
    <div className="w-full flex flex-col space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <PageTitle>관리자 활동 로그</PageTitle>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3">
        <div className="relative w-[280px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input 
            type="text" 
            className="pl-9 h-10 border-gray-200 bg-white text-[#71717A] placeholder:text-[#71717A]" 
            placeholder="작업자 및 대상자 검색" 
          />
        </div>

        <div className="relative w-[200px]">
          <select className="w-full h-10 pl-3 pr-8 text-sm border border-gray-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#4186FF] focus:border-[#4186FF] text-[#71717A]">
            <option value="">작업 유형</option>
            <option value="권한 변경">권한 변경</option>
            <option value="계정 수정">계정 수정</option>
            <option value="계정 생성">계정 생성</option>
            <option value="계정 삭제">계정 삭제</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="relative w-[160px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <Input 
            type="text" 
            className="pl-9 h-10 border-gray-200 bg-white text-[#71717A] placeholder:text-[#71717A]" 
            placeholder="시작 날짜" 
            onFocus={(e) => e.target.type = 'date'}
            onBlur={(e) => !e.target.value && (e.target.type = 'text')}
          />
        </div>

        <div className="relative w-[160px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <Input 
            type="text" 
            className="pl-9 h-10 border-gray-200 bg-white text-[#71717A] placeholder:text-[#71717A]" 
            placeholder="종료 날짜" 
            onFocus={(e) => e.target.type = 'date'}
            onBlur={(e) => !e.target.value && (e.target.type = 'text')}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <AdminTableHeaderRow>
                <AdminTableHead>시간</AdminTableHead>
                <AdminTableHead>작업 유형</AdminTableHead>
                <AdminTableHead>작업자</AdminTableHead>
                <AdminTableHead>작업자 이메일</AdminTableHead>
                <AdminTableHead>대상자</AdminTableHead>
                <AdminTableHead>대상자 이메일</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 bg-white hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-900">{log.time}</td>
                  <td className="p-4 text-sm text-gray-600">{log.actionType}</td>
                  <td className="p-4 text-sm text-gray-600">{log.workerName}</td>
                  <td className="p-4 text-sm text-gray-600">{log.workerEmail}</td>
                  <td className="p-4 text-sm text-gray-600">{log.targetName}</td>
                  <td className="p-4 text-sm text-gray-600">{log.targetEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-end p-4 items-center space-x-2 bg-[#F9FAFB] border-t border-[#E4E4E7]">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-500 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white text-[14px] font-[600] leading-normal hover:bg-blue-600 border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-500 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
