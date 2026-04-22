'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search, Plus, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  tag: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const SortableTableRow = ({ banner, onToggle, onDelete, onEdit }: { banner: Banner, onToggle: (id: string) => void, onDelete: (id: string) => void, onEdit: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b bg-white hover:bg-gray-50 group">
      <td className="p-4 w-10 text-center">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 focus:outline-none">
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="p-4">
        <div className="w-24 h-16 bg-gray-200 rounded-md overflow-hidden relative">
          <Image src={banner.image} alt={banner.title} fill className="object-cover" />
        </div>
      </td>
      <td className="p-4">
        <div className="font-semibold text-gray-900">{banner.title}</div>
        <div className="text-sm text-gray-500 mt-1">{banner.description}</div>
      </td>
      <td className="p-4">
        <Badge 
          variant="secondary" 
          className={
            banner.tag === '프로모션'
              ? 'bg-[#eef1ff] text-[#1C2340] text-[11px] font-[600] leading-normal hover:bg-[#eef1ff]'
              : 'bg-gray-100 text-gray-700 text-[11px] font-[600] leading-normal hover:bg-gray-100'
          }
        >
          {banner.tag}
        </Badge>
      </td>
      <td className="p-4 text-gray-600 text-sm">
        {banner.startDate} ~ {banner.endDate}
      </td>
      <td className="p-4">
        <Switch checked={banner.isActive} onCheckedChange={() => onToggle(banner.id)} />
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <EditButton onClick={() => onEdit(banner.id)} />
          <DeleteButton onClick={() => onDelete(banner.id)} />
        </div>
      </td>
    </tr>
  );
};

export default function BannerPage() {
  const [topPage, setTopPage] = useState(1);
  const [bottomPage, setBottomPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const [topBanners, setTopBanners] = useState<Banner[]>([
    {
      id: 'top-1',
      image: 'https://via.placeholder.com/150',
      title: '봄 시즌 특별 이벤트',
      description: '지금 바로 메뉴 번역 시작!',
      tag: '프로모션',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      isActive: true,
    },
    {
      id: 'top-2',
      image: 'https://via.placeholder.com/150',
      title: '여름 해외 맛집 가이드',
      description: '해외 식당 완벽 공략법',
      tag: '가이드',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      isActive: false,
    },
    {
      id: 'top-3',
      image: 'https://via.placeholder.com/150',
      title: '신규 가입 이벤트 배너',
      description: '첫 번역 무료 제공',
      tag: '프로모션',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isActive: true,
    },
  ]);

  const [bottomBanners, setBottomBanners] = useState<Banner[]>([
    {
      id: 'bottom-1',
      image: 'https://via.placeholder.com/150',
      title: '봄 시즌 특별 이벤트',
      description: '지금 바로 메뉴 번역 시작!',
      tag: '프로모션',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      isActive: true,
    },
    {
      id: 'bottom-2',
      image: 'https://via.placeholder.com/150',
      title: '여름 해외 맛집 가이드',
      description: '해외 식당 완벽 공략법',
      tag: '가이드',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      isActive: false,
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndTop = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTopBanners((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndBottom = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBottomBanners((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleStatus = (id: string, isTop: boolean) => {
    if (isTop) {
      setTopBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
    } else {
      setBottomBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
    }
  };

  const deleteBanner = (id: string, isTop: boolean) => {
    if (confirm('이 배너를 삭제하시겠습니까?')) {
      if (isTop) {
        setTopBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        setBottomBanners((prev) => prev.filter((b) => b.id !== id));
      }
    }
  };

  const renderTable = (banners: Banner[], handleDragEnd: (e: DragEndEvent) => void, isTop: boolean, page: number, setPage: React.Dispatch<React.SetStateAction<number>>) => {
    const totalPages = Math.max(1, Math.ceil(banners.length / ITEMS_PER_PAGE));
    const paginatedBanners = banners.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4 flex flex-col">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow>
                  <AdminTableHead className="text-center w-10">순서</AdminTableHead>
                  <AdminTableHead>이미지</AdminTableHead>
                  <AdminTableHead>배너 문구</AdminTableHead>
                  <AdminTableHead>태그</AdminTableHead>
                  <AdminTableHead>게시 기간</AdminTableHead>
                  <AdminTableHead>활성화</AdminTableHead>
                  <AdminTableHead>관리</AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody>
                <SortableContext items={paginatedBanners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {paginatedBanners.map((banner) => (
                    <SortableTableRow
                      key={banner.id}
                      banner={banner}
                      onToggle={(id) => toggleStatus(id, isTop)}
                      onDelete={(id) => deleteBanner(id, isTop)}
                      onEdit={() => alert('배너 수정 모달이 열립니다.')}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </DndContext>
        <div className="flex justify-end p-4 items-center space-x-2 bg-[#F9FAFB] border-t border-[#E4E4E7]">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-500 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white text-[14px] font-[600] leading-normal hover:bg-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0 border-gray-200 text-gray-500 hover:bg-gray-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col space-y-4">
        <PageTitle>홈 배너 관리</PageTitle>
        <div className="flex items-center w-[280px] h-[40px] px-[14px] py-[10px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
          <Search className="w-5 h-5 text-[#71717A] shrink-0" />
          <input 
            type="text" 
            className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A] text-[#18181B]" 
            placeholder="배너 문구 검색..." 
          />
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[16px] font-[700] text-[#18181B]">상단 배너</h2>
          <Link href="/banner/create">
            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal">
              <Plus className="w-4 h-4 mr-2" />
              배너 추가
            </Button>
          </Link>
        </div>
        {renderTable(topBanners, handleDragEndTop, true, topPage, setTopPage)}
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[16px] font-[700] text-[#18181B]">하단 배너</h2>
          <Link href="/banner/create">
            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal">
              <Plus className="w-4 h-4 mr-2" />
              배너 추가
            </Button>
          </Link>
        </div>
        {renderTable(bottomBanners, handleDragEndBottom, false, bottomPage, setBottomPage)}
      </section>
    </div>
  );
}
