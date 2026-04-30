'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Expand, ImageIcon } from 'lucide-react';
import Link from 'next/link';

const ScanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M2 4.66667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H4.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3334 2H12.6667C13.0203 2 13.3595 2.14048 13.6095 2.39052C13.8596 2.64057 14 2.97971 14 3.33333V4.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11.332V12.6654C14 13.019 13.8596 13.3581 13.6095 13.6082C13.3595 13.8582 13.0203 13.9987 12.6667 13.9987H11.3334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.66667 13.9987H3.33333C2.97971 13.9987 2.64057 13.8582 2.39052 13.6082C2.14048 13.3581 2 13.019 2 12.6654V11.332" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScanPlaceholderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M6 14V10C6 8.93913 6.42143 7.92172 7.17157 7.17157C7.92172 6.42143 8.93913 6 10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M34 6H38C39.0609 6 40.0783 6.42143 40.8284 7.17157C41.5786 7.92172 42 8.93913 42 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42 34V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0783 6 39.0609 6 38V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OriginalPlaceholderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M38 6H10C7.79086 6 6 7.79086 6 10V38C6 40.2091 7.79086 42 10 42H38C40.2091 42 42 40.2091 42 38V10C42 7.79086 40.2091 6 38 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 22C20.2091 22 22 20.2091 22 18C22 15.7909 20.2091 14 18 14C15.7909 14 14 15.7909 14 18C14 20.2091 15.7909 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42 29.9994L35.828 23.8274C35.0779 23.0775 34.0607 22.6562 33 22.6562C31.9393 22.6562 30.9221 23.0775 30.172 23.8274L12 41.9994" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomDownloadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19.75 14C20.1642 14 20.5 14.3358 20.5 14.75V18.083C20.5 18.7239 20.2452 19.3388 19.792 19.792C19.3388 20.2452 18.7239 20.5 18.083 20.5H6.41699C5.77605 20.5 5.16122 20.2452 4.70801 19.792C4.31146 19.3954 4.06666 18.8755 4.01172 18.3223L4 18.083V14.75C4 14.3358 4.33579 14 4.75 14C5.16421 14 5.5 14.3358 5.5 14.75V18.083L5.50488 18.1738C5.52571 18.3837 5.61812 18.581 5.76855 18.7314C5.94046 18.9034 6.17388 19 6.41699 19H18.083C18.3261 19 18.5595 18.9034 18.7314 18.7314C18.9034 18.5595 19 18.3261 19 18.083V14.75C19 14.3358 19.3358 14 19.75 14Z" fill="currentColor"/>
    <path d="M12.25 4C12.6642 4 13 4.33579 13 4.75V12.9375L15.8857 10.0527C16.1785 9.76001 16.6534 9.76034 16.9463 10.0527C17.2392 10.3456 17.2392 10.8204 16.9463 11.1133L12.7803 15.2803C12.7105 15.3501 12.6305 15.403 12.5449 15.4395C12.5327 15.4447 12.5193 15.4466 12.5068 15.4512C12.4745 15.4629 12.4425 15.4743 12.4092 15.4814C12.372 15.4895 12.334 15.4948 12.2949 15.4971C12.2887 15.4974 12.2826 15.4978 12.2764 15.498C12.2676 15.4984 12.2588 15.5 12.25 15.5C12.2179 15.5 12.1863 15.4971 12.1553 15.4932C12.1513 15.4927 12.1475 15.4918 12.1436 15.4912C12.1162 15.4873 12.0898 15.4804 12.0635 15.4736C12.0387 15.4673 12.0143 15.4601 11.9902 15.4512C11.966 15.4422 11.9429 15.4313 11.9199 15.4199C11.9024 15.4113 11.8851 15.4026 11.8682 15.3926C11.8451 15.3788 11.8232 15.3637 11.8018 15.3477C11.7938 15.3417 11.7841 15.3374 11.7764 15.3311L11.7197 15.2803L7.55273 11.1133L7.50098 11.0566C7.26098 10.7621 7.27825 10.3272 7.55273 10.0527C7.82723 9.77824 8.26207 9.76098 8.55664 10.001L8.61328 10.0527L11.5 12.9395V4.75C11.5 4.33579 11.8358 4 12.25 4Z" fill="currentColor"/>
  </svg>
);

export default function ImageAnalysisDetailPage() {
  const [detailData] = useState({
    id: '1',
    deviceId: 'DEV-20483A',
    country: '일본',
    countryCode: 'JP',
    analyzedAt: '2026-03-19 14:32:05',
    metrics: {
      imageProcessing: '2.41',
      ocr: '2.41',
      ai: '2.41',
      translation: '2.41',
      total: '2.41'
    },
    analyzedImages: [1, 2, 3, 4, 5],
    originalImages: [1, 2, 3, 4, 5],
  });

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
        {/* Action Buttons at Top Right */}
        <div className="absolute top-8 right-8 flex items-center space-x-3">
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6 rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            전체 JSON 다운로드
          </Button>
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6 rounded-lg">
            <Download className="w-4 h-4 mr-2" />
            전체 IMAGE 다운로드
          </Button>
        </div>

        {/* Info Grid */}
        <div className="space-y-8">
          <div className="flex space-x-12">
            <div className="min-w-[120px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">디바이스 ID</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.deviceId}</div>
            </div>
            <div className="min-w-[80px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">국가</div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[14px]">🇯🇵</span>
                <span className="text-[15px] font-bold text-gray-900">{detailData.country}</span>
              </div>
            </div>
            <div>
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">분석 일시</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.analyzedAt}</div>
            </div>
          </div>

          <div className="flex space-x-12 border-t border-gray-50 pt-6">
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">이미지 처리시간</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.metrics.imageProcessing}</div>
            </div>
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">OCR</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.metrics.ocr}</div>
            </div>
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">AI</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.metrics.ai}</div>
            </div>
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">번역</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.metrics.translation}</div>
            </div>
            <div className="min-w-[60px]">
              <div className="text-[12px] text-gray-400 font-medium mb-1.5 uppercase tracking-tight">총 합</div>
              <div className="text-[15px] font-bold text-gray-900">{detailData.metrics.total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analyzed Images Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ScanIcon className="w-5 h-5 text-[#4186FF]" />
          <h2 className="text-[16px] font-[700] text-gray-900">분석 이미지</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {detailData.analyzedImages.map((item, index) => (
            <div key={`analyzed-${index}`} className="flex flex-col space-y-3" style={{ width: '206px' }}>
              <div 
                className="bg-[#F4F7FF] rounded-lg flex items-center justify-center border border-[#E0E7FF]"
                style={{ width: '206px', height: '145px' }}
              >
                <ScanPlaceholderIcon className="w-10 h-10 text-[#4186FF] opacity-60" />
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full h-8 border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] font-[600] px-2">
                  <Download className="w-3 h-3 mr-1" />
                  이미지
                </Button>
                <Button variant="outline" className="w-full h-8 border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] font-[600] px-2">
                  <Download className="w-3 h-3 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Original Images Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-[16px] font-[700] text-gray-900">원본 이미지</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {detailData.originalImages.map((item, index) => (
            <div key={`original-${index}`} className="flex flex-col space-y-3" style={{ width: '206px' }}>
              <div 
                className="bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100"
                style={{ width: '206px', height: '145px' }}
              >
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <Button variant="outline" className="w-full h-8 border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] font-[600] px-2">
                <Download className="w-3 h-3 mr-1" />
                이미지
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
