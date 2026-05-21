'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { analysisApi } from '@/lib/analysis-api';

const ScanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M2 4.66667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H4.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.3334 2H12.6667C13.0203 2 13.3595 2.14048 13.6095 2.39052C13.8596 2.64057 14 2.97971 14 3.33333V4.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11.332V12.6654C14 13.019 13.8596 13.3581 13.6095 13.6082C13.3595 13.8582 13.0203 13.9987 12.6667 13.9987H11.3334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.66667 13.9987H3.33333C2.97971 13.9987 2.64057 13.8582 2.39052 13.6082C2.14048 13.3581 2 13.019 2 12.6654V11.332" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

export default function ImageAnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [downloadingJson, setDownloadingJson] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-analysis-detail', id],
    queryFn: () => analysisApi.detail(id),
    enabled: !!id,
  });

  async function handleDownloadJson() {
    setDownloadingJson(true);
    try {
      const blob = await analysisApi.downloadJson(id);
      triggerDownload(blob, `analysis-${id}.json`);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDownloadingJson(false);
    }
  }

  async function handleDownloadZip() {
    setDownloadingZip(true);
    try {
      const blob = await analysisApi.downloadZip(id);
      triggerDownload(blob, `analysis-${id}.zip`);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDownloadingZip(false);
    }
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="flex items-center space-x-3">
          <Link href="/image-analysis">
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </Button>
          </Link>
          <PageTitle>이미지 분석 상세</PageTitle>
        </div>
        <div className="text-sm text-gray-400 py-12 text-center">불러오는 중...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="flex items-center space-x-3">
          <Link href="/image-analysis">
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </Button>
          </Link>
          <PageTitle>이미지 분석 상세</PageTitle>
        </div>
        <div className="text-sm text-gray-400 py-12 text-center">분석 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/image-analysis">
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </Button>
          </Link>
          <PageTitle>이미지 분석 상세</PageTitle>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 relative">
        <div className="absolute top-8 right-8 flex items-center space-x-3">
          <Button
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6 rounded-lg"
            onClick={handleDownloadJson}
            disabled={downloadingJson}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingJson ? '다운로드 중...' : '전체 JSON 다운로드'}
          </Button>
          <Button
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6 rounded-lg"
            onClick={handleDownloadZip}
            disabled={downloadingZip}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingZip ? '다운로드 중...' : '전체 IMAGE 다운로드'}
          </Button>
        </div>

        <div className="space-y-8">
          <div className="flex items-center space-x-8">
            <div className="min-w-[120px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">디바이스 ID</div>
              <div className="text-[15px] font-bold text-gray-900">{data.deviceId}</div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div className="min-w-[80px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">국가</div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[14px]">{countryCodeToFlag(data.countryCode)}</span>
                <span className="text-[15px] font-bold text-gray-900">{data.countryName}</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div>
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">분석 일시</div>
              <div className="text-[15px] font-bold text-gray-900">{formatDateTime(data.insDttm)}</div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div>
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">상태</div>
              <div className="text-[15px] font-bold text-gray-900">{data.status}</div>
            </div>
          </div>

          <div className="flex items-center space-x-8 border-t border-gray-50 pt-6">
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">이미지 처리</div>
              <div className="text-[15px] font-bold text-gray-900">{msToSec(data.imageUploadMs)}</div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">OCR</div>
              <div className="text-[15px] font-bold text-gray-900">{msToSec(data.ocrMs)}</div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">AI</div>
              <div className="text-[15px] font-bold text-gray-900">{msToSec(data.aiMs)}</div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">번역</div>
              <div className="text-[15px] font-bold text-gray-900">{msToSec(data.translateMs)}</div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-gray-200" />
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">총 합</div>
              <div className="text-[15px] font-bold text-gray-900">{msToSec(data.totalMs)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Image Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-[16px] font-[700] text-gray-900">원본 이미지</h2>
        </div>
        {data.imageUrl ? (
          <div className="flex flex-col space-y-3 w-[206px]">
            <AspectRatio ratio={206 / 145}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl}
                alt="원본 이미지"
                className="w-full h-full object-cover rounded-lg border border-gray-200"
              />
            </AspectRatio>
            <Button
              variant="outline"
              className="w-full h-8 border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] font-[600] px-2"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
            >
              <Download className="w-3 h-3 mr-1" />
              이미지
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[145px] w-[206px] bg-gray-100 rounded-lg border border-gray-100">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Analyzed Images Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ScanIcon className="w-5 h-5 text-[#4186FF]" />
          <h2 className="text-[16px] font-[700] text-gray-900">분석 이미지</h2>
        </div>
        {data.analysisImages && data.analysisImages.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {data.analysisImages.map((img) => (
              <div key={img.id} className="flex flex-col space-y-2 w-[206px]">
                <div className="relative">
                  <AspectRatio ratio={206 / 145}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt="분석 이미지"
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                  </AspectRatio>
                  <span
                    className={`absolute top-2 right-2 text-[11px] font-[600] px-2 py-0.5 rounded-full ${img.recognized
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {img.recognized ? '인식됨' : '미인식'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">분석 이미지가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
