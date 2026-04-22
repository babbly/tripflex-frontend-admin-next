'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, ImageIcon, MessageSquare, Globe, BookOpen } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
interface Role {
  id: string;
  name: string;
}

interface Permission {
  page: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

const CustomImageAnalysisIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" fill="none" className={className}>
    <g clipPath="url(#clip0_774_94064)">
      <path d="M11.9166 6.4987H10.5733C10.3366 6.49819 10.1062 6.57524 9.91742 6.71805C9.72863 6.86087 9.59181 7.0616 9.5279 7.28953L8.25498 11.8179C8.24677 11.846 8.22967 11.8707 8.20623 11.8883C8.18279 11.9059 8.15428 11.9154 8.12498 11.9154C8.09568 11.9154 8.06717 11.9059 8.04373 11.8883C8.02029 11.8707 8.00318 11.846 7.99498 11.8179L5.00498 1.17953C4.99678 1.1514 4.97967 1.12669 4.95623 1.10911C4.93279 1.09153 4.90428 1.08203 4.87498 1.08203C4.84568 1.08203 4.81717 1.09153 4.79373 1.10911C4.77029 1.12669 4.75318 1.1514 4.74498 1.17953L3.47206 5.70786C3.4084 5.93491 3.27239 6.13498 3.0847 6.2777C2.897 6.42043 2.66786 6.49802 2.43206 6.4987H1.08331" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_774_94064">
        <rect width="13" height="13" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const mockRoles: Role[] = [
  { id: '1', name: '슈퍼관리자' },
  { id: '2', name: '관리자' },
  { id: '3', name: '뷰어' },
];

const mockPermissions: Permission[] = [
  { page: '홈 배너 관리', read: true, write: true, delete: false },
  { page: '이미지 분석 목록', read: true, write: false, delete: false },
  { page: '유저 제안 관리', read: true, write: true, delete: false },
  { page: 'FAQ 관리', read: true, write: true, delete: true },
];

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [selectedRole, setSelectedRole] = useState<Role>(mockRoles[0]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setRoleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      setRoles(prev => prev.filter(r => r.id !== roleToDelete));
      setRoleToDelete(null);
    }
  };

  const handlePermissionChange = (pageName: string, type: 'read' | 'write' | 'delete', checked: boolean) => {
    setPermissions(prev =>
      prev.map(p =>
        p.page === pageName ? { ...p, [type]: checked } : p
      )
    );
  };

  return (
    <div className="w-full flex gap-6 pb-12">
      {/* Left Column: Role List */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <PageTitle>권한 관리</PageTitle>
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal">
            <Plus className="w-4 h-4 mr-2" />
            권한 추가
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow className="border-gray-200">
                  <AdminTableHead>권한명</AdminTableHead>
                  <AdminTableHead className="w-32 text-center">관리</AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50 group">
                    <td className="p-4 font-medium text-gray-900">{role.name}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <EditButton onClick={() => setSelectedRole(role)} />
                        <DeleteButton onClick={() => handleDeleteClick(role.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end p-4 items-center space-x-2 bg-[#F9FAFB] rounded-b-lg border-t border-[#E4E4E7]">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-500 hover:bg-gray-50 opacity-50 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="w-8 h-8 p-0 bg-[#4186FF] text-white text-[14px] font-[600] leading-normal hover:bg-blue-600"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0 border-gray-200 text-gray-500 hover:bg-gray-50 opacity-50 cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Role Edit Form */}
      <div className="w-[360px] flex-shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-[16px] font-[700] text-[#18181B] mb-4 pb-4 border-b border-gray-200">
              권한 편집
            </h2>
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-[600] text-[#18181B]">권한명</Label>
            <Input
              value={selectedRole.name}
              onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-[600] text-[#18181B]">권한설정</Label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <AdminTableHeaderRow className="border-gray-200 whitespace-normal">
                    <AdminTableHead className="p-3">페이지</AdminTableHead>
                    <AdminTableHead className="p-3 text-center">읽기</AdminTableHead>
                    <AdminTableHead className="p-3 text-center">쓰기</AdminTableHead>
                    <AdminTableHead className="p-3 text-center">삭제</AdminTableHead>
                  </AdminTableHeaderRow>
                </thead>
                <tbody>
                  {permissions.map((p) => (
                    <tr key={p.page} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                      <td className="p-3 flex items-center space-x-2 text-gray-600">
                        {p.page === '홈 배너 관리' && <ImageIcon className="w-4 h-4 text-gray-500" />}
                        {p.page === '이미지 분석 목록' && <CustomImageAnalysisIcon className="w-4 h-4 text-gray-500" />}
                        {p.page === '유저 제안 관리' && <MessageSquare className="w-4 h-4 text-gray-500" />}
                        {p.page === 'FAQ 관리' && <BookOpen className="w-4 h-4 text-gray-500" />}
                        <span>{p.page}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={p.read}
                          onCheckedChange={(checked) => handlePermissionChange(p.page, 'read', checked as boolean)}
                          className={p.read ? 'data-[state=checked]:bg-[#4186FF] data-[state=checked]:border-[#4186FF]' : ''}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={p.write}
                          onCheckedChange={(checked) => handlePermissionChange(p.page, 'write', checked as boolean)}
                          className={p.write ? 'data-[state=checked]:bg-[#4186FF] data-[state=checked]:border-[#4186FF]' : ''}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={p.delete}
                          onCheckedChange={(checked) => handlePermissionChange(p.page, 'delete', checked as boolean)}
                          className={p.delete ? 'data-[state=checked]:bg-[#4186FF] data-[state=checked]:border-[#4186FF]' : ''}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 flex flex-col space-y-2">
            <Button className="w-full bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-11">
              저장
            </Button>
            <Button variant="outline" className="w-full h-11 border-gray-200 text-gray-700 hover:bg-gray-50">
              취소
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="권한을 삭제하시겠어요"
        description="삭제 후에는 복구할수 없습니다."
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
