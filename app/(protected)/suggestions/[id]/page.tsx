'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Download, Expand, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function SuggestionDetailPage() {
  const [detailData, setDetailData] = useState({
    id: '1',
    deviceId: 'DEV-20483A',
    category: '잘못된 번역이 나옵니다.',
    content: '메뉴판 번역 결과가 일부 잘못되었습니다',
    suggestionDate: '2026-03-19 14:32',
    isConfirmed: false,
    analyzedImages: [1, 2, 3, 4, 5],
    originalImages: [1, 2, 3, 4, 5],
  });

  const toggleStatus = () => {
    setDetailData((prev) => ({ ...prev, isConfirmed: !prev.isConfirmed }));
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link href="/suggestions">
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Button>
        </Link>
        <PageTitle>유저 제안 상세</PageTitle>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div>
              <div className="text-[12px] text-gray-500 mb-1">디바이스 ID</div>
              <div className="font-semibold text-gray-900">{detailData.deviceId}</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div>
              <div className="text-[12px] text-gray-500 mb-1">카테고리</div>
              <Badge variant="secondary" className="bg-[#eef1ff] text-[#1c2340] hover:bg-[#eef1ff] font-normal px-2.5 py-0.5">
                {detailData.category}
              </Badge>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div>
              <div className="text-[12px] text-gray-500 mb-1">제안 일시</div>
              <div className="font-semibold text-gray-900">{detailData.suggestionDate}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 font-medium">확인 여부</span>
              <Switch checked={detailData.isConfirmed} onCheckedChange={toggleStatus} />
            </div>
            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[38px] px-4">
              <Download className="w-4 h-4 mr-2" />
              JSON 다운로드
            </Button>
          </div>
        </div>
        
        <div>
          <div className="text-[12px] text-gray-500 mb-1">상세 내용</div>
          <div className="text-sm text-gray-900">{detailData.content}</div>
        </div>
      </div>

      {/* Analyzed Images Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Expand className="w-5 h-5 text-[#4186FF]" />
          <h2 className="text-[16px] font-[700] text-gray-900">분석 이미지</h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {detailData.analyzedImages.map((item, index) => (
            <div key={`analyzed-${index}`} className="flex flex-col space-y-3">
              <div className="aspect-[4/3] bg-[#EEF2FF] rounded-lg flex items-center justify-center border border-[#E0E7FF]">
                <Expand className="w-8 h-8 text-[#4186FF] opacity-50" />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 h-9 px-0 text-gray-600 border-gray-200 hover:bg-gray-50 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  이미지
                </Button>
                <Button variant="outline" className="flex-1 h-9 px-0 text-gray-600 border-gray-200 hover:bg-gray-50 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
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
        <div className="grid grid-cols-5 gap-4">
          {detailData.originalImages.map((item, index) => (
            <div key={`original-${index}`} className="flex flex-col space-y-3">
              <div className="aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <Button variant="outline" className="w-full h-9 text-gray-600 border-gray-200 hover:bg-gray-50 text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                이미지
              </Button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
