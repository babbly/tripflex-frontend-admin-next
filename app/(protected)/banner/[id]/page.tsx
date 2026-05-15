'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  CloudUpload,
  ImagePlus,
  Info,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PageTitle } from '@/components/ui/page-title';
import { bannerApi } from '@/lib/banner-api';
import { BannerResponse } from '@/types/banner';
import { ApiError } from '@/types/api';
import { ImageLightbox } from '@/components/ui/image-lightbox';

function toIsoStart(date: string) {
  return date ? `${date}T00:00:00` : undefined;
}
function toIsoEnd(date: string) {
  return date ? `${date}T23:59:59` : undefined;
}
function isoToDate(iso?: string) {
  return iso ? iso.slice(0, 10) : '';
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const URL_PATTERN = /^https?:\/\/.+/i;

export default function BannerEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['banner', id],
    queryFn: () => bannerApi.detail(id),
    enabled: !!id,
  });

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!data || hydrated) return;
    const b: BannerResponse = data;
    setTitle(b.title ?? '');
    setSubtitle(b.subtitle ?? '');
    setTag(b.tag ?? '');
    setExistingImageUrl(b.imageUrl ?? '');
    setLinkUrl(b.linkUrl ?? '');
    setStartDate(isoToDate(b.startAt));
    setEndDate(isoToDate(b.endAt));
    setIsActive(b.active);
    setHydrated(true);
  }, [data, hydrated]);

  useEffect(() => {
    if (!imageFile) {
      setFilePreview('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const isHome = data?.position === 'HOME';
  const previewUrl = filePreview || existingImageUrl;

  const validateAndSetFile = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('PNG, JPG, GIF 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('이미지 용량은 최대 5MB까지 가능합니다.');
      return;
    }
    setImageFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const isLinkValid = !linkUrl || URL_PATTERN.test(linkUrl);
  const hasImage = !!imageFile || !!existingImageUrl;
  const isFormValid =
    title.trim().length > 0 &&
    hasImage &&
    (isHome || (startDate.length > 0 && endDate.length > 0)) &&
    isLinkValid;

  const updateMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = existingImageUrl;
      let imagePath = data?.imagePath;
      if (imageFile) {
        const uploaded = await bannerApi.uploadImage(imageFile);
        imageUrl = uploaded.imageUrl;
        imagePath = uploaded.imagePath ?? imagePath;
      }
      return bannerApi.update(id, {
        title,
        imageUrl,
        imagePath,
        subtitle: isHome ? undefined : subtitle || undefined,
        tag: isHome ? undefined : tag || undefined,
        linkUrl: isHome ? undefined : linkUrl || undefined,
        position: data?.position,
        startAt: isHome ? undefined : toIsoStart(startDate),
        endAt: isHome ? undefined : toIsoEnd(endDate),
        active: isActive,
        displayOrder: data?.displayOrder,
      });
    },
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['banner', id] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      router.replace('/banner');
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '수정에 실패했습니다.');
    },
  });

  const handleSubmit = () => {
    if (!isFormValid) return;
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full p-12 text-center text-gray-500 text-sm">
        불러오는 중...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full p-12 text-center text-red-500 text-sm">
        {error instanceof ApiError ? error.message : '배너를 불러오지 못했습니다.'}
      </div>
    );
  }

  const disabledBtnStyle =
    !isFormValid || updateMutation.isPending
      ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
      : undefined;

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
          <PageTitle>{isHome ? '홈 이미지 수정' : '배너 수정'}</PageTitle>
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
            disabled={!isFormValid || updateMutation.isPending}
            style={disabledBtnStyle}
            className="flex items-center justify-center gap-[6px] h-[38px] py-[10px] px-[16px] rounded-[6px] bg-[#4186FF] hover:bg-blue-600 text-[#FFFFFF] text-[14px] font-[600] leading-normal disabled:hover:bg-[#E4E4E7]"
          >
            <Check className="w-4 h-4" />
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-[24px] flex flex-col gap-[20px]">
          <h3 className="text-[15px] font-[700] text-[#18181B] leading-normal">
            기본 정보
          </h3>
          <div className="h-px bg-[#E4E4E7]" />

          <div className="flex flex-col gap-[20px]">
            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                {isHome ? '이미지 제목' : '배너 제목'} <span className="text-[#18181B]">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isHome ? '이미지 제목을 입력하세요' : '배너 제목을 입력하세요'}
                maxLength={200}
                className="h-10 placeholder:text-[#9CA3AF]"
              />
            </div>

            {!isHome && (
              <>
                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                    부제목
                  </label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="부제목을 입력하세요"
                    maxLength={300}
                    className="h-10 placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                    태그 작성
                  </label>
                  <Input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="태그를 입력하세요"
                    maxLength={50}
                    className="h-10 placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                    게시 기간 <span className="text-[#18181B]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        className="h-10 pr-9 text-gray-700"
                        value={startDate}
                        onChange={(e) => {
                          const v = e.target.value;
                          setStartDate(v);
                          if (endDate && v && endDate < v) setEndDate('');
                        }}
                        max={endDate || undefined}
                      />
                      <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    </div>
                    <span className="text-[#71717A] text-[14px]">~</span>
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        className="h-10 pr-9 text-gray-700"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || undefined}
                      />
                      <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                    연결 링크
                  </label>
                  <div className="relative">
                    <LinkIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <Input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://"
                      maxLength={500}
                      className={`pl-10 h-10 placeholder:text-[#9CA3AF] ${
                        linkUrl && !isLinkValid ? 'border-red-400' : ''
                      }`}
                    />
                  </div>
                  {linkUrl && !isLinkValid && (
                    <p className="mt-1 text-[12px] text-red-500">
                      http:// 또는 https:// 로 시작해야 합니다.
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                활성화
              </label>
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-[13px] text-[#71717A]">
                  {isHome ? '이미지를 노출합니다' : '배너를 즉시 노출합니다'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[360px] flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-[24px] flex flex-col gap-[20px]">
            <h3 className="text-[15px] font-[700] text-[#18181B] leading-normal">
              {isHome ? '이미지' : '배너 이미지'}
            </h3>
            <div className="h-px bg-[#E4E4E7]" />

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full aspect-[3/1] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[8px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightboxSrc(previewUrl)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setExistingImageUrl('');
                  }}
                  aria-label="이미지 제거"
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`bg-[#F9FAFB] border border-dashed rounded-[8px] h-[180px] flex flex-col items-center justify-center gap-[12px] cursor-pointer transition-colors ${
                  isDragOver ? 'border-[#4186FF] bg-[#EEF1FF]' : 'border-[#D1D5DB]'
                }`}
              >
                <div className="bg-[#EEF1FF] w-12 h-12 rounded-full flex items-center justify-center">
                  <CloudUpload className="w-6 h-6 text-[#4186FF]" />
                </div>
                <p className="text-[13px] font-[600] text-[#18181B]">
                  이미지를 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-[12px] text-[#71717A]">PNG, JPG, GIF (최대 5MB)</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[38px] flex items-center justify-center gap-2 border border-[#E4E4E7] rounded-[6px] bg-white hover:bg-gray-50 text-[14px] font-[500] text-[#18181B] transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              파일 선택
            </button>

            {!isHome && (
              <div className="flex flex-col gap-[8px]">
                <h4 className="text-[12px] font-[600] text-[#71717A]">이미지 가이드</h4>
                <div className="flex items-center gap-[6px]">
                  <Info className="w-3 h-3 text-[#9CA3AF]" />
                  <p className="text-[12px] text-[#9CA3AF]">권장 사이즈: 1080 x 360px</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <Info className="w-3 h-3 text-[#9CA3AF]" />
                  <p className="text-[12px] text-[#9CA3AF]">비율: 3:1 (가로형)</p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <Info className="w-3 h-3 text-[#9CA3AF]" />
                  <p className="text-[12px] text-[#9CA3AF]">파일 형식: JPG, PNG, GIF</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
