'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalysisRecord {
  id: string;
  deviceId: string;
  countryFlag: string;
  countryName: string;
  analysisDate: string;
  ocrTime: string;
  aiModelTime: string;
  translationTime: string;
  totalTime: string;
}

export default function ImageAnalysisPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const ITEMS_PER_PAGE = parseInt(pageSize);

  const [records] = useState<AnalysisRecord[]>([
    {
      id: '1',
      deviceId: 'DEV-20483A',
      countryFlag: '🇯🇵',
      countryName: '일본',
      analysisDate: '2026-03-19 14:32:05',
      ocrTime: '2.41',
      aiModelTime: '2.41',
      translationTime: '2.41',
      totalTime: '2.41',
    },
    {
      id: '2',
      deviceId: 'DEV-10291B',
      countryFlag: '🇫🇷',
      countryName: '프랑스',
      analysisDate: '2026-03-19 13:58:42',
      ocrTime: '3.11',
      aiModelTime: '3.11',
      translationTime: '3.11',
      totalTime: '3.11',
    },
    {
      id: '3',
      deviceId: 'DEV-38847C',
      countryFlag: '🇺🇸',
      countryName: '미국',
      analysisDate: '2026-03-19 13:21:17',
      ocrTime: '1.88',
      aiModelTime: '1.88',
      translationTime: '1.88',
      totalTime: '1.88',
    },
  ]);

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col">
        <PageTitle>이미지 분석 목록</PageTitle>
      </div>

      {/* Filters & Actions Section */}
      <div className="space-y-4">
        {/* Row 1: Device ID to End Date */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="디바이스 ID..." />
          </div>

          <Select>
            <SelectTrigger className="w-[120px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="국가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JP">일본</SelectItem>
              <SelectItem value="FR">프랑스</SelectItem>
              <SelectItem value="US">미국</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <div className="relative w-[140px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="시작 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
            </div>
            <span className="text-gray-400">~</span>
            <div className="relative w-[140px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="종료 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
            </div>
          </div>
        </div>

        {/* Row 2: Processing time selection to Actions/Page size */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Select>
              <SelectTrigger className="w-[160px] h-10 text-sm border-gray-200">
                <SelectValue placeholder="처리시간 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OCR">OCR</SelectItem>
                <SelectItem value="AI">AI Model</SelectItem>
                <SelectItem value="TRANSLATION">번역</SelectItem>
                <SelectItem value="TOTAL">총합</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>처리시간</span>
              <Input type="text" className="w-[60px] h-10 border-gray-200 text-center text-[#71717A]" defaultValue="0" />
              <span>~</span>
              <Input type="text" className="w-[60px] h-10 border-gray-200 text-center text-[#71717A]" defaultValue="10" />
              <span>초</span>
            </div>

            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6">
              검색
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-4">
              <Download className="w-4 h-4 mr-2" />
              전체 IMAGE 다운로드
            </Button>
            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-4">
              <Download className="w-4 h-4 mr-2" />
              전체 JSON 다운로드
            </Button>
            
            <div className="flex items-center gap-2 ml-2">
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <AdminTableHeaderRow>
                <AdminTableHead className="px-6 py-4">디바이스 ID</AdminTableHead>
                <AdminTableHead className="px-6 py-4">국가</AdminTableHead>
                <AdminTableHead className="px-6 py-4">분석 일시</AdminTableHead>
                <AdminTableHead className="px-6 py-4">OCR</AdminTableHead>
                <AdminTableHead className="px-6 py-4">AI Model 서버 처리</AdminTableHead>
                <AdminTableHead className="px-6 py-4">번역</AdminTableHead>
                <AdminTableHead className="px-6 py-4">총합</AdminTableHead>
                <AdminTableHead className="px-6 py-4 text-center">JSON</AdminTableHead>
                <AdminTableHead className="px-6 py-4 text-center">상세</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {record.deviceId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2 text-base">{record.countryFlag}</span>
                      {record.countryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {record.analysisDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.ocrTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.aiModelTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.translationTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {record.totalTime}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" className="bg-[#EEF1FF] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] px-4 h-8 rounded-[4px]">
                      다운로드
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/image-analysis/${record.id}`}>
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
