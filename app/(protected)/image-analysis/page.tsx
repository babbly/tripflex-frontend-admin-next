'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analysisApi } from '@/lib/analysis-api';
import { countryApi } from '@/lib/country-api';
import type { LatencyType } from '@/types/analysis';
import { usePagePermission } from '@/hooks/use-page-permission';

const LATENCY_OPTIONS: { label: string; value: LatencyType }[] = [
  { label: '이미지 처리 (Vision)', value: 'VISION' },
  { label: 'AI 분석 (Gemini)', value: 'GEMINI' },
  { label: '번역', value: 'TRANSLATE' },
];

function msToSec(ms: number | undefined): string {
  if (ms == null) return '-';
  return (ms / 1000).toFixed(2);
}

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  return iso.replace('T', ' ').slice(0, 19);
}

function countryCodeToFlag(code: string): string {
  return Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImageAnalysisPage() {
  const { canRead } = usePagePermission('/image-analysis');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const size = parseInt(pageSize, 10);

  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [latencyType, setLatencyType] = useState('');
  const [latencyMinInput, setLatencyMinInput] = useState('');
  const [latencyMaxInput, setLatencyMaxInput] = useState('');
  const [latencyMin, setLatencyMin] = useState<number | undefined>();
  const [latencyMax, setLatencyMax] = useState<number | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeviceId(deviceIdInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [deviceIdInput]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin-analyses',
      page,
      size,
      deviceId,
      countryCode,
      startDate,
      endDate,
      latencyType,
      latencyMin,
      latencyMax,
    ],
    queryFn: () =>
      analysisApi.list({
        page,
        size,
        deviceId: deviceId || undefined,
        countryCode: countryCode || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        latencyType: (latencyType as LatencyType) || undefined,
        latencyMin,
        latencyMax,
      }),
  });

  const { data: countriesData } = useQuery({
    queryKey: ['admin-countries-filter'],
    queryFn: () => countryApi.list({ activeOnly: true, size: 200 }),
    staleTime: 1000 * 60 * 10,
  });

  const records = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handleSearch() {
    const min = latencyMinInput ? Number(latencyMinInput) * 1000 : undefined;
    const max = latencyMaxInput ? Number(latencyMaxInput) * 1000 : undefined;
    setLatencyMin(min);
    setLatencyMax(max);
    setPage(0);
  }

  const currentFilters = {
    deviceId: deviceId || undefined,
    countryCode: countryCode || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    latencyType: (latencyType as LatencyType) || undefined,
    latencyMin,
    latencyMax,
  };

  async function handleRowDownloadJson(id: string) {
    try {
      const blob = await analysisApi.downloadJson(id);
      triggerDownload(blob, `analysis-${id}.json`);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  }

  async function handleDownloadAllImages() {
    try {
      const { blob, truncated } = await analysisApi.downloadImagesZip(currentFilters);
      if (truncated) {
        toast.warning('50건 초과로 일부만 포함되었습니다. 필터를 좁혀 다시 시도하세요.');
      }
      triggerDownload(blob, 'analysis-images.zip');
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  }

  async function handleDownloadAllJson() {
    try {
      const { blob, truncated } = await analysisApi.downloadAllJson(currentFilters);
      if (truncated) {
        toast.warning('1000건 초과로 일부만 포함되었습니다. 필터를 좁혀 다시 시도하세요.');
      }
      triggerDownload(blob, 'analyses.json');
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  }

  if (!canRead) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-[15px] text-gray-400">
        접근 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex flex-col">
        <PageTitle>이미지 분석 목록</PageTitle>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]"
              placeholder="디바이스 ID 검색..."
              value={deviceIdInput}
              onChange={(e) => setDeviceIdInput(e.target.value)}
            />
          </div>

          <Select
            value={countryCode}
            onValueChange={(v) => { setCountryCode(v === '__ALL__' ? '' : v); setPage(0); }}
          >
            <SelectTrigger className="w-[140px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="국가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">전체 국가</SelectItem>
              {(countriesData?.content ?? []).map((c) => (
                <SelectItem key={c.id} value={c.countryCode}>
                  {countryCodeToFlag(c.countryCode)} {c.nameKo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <div className="relative w-[140px]">
              <Input
                type="text"
                className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]"
                placeholder="시작 날짜"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                onFocus={(e) => { e.target.type = 'date'; try { e.target.showPicker(); } catch { } }}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                max={endDate || undefined}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <span className="text-gray-400">~</span>
            <div className="relative w-[140px]">
              <Input
                type="text"
                className="pl-9 h-10 border-gray-200 text-[#71717A] placeholder:text-[#71717A]"
                placeholder="종료 날짜"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                onFocus={(e) => { e.target.type = 'date'; try { e.target.showPicker(); } catch { } }}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                min={startDate || undefined}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={latencyType}
              onValueChange={(v) => setLatencyType(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[180px] h-10 text-sm border-gray-200">
                <SelectValue placeholder="처리시간 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">전체</SelectItem>
                {LATENCY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>처리시간</span>
              <Input
                type="number"
                min={0}
                className="w-[60px] h-10 border-gray-200 text-center text-[#71717A]"
                placeholder="0"
                value={latencyMinInput}
                onChange={(e) => setLatencyMinInput(e.target.value)}
              />
              <span>~</span>
              <Input
                type="number"
                min={0}
                className="w-[60px] h-10 border-gray-200 text-center text-[#71717A]"
                placeholder="10"
                value={latencyMaxInput}
                onChange={(e) => setLatencyMaxInput(e.target.value)}
              />
              <span>초</span>
            </div>

            <Button
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6"
              onClick={handleSearch}
            >
              검색
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={records.length === 0}
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-4 disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA] disabled:cursor-not-allowed"
              onClick={handleDownloadAllImages}
            >
              <Download className="w-4 h-4 mr-2" />
              전체 IMAGE 다운로드
            </Button>
            <Button
              disabled={records.length === 0}
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-4 disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA] disabled:cursor-not-allowed"
              onClick={handleDownloadAllJson}
            >
              <Download className="w-4 h-4 mr-2" />
              전체 JSON 다운로드
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
        <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
          <span className="text-[13px] text-gray-500">페이지당</span>
          <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(0); }}>
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
                <AdminTableHead className="px-6 py-4">디바이스 ID</AdminTableHead>
                <AdminTableHead className="px-6 py-4">국가</AdminTableHead>
                <AdminTableHead className="px-6 py-4">분석 일시</AdminTableHead>
                <AdminTableHead className="px-6 py-4">이미지 처리</AdminTableHead>
                <AdminTableHead className="px-6 py-4">OCR</AdminTableHead>
                <AdminTableHead className="px-6 py-4">AI</AdminTableHead>
                <AdminTableHead className="px-6 py-4">번역</AdminTableHead>
                <AdminTableHead className="px-6 py-4">총합</AdminTableHead>
                <AdminTableHead className="px-6 py-4 text-center">JSON</AdminTableHead>
                <AdminTableHead className="px-6 py-4 text-center">상세</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-400">
                    {deviceId || countryCode || startDate || endDate || latencyType
                      ? '검색 결과가 없습니다.'
                      : '분석 데이터가 없습니다.'}
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {record.deviceId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span>{countryCodeToFlag(record.countryCode)}</span>
                        <span>{record.countryName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(record.insDttm)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{msToSec(record.imageUploadMs)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{msToSec(record.ocrMs)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{msToSec(record.aiMs)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{msToSec(record.translateMs)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{msToSec(record.totalMs)}</td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        className="bg-[#EEF1FF] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] px-4 h-8 rounded-[4px]"
                        onClick={() => handleRowDownloadJson(record.id)}
                      >
                        다운로드
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/image-analysis/${record.id}`}>
                        <Button
                          variant="ghost"
                          className="bg-[#EEF1FF] text-[#4186FF] hover:bg-[#E0EFFF] hover:text-[#4186FF] text-[13px] font-[600] px-4 h-8 rounded-[4px]"
                        >
                          보기
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
              className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'}`}
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
      </div>
    </div>
  );
}
