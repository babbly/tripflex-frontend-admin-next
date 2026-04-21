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
import { Search, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{banner.tag}</Badge>
      </td>
      <td className="p-4 text-gray-600 text-sm">
        {banner.startDate} ~ {banner.endDate}
      </td>
      <td className="p-4">
        <Switch checked={banner.isActive} onCheckedChange={() => onToggle(banner.id)} />
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => onEdit(banner.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(banner.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function BannerPage() {
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

  const renderTable = (banners: Banner[], handleDragEnd: (e: DragEndEvent) => void, isTop: boolean) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                <th className="p-4 font-medium text-center w-10">순서</th>
                <th className="p-4 font-medium">이미지</th>
                <th className="p-4 font-medium">배너 문구</th>
                <th className="p-4 font-medium">태그</th>
                <th className="p-4 font-medium">게시 기간</th>
                <th className="p-4 font-medium">활성화</th>
                <th className="p-4 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {banners.map((banner) => (
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
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">홈 배너 관리</h1>
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input type="text" className="pl-10 h-11" placeholder="배너 문구 검색..." />
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">상단 배너</h2>
          <Button className="bg-[#3E97FF] hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            배너 추가
          </Button>
        </div>
        {renderTable(topBanners, handleDragEndTop, true)}
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">하단 배너</h2>
          <Button className="bg-[#3E97FF] hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            배너 추가
          </Button>
        </div>
        {renderTable(bottomBanners, handleDragEndBottom, false)}
      </section>
    </div>
  );
}
