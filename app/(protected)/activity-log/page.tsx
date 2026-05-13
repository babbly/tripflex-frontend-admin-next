'use client';

// 관리자 활동 로그 (read-only).
// api.json: GET /api/admin/activity-logs — keyword/actionType/startDate/endDate 필터
// actionType 값 카탈로그: api.md / P-11 기획 확정 전이라 현재 UI의 옵션 그대로 유지.

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AdminTableHead,
  AdminTableHeaderRow,
} from '@/components/ui/admin-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { activityLogApi } from '@/lib/activity-log-api';
import { ApiError } from '@/types/api';

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  // 백엔드가 KST 가정으로 ISO date-time을 그대로 전달 (timezone 마커 없음). slice로 표시만.
  return iso.replace('T', ' ').slice(0, 19);
}

export default function ActivityLogPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const [keyword, setKeyword] = useState('');
  const [actionType, setActionType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const size = parseInt(pageSize, 10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'activity-logs',
      { page, size, keyword, actionType, startDate, endDate },
    ],
    queryFn: () =>
      activityLogApi.list({
        page,
        size,
        keyword: keyword || undefined,
        actionType: actionType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="w-full flex flex-col space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <PageTitle>관리자 활동 로그</PageTitle>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative w-[320px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-9 h-11 border-gray-200 bg-white text-[#18181B] placeholder:text-[#A1A1AA] rounded-[8px]"
              placeholder="작업자 및 대상자 검색"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <div className="relative w-[180px]">
            <select
              className="w-full h-11 pl-4 pr-10 text-sm border border-gray-200 rounded-[8px] appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#4186FF] focus:border-[#4186FF] text-[#18181B]"
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setPage(0);
              }}
            >
              <option value="">전체</option>
              <optgroup label="계정 관리">
                <option value="계정 생성">계정 생성</option>
                <option value="계정 수정">계정 수정</option>
                <option value="계정 삭제">계정 삭제</option>
                <option value="권한 변경">권한 변경</option>
              </optgroup>
              <optgroup label="배너 관리">
                <option value="배너 추가">배너 추가</option>
                <option value="배너 수정">배너 수정</option>
                <option value="배너 삭제">배너 삭제</option>
              </optgroup>
              <optgroup label="FAQ 관리">
                <option value="FAQ 추가">FAQ 추가</option>
                <option value="FAQ 수정">FAQ 수정</option>
                <option value="FAQ 삭제">FAQ 삭제</option>
              </optgroup>
              <optgroup label="국가 관리">
                <option value="국가 추가">국가 추가</option>
                <option value="국가 수정">국가 수정</option>
                <option value="국가 삭제">국가 삭제</option>
              </optgroup>
              <optgroup label="기타">
                <option value="제안 확인">제안 확인</option>
              </optgroup>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-[180px]">
              <Input
                type="text"
                className="pl-9 h-11 border-gray-200 bg-white text-[#18181B] placeholder:text-[#A1A1AA] rounded-[8px]"
                placeholder="시작 날짜"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                onFocus={(e) => {
                  e.target.type = 'date';
                  try {
                    e.target.showPicker();
                  } catch {
                    /* noop */
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                max={endDate || undefined}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="relative w-[180px]">
              <Input
                type="text"
                className="pl-9 h-11 border-gray-200 bg-white text-[#18181B] placeholder:text-[#A1A1AA] rounded-[8px]"
                placeholder="종료 날짜"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                onFocus={(e) => {
                  e.target.type = 'date';
                  try {
                    e.target.showPicker();
                  } catch {
                    /* noop */
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                min={startDate || undefined}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-gray-200 flex flex-col shadow-sm overflow-hidden">
        <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
          <span className="text-[13px] text-gray-500">페이지당</span>
          <Select
            value={pageSize}
            onValueChange={(val) => {
              setPageSize(val);
              setPage(0);
            }}
          >
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
              <AdminTableHeaderRow className="bg-gray-50 border-b border-gray-100">
                <AdminTableHead className="px-6 py-5 text-[13px] font-[600] text-[#71717A]">
                  시간
                </AdminTableHead>
                <AdminTableHead className="px-6 py-5 text-[13px] font-[600] text-[#71717A]">
                  메뉴
                </AdminTableHead>
                <AdminTableHead className="px-6 py-5 text-[13px] font-[600] text-[#71717A]">
                  작업 유형
                </AdminTableHead>
                <AdminTableHead className="px-6 py-5 text-[13px] font-[600] text-[#71717A]">
                  작업자
                </AdminTableHead>
                <AdminTableHead className="px-6 py-5 text-[13px] font-[600] text-[#71717A]">
                  작업자 아이디
                </AdminTableHead>
                <AdminTableHead className="px-6 py-5 text-[13px] font-[600] text-[#71717A]">
                  상세설명
                </AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    불러오는 중...
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-red-500">
                    {error instanceof ApiError ? error.message : '로그를 불러오지 못했습니다.'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    조회된 로그가 없습니다.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 text-[14px] font-[600] text-[#18181B] whitespace-nowrap">
                    {formatDateTime(log.insDttm)}
                  </td>
                  <td className="px-6 py-5 text-[14px] text-[#18181B]">{log.menuCode || '-'}</td>
                  <td className="px-6 py-5 text-[14px] text-[#18181B]">{log.actionType || '-'}</td>
                  <td className="px-6 py-5 text-[14px] text-[#18181B]">{log.adminName || '-'}</td>
                  <td className="px-6 py-5 text-[14px] text-[#18181B]">{log.adminLoginId || '-'}</td>
                  <td className="px-6 py-5 text-[14px] text-[#18181B]">{log.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-end p-5 items-center space-x-1 bg-white border-t border-gray-50">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50 rounded-[4px]"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'primary' : 'outline'}
                size="icon"
                className={`w-8 h-8 p-0 rounded-[4px] text-[13px] font-[600] ${
                  p === page
                    ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm'
                    : 'border-gray-200 text-[#71717A] hover:bg-gray-50'
                }`}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50 rounded-[4px]"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
