'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, UploadCloud, FileImage, Link as LinkIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PageTitle } from '@/components/ui/page-title';

export default function BannerCreatePage() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="w-full pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <PageTitle>배너 추가</PageTitle>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.back()} className="px-6 border-gray-300 text-gray-700">
            취소
          </Button>
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white px-6">
            <Check className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Form */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-8 space-y-8">
          <h3 className="text-[15px] font-[700] text-[#18181B] leading-normal not-italic border-b pb-4">기본 정보</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] leading-normal not-italic mb-2">
                배너 제목 <span className="text-[#18181B]">*</span>
              </label>
              <Input placeholder="배너 제목을 입력하세요" className="h-11" />
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] leading-normal not-italic mb-2">부제목</label>
              <Input placeholder="부제목을 입력하세요" className="h-11" />
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] leading-normal not-italic mb-2">태그 작성</label>
              <Input placeholder="태그를 입력하세요" className="h-11" />
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] leading-normal not-italic mb-2">
                게시 기간 <span className="text-[#18181B]">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <Input type="date" className="h-11 flex-1 text-gray-500" />
                <span className="text-gray-400">~</span>
                <Input type="date" className="h-11 flex-1 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-[600] text-[#18181B] leading-normal not-italic mb-2">연결 링크</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                </div>
                <Input type="url" placeholder="https://" className="pl-10 h-11" />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[13px] font-[600] text-[#18181B] leading-normal not-italic mb-3">활성화</label>
              <div className="flex items-center space-x-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-[14px] text-gray-600">배너를 즉시 노출합니다</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 space-y-6">
            <h3 className="text-[15px] font-[700] text-[#18181B] leading-normal not-italic border-b pb-4">배너 이미지</h3>
            
            <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-[#eef1ff] text-[#4186FF] rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-[14px] font-bold text-[#18181B] mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
              <p className="text-[12px] text-gray-500">PNG, JPG, GIF (최대 5MB)</p>
            </div>

            <Button variant="outline" className="w-full h-11 flex items-center justify-center space-x-2 border-gray-300 text-gray-700">
              <FileImage className="w-4 h-4" />
              <span className="font-[600]">파일 선택</span>
            </Button>

            <div className="pt-4">
              <h4 className="text-[13px] font-[600] text-gray-700 mb-3">이미지 가이드</h4>
              <ul className="text-[12px] text-gray-500 space-y-2.5">
                <li className="flex items-center">
                  <Info className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  권장 사이즈: 1080 × 360px
                </li>
                <li className="flex items-center">
                  <Info className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  비율: 3:1 (가로형)
                </li>
                <li className="flex items-center">
                  <Info className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  파일 형식: JPG, PNG, GIF
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
