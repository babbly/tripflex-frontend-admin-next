'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, FileImage, Link as LinkIcon, Info, Calendar, UploadCloud, X } from 'lucide-react';
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
  const [previewImage, setPreviewImage] = useState<string | null>(isMiddleBanner ? null : 'https://picsum.photos/seed/banner-edit/1080/360');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB를 초과하는 파일은 업로드할 수 없습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const FileSelectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
      <path d="M10.6665 3.33203H14.6665" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.6665 1.33203V5.33203" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 7.66667V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H8.33333" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 9.9985L11.9427 7.94116C11.6926 7.6912 11.3536 7.55078 11 7.55078C10.6464 7.55078 10.3074 7.6912 10.0573 7.94116L4 13.9985" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.99984 7.33464C6.73622 7.33464 7.33317 6.73768 7.33317 6.0013C7.33317 5.26492 6.73622 4.66797 5.99984 4.66797C5.26346 4.66797 4.6665 5.26492 4.6665 6.0013C4.6665 6.73768 5.26346 7.33464 5.99984 7.33464Z" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

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
                        onFocus={(e) => { e.target.type = 'date'; try { e.target.showPicker(); } catch (err) {} }}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        className="h-11 border-[#E4E4E7] pr-10" 
                        max={endDate || undefined}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-400">~</span>
                    <div className="relative flex-1">
                      <Input 
                        type="text" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onFocus={(e) => { e.target.type = 'date'; try { e.target.showPicker(); } catch (err) {} }}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        className="h-11 border-[#E4E4E7] pr-10" 
                        min={startDate || undefined}
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
            
            <div 
              className={`relative border border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer overflow-hidden ${
                isDragging ? 'border-[#4186FF] bg-blue-50/50' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'
              } ${previewImage ? (isMiddleBanner ? 'aspect-[4/3]' : 'aspect-[3/1]') : 'aspect-[3/1]'}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => {
                if (previewImage) {
                  setIsPreviewModalOpen(true);
                } else {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileChange(file);
                  };
                  input.click();
                }
              }}
            >
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-[#eef1ff] text-[#4186FF] rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-[14px] font-bold text-[#18181B] mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                  <p className="text-[12px] text-gray-500">PNG, JPG, GIF (최대 5MB)</p>
                </>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 flex items-center justify-center border-gray-200 text-[#18181B] font-[600] hover:bg-gray-50"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileChange(file);
                };
                input.click();
              }}
            >
              <FileSelectIcon />
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

      {/* Preview Modal */}
      {isPreviewModalOpen && previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200" 
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full bg-white rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-[16px] font-bold text-[#18181B]">이미지 미리보기</h3>
              <button 
                className="p-2 hover:bg-gray-200 rounded-full transition-colors" 
                onClick={() => setIsPreviewModalOpen(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-[#F8FAFC]">
              <div className={`relative w-full ${isMiddleBanner ? 'aspect-[4/3]' : 'aspect-[3/1]'} bg-white rounded shadow-sm overflow-hidden border border-gray-200`}>
                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end bg-gray-50">
              <Button 
                className="bg-[#4186FF] hover:bg-blue-600 text-white"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
