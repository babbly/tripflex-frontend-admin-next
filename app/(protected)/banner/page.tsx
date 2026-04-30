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
import { Search, Plus, GripVertical, ChevronLeft, ChevronRight, Calendar, Trash2, Edit2 } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <tr ref={setNodeRef} style={style} className="border-b last:border-0 bg-white hover:bg-gray-50 group">
      <td className="p-4 w-[80px] text-center">
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
        <div className="flex items-center">
          <Switch checked={banner.isActive} onCheckedChange={() => onToggle(banner.id)} />
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => onEdit(banner.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(banner.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const generateDummyData = (type: string, count: number): Banner[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    image: `https://picsum.photos/seed/${type}${i}/200/120`,
    title: `${type === 'top' ? '상단' : type === 'middle' ? '중단' : '하단'} 배너 타이틀 ${i + 1}`,
    description: `배너 상세 설명 문구입니다. #${i + 1}`,
    tag: i % 2 === 0 ? '프로모션' : '가이드',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: i % 3 !== 1,
  }));
};

export default function BannerPage() {
  const [activeTab, setActiveTab] = useState<'top' | 'middle' | 'bottom'>('top');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const ITEMS_PER_PAGE = parseInt(pageSize);

  const [banners, setBanners] = useState({
    top: generateDummyData('top', 25),
    middle: generateDummyData('middle', 15),
    bottom: generateDummyData('bottom', 12),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBanners((prev) => {
        const currentBanners = prev[activeTab];
        const oldIndex = currentBanners.findIndex((item) => item.id === active.id);
        const newIndex = currentBanners.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          [activeTab]: arrayMove(currentBanners, oldIndex, newIndex),
        };
      });
    }
  };

  const toggleStatus = (id: string) => {
    setBanners((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)),
    }));
  };

  const deleteBanner = (id: string) => {
    if (confirm('이 배너를 삭제하시겠습니까?')) {
      setBanners((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((b) => b.id !== id),
      }));
    }
  };

  const currentBanners = banners[activeTab];
  const totalPages = Math.max(1, Math.ceil(currentBanners.length / ITEMS_PER_PAGE));
  const paginatedBanners = currentBanners.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const tabs = [
    { id: 'top', label: '상단배너' },
    { id: 'middle', label: '중단배너' },
    { id: 'bottom', label: '하단배너' },
  ] as const;

  return (
    <div className="w-full flex flex-col gap-[24px]">
      <PageTitle>홈 배너 관리</PageTitle>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`px-6 py-3 text-[14px] font-[600] transition-colors relative ${
              activeTab === tab.id ? 'text-[#4186FF]' : 'text-gray-500 hover:text-gray-700'
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
      <div className="flex flex-wrap items-center gap-[12px]">
        <div className="flex items-center w-[380px] h-[40px] px-[14px] py-[10px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
          <Search className="w-5 h-5 text-[#71717A] shrink-0" />
          <input 
            type="text" 
            className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A] text-[#18181B]" 
            placeholder="배너 문구 검색" 
          />
        </div>
        
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center w-[160px] h-[40px] px-[12px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
            <Calendar className="w-4 h-4 text-[#71717A]" />
            <input type="text" placeholder="시작 날짜" className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A]" />
          </div>
          <span className="text-gray-400">~</span>
          <div className="flex items-center w-[160px] h-[40px] px-[12px] gap-[8px] rounded-[6px] border border-[#E4E4E7] bg-white">
            <Calendar className="w-4 h-4 text-[#71717A]" />
            <input type="text" placeholder="종료 날짜" className="w-full bg-transparent outline-none text-[14px] placeholder:text-[#71717A]" />
          </div>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-[700] text-[#18181B]">
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        <div className="flex items-center gap-4">
          <Link href="/banner/create">
            <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[40px]">
              <Plus className="w-4 h-4 mr-2" />
              배너 추가
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center gap-2">
          <span className="text-[13px] text-gray-500">페이지당</span>
          <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(1); }}>
            <SelectTrigger className="w-[80px] h-10 text-sm border-gray-200">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <AdminTableHeaderRow>
                    <AdminTableHead className="px-6 py-4 text-center w-[80px] whitespace-nowrap">순서</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">이미지</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">배너 문구</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">태그</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">게시 기간</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">활성화</AdminTableHead>
                    <AdminTableHead className="px-6 py-4">관리</AdminTableHead>
                  </AdminTableHeaderRow>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <SortableContext items={paginatedBanners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {paginatedBanners.map((banner) => (
                      <SortableTableRow
                        key={banner.id}
                        banner={banner}
                        onToggle={toggleStatus}
                        onDelete={deleteBanner}
                        onEdit={() => alert('배너 수정 모달이 열립니다.')}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </div>
          </DndContext>

          {/* Pagination */}
          <div className="flex justify-end p-4 items-center space-x-1 bg-white border-t border-gray-100">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
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
                className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
