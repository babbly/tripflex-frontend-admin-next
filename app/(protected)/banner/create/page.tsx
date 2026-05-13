'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Info, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PageTitle } from '@/components/ui/page-title';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bannerApi } from '@/lib/banner-api';
import {
  BANNER_POSITION_LABELS,
  BANNER_POSITIONS,
  BannerPosition,
} from '@/types/banner';
import { ApiError } from '@/types/api';

function toIsoStart(date: string) {
  return date ? `${date}T00:00:00` : undefined;
}
function toIsoEnd(date: string) {
  return date ? `${date}T23:59:59` : undefined;
}

export default function BannerCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPosition = (searchParams.get('position') as BannerPosition) || 'TOP';

  const [position, setPosition] = useState<BannerPosition>(
    BANNER_POSITIONS.includes(initialPosition) ? initialPosition : 'TOP',
  );
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const createMutation = useMutation({
    mutationFn: () =>
      bannerApi.create({
        title,
        imageUrl,
        subtitle: subtitle || undefined,
        linkUrl: linkUrl || undefined,
        position,
        startAt: toIsoStart(startDate),
        endAt: toIsoEnd(endDate),
        active: isActive,
      }),
    onSuccess: () => {
      toast.success('배너가 등록되었습니다.');
      router.replace('/banner');
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '등록에 실패했습니다.');
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('배너 제목을 입력해주세요.');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('이미지 URL을 입력해주세요.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="w-full pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <PageTitle>배너 추가</PageTitle>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-[38px] px-6 rounded-[6px] border-gray-300 text-gray-700"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex items-center justify-center gap-[6px] h-[38px] py-[10px] px-[16px] rounded-[6px] bg-[#4186FF] hover:bg-blue-600 text-[#FFFFFF] text-[14px] font-[600] leading-normal"
          >
            <Check className="w-4 h-4" />
            {createMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-[24px] flex flex-col gap-[20px]">
          <h3 className="text-[15px] font-[700] text-[#18181B] leading-normal">
            기본 정보
          </h3>

          <div className="flex flex-col gap-[20px]">
            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                배너 위치 <span className="text-[#18181B]">*</span>
              </label>
              <Select
                value={position}
                onValueChange={(v) => setPosition(v as BannerPosition)}
              >
                <SelectTrigger className="h-11 w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {BANNER_POSITION_LABELS[p]}배너 ({p})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                배너 제목 <span className="text-[#18181B]">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="배너 제목을 입력하세요"
                maxLength={200}
                className="h-11 placeholder:text-[#71717A]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                부제목
              </label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="부제목을 입력하세요"
                maxLength={300}
                className="h-11 placeholder:text-[#71717A]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                게시 기간
              </label>
              <div className="flex items-center space-x-3">
                <Input
                  type="date"
                  className="h-11 flex-1 text-gray-700"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
                <span className="text-gray-400">~</span>
                <Input
                  type="date"
                  className="h-11 flex-1 text-gray-700"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                연결 링크
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://"
                  maxLength={500}
                  className="pl-10 h-11 placeholder:text-[#71717A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                활성화
              </label>
              <div className="flex items-center space-x-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-[14px] text-gray-600">
                  배너를 즉시 노출합니다
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-[24px] flex flex-col gap-[20px]">
            <h3 className="text-[15px] font-[700] text-[#18181B] leading-normal">
              배너 이미지
            </h3>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                이미지 URL <span className="text-[#18181B]">*</span>
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                maxLength={500}
                className="h-11 placeholder:text-[#71717A]"
              />
            </div>

            {imageUrl && (
              <div className="relative w-full aspect-[3/1] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h4 className="text-[13px] font-[600] text-gray-700 mb-3">안내</h4>
              <ul className="text-[12px] text-gray-500 space-y-2.5">
                <li className="flex items-start">
                  <Info className="w-3.5 h-3.5 mr-2 mt-0.5 text-gray-400 shrink-0" />
                  파일 업로드 기능은 준비 중입니다. (AWS S3 키 수령 후 제공)
                  현재는 외부 이미지 URL만 입력해주세요.
                </li>
                <li className="flex items-start">
                  <Info className="w-3.5 h-3.5 mr-2 mt-0.5 text-gray-400 shrink-0" />
                  권장 비율 3:1 (예: 1080 × 360)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
