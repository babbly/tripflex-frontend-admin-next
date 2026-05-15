'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { suggestionApi, suggestionCategoryApi } from '@/lib/suggestion-api';
import {
  SUGGESTION_STATUSES,
  SUGGESTION_STATUS_LABELS,
  SuggestionStatus,
} from '@/types/suggestion';
import { ApiError } from '@/types/api';

const CATEGORY_ALL = '__ALL__';
const STATUS_ALL = '__ALL__';

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  return iso.replace('T', ' ').slice(0, 16);
}

export default function SuggestionsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const size = parseInt(pageSize, 10);

  const [contentInput, setContentInput] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SuggestionStatus | ''>('');
  const [categoryCode, setCategoryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setContent(contentInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [contentInput]);

  const hasSearchCondition =
    content.length > 0 ||
    status !== '' ||
    categoryCode !== '' ||
    startDate !== '' ||
    endDate !== '';

  const { data: catData } = useQuery({
    queryKey: ['suggestion-categories-all'],
    queryFn: () =>
      suggestionCategoryApi.list({ page: 0, size: 500, activeOnly: false }),
  });
  const categories = catData?.content ?? [];

  const queryParams = {
    page,
    size,
    status: status || undefined,
    content: content || undefined,
    categoryCode: categoryCode || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['suggestions', queryParams],
    queryFn: () => suggestionApi.list(queryParams),
  });

  const records = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const findCategory = (codeOrId?: string) =>
    codeOrId
      ? categories.find((c) => c.code === codeOrId || c.id === codeOrId)
      : undefined;

  const handleDownloadJson = async () => {
    try {
      const blob = await suggestionApi.downloadJson({
        status: status || undefined,
        content: content || undefined,
        categoryCode: categoryCode || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suggestions-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDownloadImages = async () => {
    try {
      const blob = await suggestionApi.downloadImagesZip({
        status: status || undefined,
        content: content || undefined,
        categoryCode: categoryCode || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suggestions-images-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col">
        <PageTitle>유저 제안 관리</PageTitle>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="relative w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]"
              placeholder="제안 내용 검색..."
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
            />
          </div>

          <Select
            value={categoryCode || CATEGORY_ALL}
            onValueChange={(v) => {
              setCategoryCode(v === CATEGORY_ALL ? '' : v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CATEGORY_ALL}>전체 카테고리</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.code}>
                  {c.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status || STATUS_ALL}
            onValueChange={(v) => {
              setStatus(v === STATUS_ALL ? '' : (v as SuggestionStatus));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[140px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_ALL}>전체 상태</SelectItem>
              {SUGGESTION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SUGGESTION_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <div className="relative w-[150px]">
              <Input
                type="text"
                className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]"
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
            <span className="text-gray-400">~</span>
            <div className="relative w-[150px]">
              <Input
                type="text"
                className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]"
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

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadJson}
            disabled={records.length === 0}
            style={
              records.length === 0
                ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
                : undefined
            }
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10 px-4 disabled:hover:bg-[#E4E4E7]"
          >
            <Download className="w-4 h-4 mr-2" />
            전체 JSON 다운로드
          </Button>
          <Button
            onClick={handleDownloadImages}
            disabled={records.length === 0}
            style={
              records.length === 0
                ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
                : undefined
            }
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10 px-4 disabled:hover:bg-[#E4E4E7]"
          >
            <Download className="w-4 h-4 mr-2" />
            전체 IMAGE 다운로드
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
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
              <AdminTableHeaderRow>
                <AdminTableHead className="px-6 py-4 w-24">이미지</AdminTableHead>
                <AdminTableHead className="px-6 py-4">디바이스 ID</AdminTableHead>
                <AdminTableHead className="px-6 py-4">태그</AdminTableHead>
                <AdminTableHead className="px-6 py-4">상세 내용</AdminTableHead>
                <AdminTableHead className="px-6 py-4">제안 일시</AdminTableHead>
                <AdminTableHead className="px-6 py-4 text-center">상태</AdminTableHead>
                <AdminTableHead className="px-6 py-4 w-24 text-right">상세</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    불러오는 중...
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-red-500">
                    {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    {hasSearchCondition
                      ? '검색 결과가 없습니다.'
                      : '등록된 제안이 없습니다.'}
                  </td>
                </tr>
              )}
              {records.map((r) => {
                const cat = findCategory(r.categoryCode || r.categoryId);
                const statusKey = (r.status as SuggestionStatus) || 'PENDING';
                return (
                  <tr key={r.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-[42px] h-[42px] bg-gray-100 rounded-md overflow-hidden">
                        {r.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {r.deviceId || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className="bg-[#EEF1FF] text-[#4186FF] text-[11px] font-[600] leading-normal border-none shadow-none"
                      >
                        {r.categoryName || cat?.shortName || cat?.fullName || r.categoryCode || '-'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[400px]">
                      {r.content}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(r.insDttm)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="secondary"
                        className={`font-semibold text-[11px] ${
                          statusKey === 'PENDING'
                            ? 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FEF3C7]'
                            : statusKey === 'REVIEWED'
                              ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5]'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {SUGGESTION_STATUS_LABELS[statusKey] || r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/suggestions/${r.id}`}>
                        <Button
                          variant="ghost"
                          className="bg-[#EEF1FF] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] px-4 h-8 rounded-[4px]"
                        >
                          보기
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-end p-4 items-center space-x-1 bg-white border-t border-gray-100">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
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
                className={`w-8 h-8 p-0 ${
                  p === page
                    ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
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
