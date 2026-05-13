'use client';

// 배너 목록.
// 서버 페이지네이션 / position(TOP/HOME/BOTTOM) 탭 / keyword + startDate/endDate 필터
// 활성 토글: PATCH /banners/{id}, 삭제: DELETE /banners/{id}, 순서 변경: PATCH /banners/reorder
//
// 주의: 검색 keyword 입력은 디바운스 없이 페이지 1로 검색 버튼 없이 즉시 호출 — 추후 필요 시 디바운스 추가.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  GripVertical,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AdminTableHead,
  AdminTableHeaderRow,
} from '@/components/ui/admin-table';
import { bannerApi } from '@/lib/banner-api';
import {
  BANNER_POSITION_LABELS,
  BANNER_POSITIONS,
  BannerPosition,
  BannerResponse,
} from '@/types/banner';
import { ApiError } from '@/types/api';

// 'ENDED' = 종료된 배너 탭 (백엔드 필터 명세 대기, 현재 placeholder)
type BannerTab = BannerPosition | 'ENDED';
const TABS: { id: BannerTab; label: string }[] = [
  ...BANNER_POSITIONS.map((p) => ({ id: p, label: BANNER_POSITION_LABELS[p] })),
  { id: 'ENDED', label: '종료된 배너' },
];

function formatDateRange(startAt?: string, endAt?: string) {
  const fmt = (v?: string) => (v ? v.slice(0, 10) : '');
  if (!startAt && !endAt) return '-';
  return `${fmt(startAt)} ~ ${fmt(endAt)}`;
}

type RowProps = {
  banner: BannerResponse;
  onToggle: (b: BannerResponse) => void;
  onDelete: (b: BannerResponse) => void;
  onEdit: (b: BannerResponse) => void;
};

function SortableTableRow({ banner, onToggle, onDelete, onEdit }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: banner.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b last:border-0 bg-white hover:bg-gray-50 group"
    >
      <td className="p-4 w-[80px] text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="p-4">
        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden relative">
          {banner.imageUrl ? (
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
          ) : null}
        </div>
      </td>
      <td className="p-4">
        <div className="font-semibold text-gray-900">{banner.title}</div>
        {banner.subtitle && (
          <div className="text-sm text-gray-500 mt-1">{banner.subtitle}</div>
        )}
      </td>
      <td className="p-4 text-gray-600 text-sm">
        {formatDateRange(banner.startAt, banner.endAt)}
      </td>
      <td className="p-4">
        <div className="flex items-center">
          <Switch
            checked={banner.active}
            onCheckedChange={() => onToggle(banner)}
          />
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(banner)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(banner)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function BannerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<BannerTab>('TOP');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isEnded = activeTab === 'ENDED';
  // 페이지네이션 제거 — 전체 로드해서 순서 변경 등에 사용
  const FETCH_SIZE = 500;

  const queryKey = useMemo(
    () => ['banners', { activeTab, keyword, startDate, endDate }],
    [activeTab, keyword, startDate, endDate],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      bannerApi.list(
        isEnded
          ? {
              // 종료된 배너: 백엔드가 active=false + endAt<now 필터 + endAt DESC 정렬 처리
              page: 0,
              size: FETCH_SIZE,
              expiredOnly: true,
              keyword: keyword || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            }
          : {
              position: activeTab as BannerPosition,
              page: 0,
              size: FETCH_SIZE,
              keyword: keyword || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            },
      ),
  });

  // 드래그 정렬을 즉시 반영하기 위한 로컬 오버라이드
  const [localOrder, setLocalOrder] = useState<BannerResponse[] | null>(null);
  useEffect(() => {
    setLocalOrder(null);
  }, [queryKey.join('|')]);

  const banners = localOrder ?? data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const toggleMutation = useMutation({
    mutationFn: (b: BannerResponse) =>
      bannerApi.update(b.id, {
        title: b.title,
        imageUrl: b.imageUrl,
        subtitle: b.subtitle,
        imagePath: b.imagePath,
        linkUrl: b.linkUrl,
        position: b.position,
        displayOrder: b.displayOrder,
        startAt: b.startAt,
        endAt: b.endAt,
        active: !b.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '상태 변경에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다.');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      bannerApi.reorder(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '순서 변경에 실패했습니다.');
      setLocalOrder(null);
    },
  });

  const handleTabChange = (next: BannerTab) => {
    setActiveTab(next);
    setKeyword('');
    setStartDate('');
    setEndDate('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    // 종료된 배너 탭에서는 순서 변경 비활성화 — 백엔드가 endAt DESC 고정 정렬
    if (isEnded) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = banners;
    const oldIndex = current.findIndex((b) => b.id === active.id);
    const newIndex = current.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(current, oldIndex, newIndex);
    setLocalOrder(reordered);

    const payload = reordered.map((b, idx) => ({ id: b.id, displayOrder: idx }));
    reorderMutation.mutate(payload);
  };

  const handleDelete = (b: BannerResponse) => {
    if (!confirm(`"${b.title}" 배너를 삭제하시겠습니까?`)) return;
    deleteMutation.mutate(b.id);
  };

  return (
    <div className="w-full flex flex-col gap-[24px]">
      <PageTitle>
        홈 배너 관리 - {TABS.find((t) => t.id === activeTab)?.label}
      </PageTitle>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-6 py-3 text-[14px] font-[600] transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#4186FF]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4186FF]" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <div className="flex items-center w-[380px] h-[40px] px-[14px] py-[10px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
            <Search className="w-5 h-5 text-[#71717A] shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A] text-[#18181B]"
              placeholder="배너 문구 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-[8px]">
            <div className="flex items-center w-[160px] h-[40px] px-[12px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
              <Calendar className="w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="시작 날짜"
                className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onFocus={(e) => {
                  e.target.type = 'date';
                  try {
                    e.target.showPicker();
                  } catch {
                    /* noop */
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                max={endDate || undefined}
              />
            </div>
            <span className="text-gray-400">~</span>
            <div className="flex items-center w-[160px] h-[40px] px-[12px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
              <Calendar className="w-4 h-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="종료 날짜"
                className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onFocus={(e) => {
                  e.target.type = 'date';
                  try {
                    e.target.showPicker();
                  } catch {
                    /* noop */
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                min={startDate || undefined}
              />
            </div>
          </div>
        </div>

        <Link
          href={`/banner/create?position=${isEnded ? 'TOP' : activeTab}`}
        >
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[40px]">
            <Plus className="w-4 h-4 mr-2" />
            배너 추가
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <AdminTableHeaderRow>
                    <AdminTableHead className="px-6 py-4 text-center w-[80px] whitespace-nowrap">
                      순서
                    </AdminTableHead>
                    <AdminTableHead className="px-6 py-4">이미지</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">배너 문구</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">게시 기간</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">활성화</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">관리</AdminTableHead>
                  </AdminTableHeaderRow>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                        불러오는 중...
                      </td>
                    </tr>
                  )}
                  {isError && !isLoading && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-red-500 text-sm">
                        {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && banners.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                        {isEnded
                          ? '종료된 배너가 없습니다.'
                          : '등록된 배너가 없습니다.'}
                      </td>
                    </tr>
                  )}
                  <SortableContext
                    items={banners.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {banners.map((banner) => (
                      <SortableTableRow
                        key={banner.id}
                        banner={banner}
                        onToggle={(b) => toggleMutation.mutate(b)}
                        onDelete={handleDelete}
                        onEdit={(b) => router.push(`/banner/${b.id}`)}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </div>
          </DndContext>

          {/* Pagination */}
          {/* 페이지네이션 — 순서 변경 기능 적용 후 다시 살릴 예정. */}
          {/* {totalPages > 0 && (
            <div className="flex justify-end p-4 items-center space-x-1 bg-white border-t border-gray-100">
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
                  className={`w-8 h-8 p-0 ${
                    p === page
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
          )} */}
        </div>
      </div>
    </div>
  );
}
