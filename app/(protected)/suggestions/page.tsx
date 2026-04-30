'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface SuggestionRecord {
  id: string;
  deviceId: string;
  category: string;
  content: string;
  createdAt: string;
  isConfirmed: boolean;
}

export default function SuggestionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const ITEMS_PER_PAGE = parseInt(pageSize);

  const [records, setRecords] = useState<SuggestionRecord[]>([
    {
      id: '1',
      deviceId: 'DEV-20483A',
      category: '번역',
      content: '메뉴판 번역 결과가 실제 번역 결과와 달라요.',
      createdAt: '2026-03-19 14:32',
      isConfirmed: false,
    },
    {
      id: '2',
      deviceId: 'DEV-10291B',
      category: '가격',
      content: '최대 17자까지 노출 이후 ...',
      createdAt: '2026-03-19 13:58',
      isConfirmed: true,
    },
    {
      id: '3',
      deviceId: 'DEV-38847C',
      category: '이미지',
      content: '환율 계산 결과가 맞지 않습니다.',
      createdAt: '2026-03-19 13:21',
      isConfirmed: false,
    },
  ]);

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));

  const toggleStatus = (id: string) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, isConfirmed: !r.isConfirmed } : r)));
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col">
        <PageTitle>유저 제안 관리</PageTitle>
      </div>

      {/* Filters & Actions */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="제안 내용 검색..." />
          </div>

          {/* Tag Select */}
          <Select>
            <SelectTrigger className="w-[140px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="태그" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="translation">번역</SelectItem>
              <SelectItem value="price">가격</SelectItem>
              <SelectItem value="image">이미지</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative w-[150px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="시작 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
            </div>
            <span className="text-gray-400">~</span>
            <div className="relative w-[150px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="종료 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10 px-4">
            <Download className="w-4 h-4 mr-2" />
            전체 JSON 다운로드
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
        <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
          <span className="text-[13px] text-gray-500">페이지당</span>
          <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(1); }}>
            <SelectTrigger className="w-[80px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <AdminTableHeaderRow>
                <AdminTableHead className="px-6 py-4 w-24">이미지</AdminTableHead>
                <AdminTableHead className="px-6 py-4">디바이스 ID</AdminTableHead>
                <AdminTableHead className="px-6 py-4">태그</AdminTableHead>
                <AdminTableHead className="px-6 py-4">상세 내용</AdminTableHead>
                <AdminTableHead className="px-6 py-4">제안 일시</AdminTableHead>
                <AdminTableHead className="px-6 py-4 w-24 text-center">상세</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-[42px] h-[42px] bg-gray-100 rounded-md"></div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {record.deviceId}
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-[#EEF1FF] text-[#4186FF] text-[11px] font-[600] leading-normal border-none shadow-none"
                    >
                      {record.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[400px]">
                    {record.content}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {record.createdAt}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/suggestions/${record.id}`}>
                      <Button variant="ghost" className="bg-[#EEF1FF] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] px-4 h-8 rounded-[4px]">
                        보기
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-end p-4 items-center space-x-1 bg-white border-t border-gray-100">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
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
              className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
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
