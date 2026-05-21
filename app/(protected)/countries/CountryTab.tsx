'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CloudUpload,
  GripVertical,
  ImagePlus,
  Plus,
  X,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  AdminTableHead,
  AdminTableHeaderRow,
} from '@/components/ui/admin-table';
import { countryApi } from '@/lib/country-api';
import { CountryResponse } from '@/types/country';
import { ApiError } from '@/types/api';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { usePagePermission } from '@/hooks/use-page-permission';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
const ENGLISH_NAME_PATTERN = /^[A-Za-z\s'.-]+$/;

type CountryRowProps = {
  country: CountryResponse;
  onEdit: (c: CountryResponse) => void;
  onDelete: (c: CountryResponse) => void;
  canWrite?: boolean;
  canDelete?: boolean;
};

function SortableCountryRow({ country, onEdit, onDelete, canWrite = true, canDelete = true }: CountryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: country.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 transition-colors bg-white"
    >
      <td className="px-4 py-4 w-[60px] text-center">
        {canWrite && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="순서 변경"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {country.flagImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={country.flagImageUrl}
              alt={country.nameKo}
              className="w-6 h-4 object-cover rounded-sm shadow-sm"
            />
          ) : country.flagEmoji ? (
            <span className="text-xl leading-none">{country.flagEmoji}</span>
          ) : (
            <div className="w-6 h-4 bg-gray-100 rounded-sm" />
          )}
          <span className="text-[14px] font-medium text-gray-900">
            {country.nameKo}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {canWrite && <EditButton onClick={() => onEdit(country)} />}
          {canDelete && <DeleteButton onClick={() => onDelete(country)} />}
        </div>
      </td>
    </tr>
  );
}

export default function CountryTab() {
  const queryClient = useQueryClient();
  const { canWrite, canDelete } = usePagePermission('/countries');

  // 페이지네이션 제거 — 순서 변경 기능 추가 시 재도입.
  // const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState('10');
  // const size = parseInt(pageSize, 10);
  const FETCH_SIZE = 500;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countryApi.list({ page: 0, size: FETCH_SIZE }),
  });

  const [localOrder, setLocalOrder] = useState<CountryResponse[] | null>(null);
  useEffect(() => {
    setLocalOrder(null);
  }, [data]);
  const countries = localOrder ?? data?.content ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      countryApi.updateSort(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '순서 변경에 실패했습니다.');
      setLocalOrder(null);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = countries.findIndex((c) => c.id === active.id);
    const newIndex = countries.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(countries, oldIndex, newIndex);
    setLocalOrder(reordered);
    reorderMutation.mutate(
      reordered.map((c, idx) => ({ id: c.id, displayOrder: idx })),
    );
  };

  const [editing, setEditing] = useState<CountryResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [countryCode, setCountryCode] = useState('');
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [flagImageUrl, setFlagImageUrl] = useState('');
  const [defaultLanguageCode, setDefaultLanguageCode] = useState('');
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);

  // 검증 에러 메시지 (필드별)
  const [errors, setErrors] = useState<{
    nameKo?: string;
    nameEn?: string;
    countryCode?: string;
  }>({});

  // 이미지 업로드 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // 취소 확인 모달
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    if (editing) {
      setCountryCode(editing.countryCode);
      setNameKo(editing.nameKo);
      setNameEn(editing.nameEn);
      setFlagImageUrl(editing.flagImageUrl ?? '');
      setDefaultLanguageCode(editing.defaultLanguageCode ?? '');
      setDefaultCurrencyCode(editing.defaultCurrencyCode ?? '');
      setDisplayOrder(editing.displayOrder ?? 0);
      setActive(editing.active);
    } else {
      setCountryCode('');
      setNameKo('');
      setNameEn('');
      setFlagImageUrl('');
      setDefaultLanguageCode('');
      setDefaultCurrencyCode('');
      setDisplayOrder(0);
      setActive(true);
    }
    setErrors({});
    setImageFile(null);
  }, [editing]);

  useEffect(() => {
    if (!imageFile) {
      setFilePreview('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const validateAndSetFile = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('PNG, JPG, GIF 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('이미지 용량은 최대 5MB까지 가능합니다.');
      return;
    }
    setImageFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  // 백엔드 presigned URL 발급 후 PUT 업로드 → { publicUrl, imagePath } 반환
  const uploadFlagImage = async (
    file: File,
  ): Promise<{ publicUrl: string; imagePath: string }> => {
    const presign = await countryApi.flagUploadUrl({
      filename: file.name,
      contentType: file.type,
    });
    const putRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!putRes.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
    return { publicUrl: presign.publicUrl, imagePath: presign.imagePath };
  };

  // 필수값 + 형식 검증
  const isCountryCodeValid = COUNTRY_CODE_PATTERN.test(countryCode);
  const isNameEnValid = ENGLISH_NAME_PATTERN.test(nameEn.trim());
  const isFormValid =
    nameKo.trim().length > 0 &&
    nameEn.trim().length > 0 &&
    isNameEnValid &&
    countryCode.length > 0 &&
    isCountryCodeValid;

  const hasDirtyInput = (() => {
    if (editing) {
      return (
        nameKo !== editing.nameKo ||
        nameEn !== editing.nameEn ||
        countryCode !== editing.countryCode ||
        flagImageUrl !== (editing.flagImageUrl ?? '') ||
        !!imageFile
      );
    }
    return (
      nameKo.trim().length > 0 ||
      nameEn.trim().length > 0 ||
      countryCode.length > 0 ||
      !!imageFile
    );
  })();

  const createMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = flagImageUrl;
      if (imageFile) {
        const uploaded = await uploadFlagImage(imageFile);
        imageUrl = uploaded.publicUrl;
      }
      return countryApi.create({
        countryCode: countryCode.trim().toUpperCase(),
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim(),
        flagImageUrl: imageUrl || undefined,
        defaultLanguageCode: defaultLanguageCode || undefined,
        defaultCurrencyCode: defaultCurrencyCode || undefined,
        displayOrder,
        active,
      });
    },
    onSuccess: () => {
      toast.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = flagImageUrl;
      if (imageFile) {
        const uploaded = await uploadFlagImage(imageFile);
        imageUrl = uploaded.publicUrl;
      }
      return countryApi.update(editing!.id, {
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim(),
        flagImageUrl: imageUrl || undefined,
        defaultLanguageCode: defaultLanguageCode || undefined,
        defaultCurrencyCode: defaultCurrencyCode || undefined,
        displayOrder,
        active,
      });
    },
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => countryApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다.');
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<CountryResponse | null>(null);

  const handleSave = () => {
    const nextErrors: typeof errors = {};
    if (!nameKo.trim()) nextErrors.nameKo = '국가명을 입력해주세요.';
    if (!nameEn.trim()) {
      nextErrors.nameEn = '국가명 영문을 입력해주세요.';
    } else if (!ENGLISH_NAME_PATTERN.test(nameEn.trim())) {
      nextErrors.nameEn = '영문만 입력 가능합니다.';
    }
    if (!countryCode) {
      nextErrors.countryCode = '국가코드를 입력해주세요.';
    } else if (!COUNTRY_CODE_PATTERN.test(countryCode)) {
      nextErrors.countryCode = '올바른 국가코드를 입력해주세요.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  const handleCancel = () => {
    if (hasDirtyInput) {
      setCancelOpen(true);
      return;
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-end">
          {!showForm && canWrite && (
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              국가 추가
            </Button>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow>
                  <AdminTableHead className="px-4 py-4 w-[60px] text-center">
                    순서
                  </AdminTableHead>
                  <AdminTableHead className="px-6 py-4">국가명</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 text-right w-[120px]">
                    관리
                  </AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                      불러오는 중...
                    </td>
                  </tr>
                )}
                {isError && !isLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-red-500">
                      {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && countries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                      등록된 국가가 없습니다.
                    </td>
                  </tr>
                )}
                <SortableContext
                  items={countries.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {countries.map((c) => (
                    <SortableCountryRow
                      key={c.id}
                      country={c}
                      onEdit={(target) => {
                        setEditing(target);
                        setShowForm(true);
                      }}
                      onDelete={(target) => setDeleteTarget(target)}
                      canWrite={canWrite}
                      canDelete={canDelete}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
          {/* 페이지네이션 — 순서 변경 기능 적용 후 다시 살릴 예정. */}
          {/* {totalPages > 0 && (
            <div className="flex justify-end p-4 items-center gap-1 bg-white border-t border-gray-100">
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

      <div className={`transition-all duration-300 overflow-hidden shrink-0 ${showForm ? 'w-[360px]' : 'w-0'}`}>
        <div className="w-[360px] flex flex-col gap-4">
          <Card className="p-6 border-gray-200 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-[18px] text-gray-900">
              {editing ? '국가 편집' : '국가 추가'}
            </h3>
            <div className="h-[1px] bg-gray-100 w-full" />
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가명 (ex. 대한민국)
                </label>
                <Input
                  placeholder="국가명을 입력해주세요"
                  value={nameKo}
                  onChange={(e) => {
                    setNameKo(e.target.value);
                    if (errors.nameKo) setErrors((p) => ({ ...p, nameKo: undefined }));
                  }}
                  maxLength={100}
                  className={`border-gray-200 h-11 ${errors.nameKo ? 'border-red-400' : ''}`}
                />
                {errors.nameKo && (
                  <p className="text-[12px] text-red-500">{errors.nameKo}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가명 영문 (ex. Korea)
                </label>
                <Input
                  placeholder="국가명을 영문으로 입력해주세요"
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    if (errors.nameEn) setErrors((p) => ({ ...p, nameEn: undefined }));
                  }}
                  maxLength={100}
                  className={`border-gray-200 h-11 ${errors.nameEn ? 'border-red-400' : ''}`}
                />
                {errors.nameEn && (
                  <p className="text-[12px] text-red-500">{errors.nameEn}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  ISO 국가코드 (ex. KR)
                </label>
                <Input
                  placeholder="ISO 국가코드를 입력해주세요"
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value.toUpperCase().slice(0, 2));
                    if (errors.countryCode)
                      setErrors((p) => ({ ...p, countryCode: undefined }));
                  }}
                  maxLength={2}
                  className={`border-gray-200 h-11 ${errors.countryCode ? 'border-red-400' : ''}`}
                />
                {errors.countryCode && (
                  <p className="text-[12px] text-red-500">{errors.countryCode}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가 이미지
                </label>
                {filePreview || flagImageUrl ? (
                  <div className="relative w-full aspect-[3/1] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[8px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreview || flagImageUrl}
                      alt="국기 미리보기"
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxSrc(filePreview || flagImageUrl)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setFlagImageUrl('');
                      }}
                      aria-label="이미지 제거"
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`bg-[#F9FAFB] border border-dashed rounded-[8px] h-[180px] flex flex-col items-center justify-center gap-[12px] cursor-pointer transition-colors ${
                      isDragOver ? 'border-[#4186FF] bg-[#EEF1FF]' : 'border-[#D1D5DB]'
                    }`}
                  >
                    <div className="bg-[#EEF1FF] w-12 h-12 rounded-full flex items-center justify-center">
                      <CloudUpload className="w-6 h-6 text-[#4186FF]" />
                    </div>
                    <p className="text-[13px] font-[600] text-[#18181B]">
                      이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-[12px] text-[#71717A]">PNG, JPG, GIF (최대 5MB)</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-2 h-11 flex items-center justify-center gap-2 border border-[#E4E4E7] rounded-[6px] bg-white hover:bg-gray-50 text-[14px] font-[500] text-[#18181B] transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  파일 선택
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
                onClick={handleSave}
                style={
                  !isFormValid || createMutation.isPending || updateMutation.isPending
                    ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
                    : undefined
                }
                className="w-full bg-[#4186FF] hover:bg-blue-600 text-white h-11 font-bold disabled:hover:bg-[#E4E4E7]"
              >
                {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 h-11 text-gray-700 font-bold hover:bg-gray-50"
                onClick={handleCancel}
              >
                취소
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="국가를 삭제하시겠어요?"
        description={`삭제 시 "${deleteTarget?.nameKo}" 국가의 정보가 모두 제거됩니다.`}
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="변경사항이 있습니다."
        description="취소하시겠습니까?"
        cancelText="취소"
        confirmText="확인"
        confirmColor="blue"
        onConfirm={() => {
          setShowForm(false);
          setEditing(null);
        }}
      />
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
