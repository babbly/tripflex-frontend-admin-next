'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

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
  const ITEMS_PER_PAGE = 3;

  const [records, setRecords] = useState<SuggestionRecord[]>([
    {
      id: '1',
      deviceId: 'DEV-20483A',
      category: '잘못된 번역이 나옵니다.',
      content: '메뉴판 번역 결과가 실제 번역 결과와 달라요.',
      createdAt: '2026-03-19 14:32',
      isConfirmed: false,
    },
    {
      id: '2',
      deviceId: 'DEV-10291B',
      category: '기타 사유(직접 입력)',
      content: '번역 화면에서 홈 화면으로 안나가져요. 제가 저번....',
      createdAt: '2026-03-19 13:58',
      isConfirmed: true,
    },
    {
      id: '3',
      deviceId: 'DEV-38847C',
      category: '가격 및 환율이 정확하지 않습니다.',
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

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200" placeholder="제안 내용 검색..." />
          </div>

          {/* Category Select */}
          <div className="relative w-[140px]">
            <select className="w-full h-10 pl-3 pr-8 text-sm border border-gray-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#4186FF] focus:border-[#4186FF] text-gray-600">
              <option value="">카테고리</option>
              <option value="translation">잘못된 번역</option>
              <option value="price">가격/환율 오류</option>
              <option value="other">기타</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Status Select */}
          <div className="relative w-[140px]">
            <select className="w-full h-10 pl-3 pr-8 text-sm border border-gray-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#4186FF] focus:border-[#4186FF] text-gray-600">
              <option value="">확인 상태</option>
              <option value="confirmed">확인됨</option>
              <option value="unconfirmed">미확인</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Start Date */}
          <div className="relative w-[150px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200 text-gray-600" placeholder="시작 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
          </div>

          {/* End Date */}
          <div className="relative w-[150px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200 text-gray-600" placeholder="종료 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
          </div>
        </div>

        {/* Download Button */}
        <Button className="bg-[#4186FF] hover:bg-blue-600 text-white h-10 px-4">
          <Download className="w-4 h-4 mr-2" />
          전체 JSON 다운로드
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto border-b border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-[#71717A] text-[12px] font-[600] whitespace-nowrap">
                <th className="p-4 w-24">이미지</th>
                <th className="p-4">디바이스 ID</th>
                <th className="p-4">카테고리</th>
                <th className="p-4">상세 내용</th>
                <th className="p-4">제안 일시</th>
                <th className="p-4 w-24 text-center">확인 여부</th>
                <th className="p-4 w-24 text-center">상세</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-[42px] h-[42px] bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {record.deviceId}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-[#eef1ff] text-[#1c2340] hover:bg-[#eef1ff] font-normal"
                    >
                      {record.category}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-600 truncate max-w-[200px]">
                    {record.content}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {record.createdAt}
                  </td>
                  <td className="p-4 text-center">
                    <Switch checked={record.isConfirmed} onCheckedChange={() => toggleStatus(record.id)} />
                  </td>
                  <td className="p-4 text-center">
                    <Link href={`/suggestions/${record.id}`}>
                      <Button variant="ghost" className="bg-[#EFF6FF] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] h-8 px-4 text-xs font-medium">
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
              className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
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
