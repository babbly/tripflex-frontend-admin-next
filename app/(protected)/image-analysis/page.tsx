'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
interface AnalysisRecord {
  id: string;
  deviceId: string;
  countryFlag: string;
  countryName: string;
  analysisDate: string;
}

export default function ImageAnalysisPage() {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const [records] = useState<AnalysisRecord[]>([
    {
      id: '1',
      deviceId: 'DEV-20483A',
      countryFlag: '🇯🇵',
      countryName: '일본',
      analysisDate: '2026-03-19 14:32:05',
    },
    {
      id: '2',
      deviceId: 'DEV-10291B',
      countryFlag: '🇫🇷',
      countryName: '프랑스',
      analysisDate: '2026-03-19 13:58:42',
    },
    {
      id: '3',
      deviceId: 'DEV-38847C',
      countryFlag: '🇺🇸',
      countryName: '미국',
      analysisDate: '2026-03-19 13:21:17',
    },
  ]);

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col">
        <PageTitle>이미지 분석 목록</PageTitle>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          {/* Device ID Search */}
          <div className="relative w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="디바이스 ID 검색..." />
          </div>

          {/* Country Select */}
          <div className="relative w-[140px]">
            <select className="w-full h-10 pl-3 pr-8 text-sm border border-gray-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[#71717A]">
              <option value="">국가 선택</option>
              <option value="JP">일본</option>
              <option value="FR">프랑스</option>
              <option value="US">미국</option>
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
            <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="시작 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
          </div>

          {/* End Date */}
          <div className="relative w-[150px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <Input type="text" className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]" placeholder="종료 날짜" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} />
          </div>
        </div>

        {/* Download Button */}
        <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[38px] px-4">
          <Download className="w-4 h-4 mr-2" />
          전체 JSON 다운로드
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <AdminTableHeaderRow>
                <AdminTableHead className="w-24">미리보기</AdminTableHead>
                <AdminTableHead>디바이스 ID</AdminTableHead>
                <AdminTableHead>국가</AdminTableHead>
                <AdminTableHead>분석 일시</AdminTableHead>
                <AdminTableHead className="w-24 text-center">JSON</AdminTableHead>
                <AdminTableHead className="w-24 text-center">상세</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b last:border-0 bg-white hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-[42px] h-[42px] bg-gray-200 rounded-md"></div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {record.deviceId}
                  </td>
                  <td className="p-4 text-sm text-gray-600 flex items-center mt-[10px]">
                    <span className="mr-1 text-base">{record.countryFlag}</span>
                    {record.countryName}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {record.analysisDate}
                  </td>
                  <td className="p-4 text-center">
                    <Button variant="ghost" className="flex items-start py-[6px] px-[12px] bg-[#EEF1FF] rounded-[5px] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] leading-normal not-italic h-auto">
                      다운로드
                    </Button>
                  </td>
                  <td className="p-4 text-center">
                    <Link href={`/image-analysis/${record.id}`}>
                      <Button variant="ghost" className="flex items-start py-[6px] px-[12px] bg-[#EEF1FF] rounded-[5px] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] leading-normal not-italic h-auto">
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
