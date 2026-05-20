'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Download, ImageIcon } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { suggestionApi, suggestionCategoryApi } from '@/lib/suggestion-api';
import { SuggestionStatus } from '@/types/suggestion';
import { ApiError } from '@/types/api';

const ScanPlaceholderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M6 14V10C6 8.93913 6.42143 7.92172 7.17157 7.17157C7.92172 6.42143 8.93913 6 10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M34 6H38C39.0609 6 40.0783 6.42143 40.8284 7.17157C41.5786 7.92172 42 8.93913 42 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M42 34V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0783 6 39.0609 6 38V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M2 4.66667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H4.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.3334 2H12.6667C13.0203 2 13.3595 2.14048 13.6095 2.39052C13.8596 2.64057 14 2.97971 14 3.33333V4.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11.332V12.6654C14 13.019 13.8596 13.3581 13.6095 13.6082C13.3595 13.8582 13.0203 13.9987 12.6667 13.9987H11.3334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.66667 13.9987H3.33333C2.97971 13.9987 2.64057 13.8582 2.39052 13.6082C2.14048 13.3581 2 13.019 2 12.6654V11.332" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DETAIL_STATUS_OPTIONS: { value: 'PENDING' | 'REVIEWED'; label: string }[] = [
  { value: 'PENDING', label: '미확인' },
  { value: 'REVIEWED', label: '확인 완료' },
];

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  return iso.replace('T', ' ').slice(0, 16);
}

export default function SuggestionDetailPage() {
  const { id } = useParams();
  const suggestionId = id as string;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['suggestion', suggestionId],
    queryFn: () => suggestionApi.detail(suggestionId),
    enabled: !!suggestionId,
  });

  const { data: catData } = useQuery({
    queryKey: ['suggestion-categories-all'],
    queryFn: () =>
      suggestionCategoryApi.list({ page: 0, size: 500, activeOnly: false }),
  });
  const categories = catData?.content ?? [];

  const [newComment, setNewComment] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const reviewMutation = useMutation({
    mutationFn: (status: SuggestionStatus) =>
      suggestionApi.review(suggestionId, {
        status,
        adminNote: adminNote.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('처리되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['suggestion', suggestionId] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : '처리에 실패했습니다.'),
  });

  const handleStatusChange = (next: 'PENDING' | 'REVIEWED') => {
    reviewMutation.mutate(next);
  };

  const handleDownloadDetailJson = () => {
    if (!data) return;
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suggestion-${suggestionId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDownloadAllImages = () => {
    // 백엔드 ZIP 압축 엔드포인트 연동 후 활성화 — after.md 참고
    toast.message('전체 IMAGE 다운로드는 준비 중입니다.');
  };

  const handleDownloadSingleImage = (url: string, fileName: string) => {
    // 단순 anchor download — CORS 정책에 따라 새 탭으로 열릴 수 있음
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDownloadAnalysisImage = async () => {
    try {
      const blob = await suggestionApi.downloadAnalysisImage(suggestionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suggestion-${suggestionId}-analysis.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDownloadAnalysisJson = async () => {
    try {
      const blob = await suggestionApi.downloadAnalysisJson(suggestionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suggestion-${suggestionId}-analysis.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      suggestionApi.addComment(suggestionId, { content }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['suggestion', suggestionId] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : '댓글 작성 실패'),
  });

  const toggleConfirmMutation = useMutation({
    mutationFn: (commentId: string) =>
      suggestionApi.toggleCommentConfirm(suggestionId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestion', suggestionId] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : '상태 변경 실패'),
  });

  if (isLoading) {
    return (
      <div className="w-full p-12 text-center text-sm text-gray-500">불러오는 중...</div>
    );
  }
  if (isError || !data) {
    return (
      <div className="w-full p-12 text-center text-sm text-red-500">
        {error instanceof ApiError ? error.message : '제안을 불러오지 못했습니다.'}
      </div>
    );
  }

  const cat = data.categoryCode
    ? categories.find((c) => c.code === data.categoryCode)
    : categories.find((c) => c.id === data.categoryId);
  const statusKey = (data.status as SuggestionStatus) || 'PENDING';
  const imageUrls = data.imageUrls ?? [];

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/suggestions">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </Button>
          </Link>
          <PageTitle>유저 제안 상세</PageTitle>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusKey === 'REVIEWED' ? 'REVIEWED' : 'PENDING'}
            onValueChange={(v) => handleStatusChange(v as 'PENDING' | 'REVIEWED')}
            disabled={reviewMutation.isPending}
          >
            <SelectTrigger className="w-[140px] h-10 text-sm border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DETAIL_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleDownloadDetailJson}
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[13px] font-[600] h-10 px-4"
          >
            <Download className="w-4 h-4 mr-2" />
            전체 JSON 다운로드
          </Button>
          <Button
            onClick={handleDownloadAllImages}
            disabled={imageUrls.length === 0}
            style={
              imageUrls.length === 0
                ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
                : undefined
            }
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[13px] font-[600] h-10 px-4 disabled:hover:bg-[#E4E4E7]"
          >
            <Download className="w-4 h-4 mr-2" />
            전체 IMAGE 다운로드
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col space-y-8 relative">
        <div className="flex flex-col space-y-6 max-w-[60%]">
          <div className="flex space-x-12">
            <div>
              <div className="text-[12px] text-gray-400 font-medium mb-1.5">디바이스 ID</div>
              <div className="text-[15px] font-bold text-gray-900">
                {data.deviceId || '-'}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-gray-400 font-medium mb-1.5">제안 일시</div>
              <div className="text-[15px] font-bold text-gray-900">
                {formatDateTime(data.insDttm)}
              </div>
            </div>
            {data.contactEmail && (
              <div>
                <div className="text-[12px] text-gray-400 font-medium mb-1.5">연락처</div>
                <div className="text-[15px] font-bold text-gray-900">
                  {data.contactEmail}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-[12px] text-gray-400 font-medium mb-1.5">카테고리</div>
            <Badge className="bg-[#EEF1FF] text-[#4186FF] text-[11px] font-[600] border-none shadow-none px-3 py-1">
              {data.categoryName || cat?.shortName || cat?.fullName || '-'}
            </Badge>
          </div>

          <div>
            <div className="text-[12px] text-gray-400 font-medium mb-1.5">상세 내용</div>
            <div className="text-[14px] text-gray-900 leading-relaxed whitespace-pre-wrap">
              {data.content}
            </div>
          </div>

          {data.adminNote && (
            <div>
              <div className="text-[12px] text-gray-400 font-medium mb-1.5">처리 메모</div>
              <div className="text-[14px] text-gray-700 leading-relaxed bg-[#F8F9FB] rounded-lg p-3">
                {data.adminNote}
              </div>
            </div>
          )}
        </div>

        <div>
            <div className="text-[12px] text-gray-400 font-medium mb-1.5">
              처리 메모 (선택)
            </div>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="처리 메모를 입력하시면 위의 처리 버튼과 함께 저장됩니다."
              className="w-full bg-[#F8F9FB] rounded-lg p-4 text-[13px] text-gray-600 min-h-[60px] outline-none focus:ring-1 focus:ring-blue-100 placeholder:text-gray-400 resize-none"
            />
          </div>

        <div className="space-y-4">
          <div className="text-[12px] text-gray-400 font-medium">담당자 의견</div>
          <div className="space-y-3">
            {(data.comments ?? []).length === 0 && (
              <div className="text-[13px] text-gray-400">아직 작성된 의견이 없습니다.</div>
            )}
            {(data.comments ?? []).map((comment) => (
              <div key={comment.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-gray-600">
                    {comment.authorName || '-'}
                  </span>
                  <span className="text-[12px] text-gray-400">
                    {formatDateTime(comment.insDttm)}
                  </span>
                  <Badge
                    onClick={() => toggleConfirmMutation.mutate(comment.id)}
                    className={`cursor-pointer text-[10px] font-[600] border-none shadow-none px-2 py-0.5 ${
                      comment.confirmed
                        ? 'bg-[#EEF1FF] text-[#4186FF] hover:bg-[#E0EFFF]'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {comment.confirmed ? '확인완료' : '미확인'}
                  </Badge>
                </div>
                <div className="bg-[#F8F9FB] rounded-lg p-3 text-[13px] text-gray-600 whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <textarea
              className="w-full bg-[#F8F9FB] rounded-lg p-4 text-[13px] text-gray-600 min-h-[50px] outline-none focus:ring-1 focus:ring-blue-100 placeholder:text-gray-400 resize-none"
              placeholder="내용을 입력해주세요"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const c = newComment.trim();
                  if (!c) return;
                  addCommentMutation.mutate(c);
                }}
                disabled={addCommentMutation.isPending || !newComment.trim()}
                className="bg-[#4186FF] hover:bg-blue-600 text-white text-[13px] font-[600] h-9 px-6 rounded-md shadow-sm"
              >
                {addCommentMutation.isPending ? '작성 중...' : '작성'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ScanIcon className="w-5 h-5 text-[#4186FF]" />
          <h2 className="text-[16px] font-[700] text-gray-900">분석 이미지</h2>
        </div>
        <div className="flex flex-col w-[180px] space-y-3">
          <AspectRatio ratio={206 / 145}>
            {data.analysisImageUrl ? (
              <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-100 w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.analysisImageUrl} alt="분석 이미지" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="bg-[#F4F7FF] rounded-lg flex items-center justify-center border border-[#E0E7FF] w-full h-full">
                <ScanPlaceholderIcon className="w-10 h-10 text-[#4186FF] opacity-60" />
              </div>
            )}
          </AspectRatio>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={handleDownloadAnalysisImage}
              disabled={!data.analysisImageUrl}
              style={!data.analysisImageUrl ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' } : undefined}
              className="w-full h-8 border-gray-100 text-[11px] font-[600] px-2 disabled:hover:bg-[#E4E4E7]"
            >
              <Download className="w-3 h-3 mr-1" />
              이미지
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadAnalysisJson}
              className="w-full h-8 border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] font-[600] px-2"
            >
              <Download className="w-3 h-3 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-[16px] font-[700] text-gray-900">원본 이미지</h2>
        </div>
        {imageUrls.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`original-empty-${index}`} className="flex flex-col space-y-3">
                <AspectRatio ratio={206 / 145}>
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100 w-full h-full">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                </AspectRatio>
                <Button
                  variant="outline"
                  disabled
                  style={{ backgroundColor: '#E4E4E7', color: '#A1A1AA' }}
                  className="w-full h-8 border-gray-100 text-[11px] font-[600] px-2 disabled:hover:bg-[#E4E4E7]"
                >
                  <Download className="w-3 h-3 mr-1" />
                  이미지
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {imageUrls.map((url, index) => (
              <div key={`original-${url}-${index}`} className="flex flex-col space-y-3">
                <AspectRatio ratio={206 / 145}>
                  <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-100 w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`원본 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </AspectRatio>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownloadSingleImage(url, `suggestion-${suggestionId}-${index + 1}`)
                  }
                  className="w-full h-8 border-gray-100 hover:bg-gray-50 text-gray-500 text-[11px] font-[600] px-2"
                >
                  <Download className="w-3 h-3 mr-1" />
                  이미지
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
