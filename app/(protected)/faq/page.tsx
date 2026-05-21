'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { faqApi } from '@/lib/faq-api';
import { FaqResponse } from '@/types/faq';
import { ApiError } from '@/types/api';

export default function FAQPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const size = parseInt(pageSize, 10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['faqs', { page, size }],
    queryFn: () => faqApi.list({ page, size }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
    onError: (e) => {
      toast.error(
        e instanceof ApiError ? e.message : '삭제에 실패했습니다. 다시 시도해주세요.',
      );
    },
  });

  const faqs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const [deleteTarget, setDeleteTarget] = useState<FaqResponse | null>(null);

  return (
    <div className="w-full flex flex-col gap-[24px]">
      <div className="flex justify-between items-center">
        <PageTitle>FAQ 관리</PageTitle>
        <Link href="/faq/create">
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[40px]">
            <Plus className="w-4 h-4 mr-2" />
            FAQ 추가
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-[12px]">
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[13px] text-gray-500">페이지당</span>
          <Select
            value={pageSize}
            onValueChange={(v) => {
              setPageSize(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[80px] h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full">
        {isLoading && (
          <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-8 text-center text-sm text-gray-500">
            불러오는 중...
          </div>
        )}
        {isError && !isLoading && (
          <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-8 text-center text-sm text-red-500">
            {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
          </div>
        )}
        {!isLoading && !isError && faqs.length === 0 && (
          <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-8 text-center text-sm text-gray-500">
            등록된 FAQ가 없습니다.
          </div>
        )}

        {!isLoading && !isError && faqs.length > 0 && (
          <Accordion
            type="single"
            collapsible
            // @ts-ignore - 'none' is a valid variant in trigger but not in Accordion props type
            indicator="none"
            className="w-full space-y-4"
          >
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="group bg-white border border-[#E4E4E7] rounded-[12px] overflow-hidden shadow-sm transition-all px-0"
              >
                <div className="relative">
                  <AccordionTrigger className="flex items-center justify-between px-6 py-5 hover:no-underline text-left text-[16px] font-[700] text-[#18181B] border-none w-full">
                    <div className="flex items-center gap-3 flex-1 pr-24 min-w-0">
                      {!faq.active && (
                        <span className="shrink-0 inline-flex items-center text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                          비활성
                        </span>
                      )}
                      <span className="truncate">{faq.question}</span>
                    </div>
                    <div className="p-2 text-[#A1A1AA] group-data-[state=open]:rotate-180 transition-transform duration-200">
                      <ChevronDown className="size-5" />
                    </div>
                  </AccordionTrigger>

                  <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/faq/${faq.id}`);
                      }}
                      className="block"
                    >
                      <EditButton />
                    </button>
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(faq);
                      }}
                    />
                  </div>
                </div>

                <AccordionContent className="px-6 pb-6 text-[14px] leading-relaxed text-[#71717A] border-t border-[#E4E4E7]">
                  <div
                    className="pt-5 faq-answer"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {totalPages > 0 && (
        <div className="flex justify-end items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'primary' : 'outline'}
              size="icon"
              className={`w-8 h-8 p-0 ${p === page
                  ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="FAQ를 삭제하시겠어요?"
        description="삭제 후에는 복구할 수 없습니다."
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={async () => {
          if (!deleteTarget) return;
          // 실패 시 ConfirmModal이 모달을 유지하도록 throw — onClose는 ConfirmModal에서 성공 시에만 호출
          await deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />

      <style jsx global>{`
        .faq-answer h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
        .faq-answer h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
        .faq-answer h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
        .faq-answer p { margin-bottom: 1em; }
        .faq-answer blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #666; margin: 1em 0; }
        .faq-answer img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
}
