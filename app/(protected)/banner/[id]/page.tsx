'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, FileImage, Link as LinkIcon, Info, Calendar, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PageTitle } from '@/components/ui/page-title';
import Image from 'next/image';

export default function BannerEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isMiddleBanner = id?.startsWith('middle');

  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState(isMiddleBanner ? '' : '봄 시즌 특별 이벤트');
  const [subtitle, setSubtitle] = useState('지금 바로 메뉴 번역 시작!');
  const [tag, setTag] = useState('프로모션');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [link, setLink] = useState('https://graysoft.co.kr');

  return (
    <div className="w-full pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <PageTitle>{isMiddleBanner ? '배너 추가' : '배너 수정'}</PageTitle>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.back()} className="h-[40px] px-6 rounded-[6px] border-gray-300 text-[#18181B] font-[600]">
            취소
          </Button>
          <Button className="flex items-center justify-center gap-[6px] h-[40px] py-[10px] px-[16px] rounded-[6px] bg-[#4186FF] hover:bg-blue-600 text-[#FFFFFF] text-[14px] font-[600] leading-normal">
            <Check className="w-4 h-4" />
            저장
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Form */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-[24px] flex flex-col gap-[20px]">
          <h3 className="text-[16px] font-[700] text-[#18181B] leading-normal">기본 정보</h3>
          
          <div className="flex flex-col gap-[20px]">
            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                배너 제목 <span className="text-[#4186FF]">*</span>
              </label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="배너 제목을 입력하세요" 
                className="h-11 border-[#E4E4E7] placeholder:text-[#71717A]" 
              />
            </div>

            {!isMiddleBanner && (
              <>
                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">부제목</label>
                  <Input 
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="부제목을 입력하세요" 
                    className="h-11 border-[#E4E4E7] placeholder:text-[#71717A]" 
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">태그 작성</label>
                  <Input 
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="태그를 입력하세요" 
                    className="h-11 border-[#E4E4E7] placeholder:text-[#71717A]" 
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">
                    게시 기간 <span className="text-[#4186FF]">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input 
                        type="text" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-11 border-[#E4E4E7] pr-10" 
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-400">~</span>
                    <div className="relative flex-1">
                      <Input 
                        type="text" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-11 border-[#E4E4E7] pr-10" 
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-[600] text-[#18181B] mb-2">연결 링크</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input 
                      type="url" 
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://" 
                      className="pl-10 h-11 border-[#E4E4E7] placeholder:text-[#71717A]" 
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] mb-2">활성화</label>
              <div className="flex items-center space-x-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-[14px] text-gray-500">배너를 즉시 노출합니다</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Preview */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-[24px] flex flex-col gap-[20px]">
            <h3 className="text-[16px] font-[700] text-[#18181B] leading-normal">배너 이미지</h3>
            
            {isMiddleBanner ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer aspect-[4/3]">
                <div className="w-12 h-12 bg-[#eef1ff] text-[#4186FF] rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-[14px] font-bold text-[#18181B] mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                <p className="text-[12px] text-gray-500">PNG, JPG, GIF (최대 5MB)</p>
              </div>
            ) : (
              <div className="relative w-full aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden border border-[#E4E4E7]">
                <Image 
                  src="https://picsum.photos/seed/banner-edit/1080/360" 
                  alt="Banner Preview" 
                  fill 
                  className="object-cover"
                />
              </div>
            )}

            <Button variant="outline" className="w-full h-11 flex items-center justify-center space-x-2 border-gray-200 text-[#18181B] font-[600] hover:bg-gray-50">
              <FileImage className="w-4 h-4" />
              <span>파일 선택</span>
            </Button>

            {!isMiddleBanner && (
              <div className="space-y-3">
                <h4 className="text-[13px] font-[600] text-[#71717A]">이미지 가이드</h4>
                <ul className="text-[12px] text-[#71717A] space-y-2">
                  <li className="flex items-start">
                    <Info className="w-3.5 h-3.5 mr-2 mt-0.5 text-[#A1A1AA]" />
                    권장 사이즈: 1080 × 360px
                  </li>
                  <li className="flex items-start">
                    <Info className="w-3.5 h-3.5 mr-2 mt-0.5 text-[#A1A1AA]" />
                    비율: 3:1 (가로형)
                  </li>
                  <li className="flex items-start">
                    <Info className="w-3.5 h-3.5 mr-2 mt-0.5 text-[#A1A1AA]" />
                    파일 형식: JPG, PNG, GIF
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
