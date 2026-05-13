'use client';

// 유저 제안 상세 — api.json
// - GET /api/admin/suggestions/{id}
// - PATCH .../review → 처리 상태 변경 (REVIEWED/CLOSED) + adminNote
// - POST .../comments → 담당자 의견 추가
// - PATCH .../comments/{commentId}/confirm → 댓글 확인 토글

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { suggestionApi, suggestionCategoryApi } from '@/lib/suggestion-api';
import {
  SUGGESTION_STATUS_LABELS,
  SuggestionStatus,
} from '@/types/suggestion';
import { ApiError } from '@/types/api';

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

  // 카테고리명 매핑용
  const { data: catData } = useQuery({
    queryKey: ['suggestion-categories-all'],
    queryFn: () =>
      suggestionCategoryApi.list({ page: 0, size: 500, activeOnly: false }),
  });
  const categories = catData?.content ?? [];

  const [newComment, setNewComment] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const reviewMutation = useMutation({
    mutationFn: (status: 'REVIEWED' | 'CLOSED') =>
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
  const isClosed = statusKey === 'CLOSED' || statusKey === 'REVIEWED';

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
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

        {/* 처리 상태 액션 */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`font-semibold text-[12px] ${
              statusKey === 'PENDING'
                ? 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FEF3C7]'
                : statusKey === 'REVIEWED'
                  ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {SUGGESTION_STATUS_LABELS[statusKey] || data.status}
          </Badge>
          {statusKey === 'PENDING' && (
            <>
              <Button
                onClick={() => reviewMutation.mutate('REVIEWED')}
                disabled={reviewMutation.isPending}
                className="bg-[#4186FF] hover:bg-blue-600 text-white text-[13px] font-[600] h-9 px-4"
              >
                처리 완료
              </Button>
              <Button
                onClick={() => reviewMutation.mutate('CLOSED')}
                disabled={reviewMutation.isPending}
                variant="outline"
                className="text-[13px] font-[600] h-9 px-4 border-gray-200"
              >
                종료
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Info Card */}
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

        {/* 처리 메모 입력 (PENDING일 때만) */}
        {!isClosed && (
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
        )}

        {/* Comments Section */}
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

      {/* Attached Images Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-[16px] font-[700] text-gray-900">첨부 이미지</h2>
        </div>
        {imageUrls.length === 0 ? (
          <div className="text-[13px] text-gray-400">첨부된 이미지가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {imageUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="flex flex-col space-y-3">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`첨부 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
