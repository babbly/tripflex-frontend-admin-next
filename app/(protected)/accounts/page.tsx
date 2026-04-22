'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';

interface Account {
  id: string;
  email: string;
  name: string;
  role: '슈퍼 관리자' | '관리자' | '뷰어';
  isActive: boolean;
}

export default function AccountsPage() {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      email: 'mhu@example.com',
      name: '유명호',
      role: '슈퍼 관리자',
      isActive: true,
    },
    {
      id: '2',
      email: 'ecjo@example.com',
      name: '조은채',
      role: '관리자',
      isActive: true,
    },
    {
      id: '3',
      email: 'jehur@example.com',
      name: '허지은',
      role: '뷰어',
      isActive: false,
    },
  ]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(accounts[0]);
  const [isEditing, setIsEditing] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(accounts.length / ITEMS_PER_PAGE));

  const handleEditClick = (account: Account) => {
    setSelectedAccount(account);
    setIsEditing(true);
  };

  const handleDeleteClick = (id: string) => {
    setAccountToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      setAccounts((prev) => prev.filter((a) => a.id !== accountToDelete));
      if (selectedAccount?.id === accountToDelete) {
        setSelectedAccount(null);
        setIsEditing(false);
      }
      setAccountToDelete(null);
    }
  };

  const handleAddClick = () => {
    setSelectedAccount(null);
    setIsEditing(true);
  };

  return (
    <div className="w-full flex gap-6 pb-12">
      {/* Left Area - Table */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <PageTitle>계정 관리</PageTitle>
          <Button onClick={handleAddClick} className="bg-[#4186FF] hover:bg-blue-600 text-white h-10 px-4">
            <Plus className="w-4 h-4 mr-2" />
            계정 추가
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-[280px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input type="text" className="pl-9 h-10 border-gray-200 bg-white" placeholder="이메일, 이름 검색..." />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow>
                  <AdminTableHead>이메일</AdminTableHead>
                  <AdminTableHead>이름</AdminTableHead>
                  <AdminTableHead>권한 선택</AdminTableHead>
                  <AdminTableHead className="w-24 text-center">상태</AdminTableHead>
                  <AdminTableHead className="w-24 text-center">관리</AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b bg-white hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {account.email}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {account.name}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-[#EEF1FF] text-[#1C2340] hover:bg-[#EEF1FF] font-normal"
                      >
                        {account.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <Badge 
                          variant="secondary" 
                          className={`font-normal flex items-center gap-1.5 ${
                            account.isActive 
                              ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5]' 
                              : 'bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FEE2E2]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${account.isActive ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                          {account.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <EditButton onClick={() => handleEditClick(account)} />
                        <DeleteButton onClick={() => handleDeleteClick(account.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
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
                className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
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
      </div>

      {/* Right Area - Edit Panel */}
      {isEditing && (
        <div className="w-[320px] bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col shrink-0 self-start">
          <h3 className="font-bold text-lg text-gray-900 mb-6">
            {selectedAccount ? '계정 편집' : '계정 추가'}
          </h3>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">이메일</label>
              <Input 
                type="email" 
                placeholder="이메일을 입력해주세요" 
                defaultValue={selectedAccount?.email || ''}
                className="border-blue-400 focus-visible:ring-[#4186FF] focus-visible:border-[#4186FF]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">이름</label>
              <Input 
                type="text" 
                placeholder="이름을 입력해주세요" 
                defaultValue={selectedAccount?.name || ''}
                className="border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">권한 선택</label>
              <div className="relative">
                <select 
                  className="w-full h-10 pl-3 pr-8 text-sm border border-gray-200 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#4186FF] focus:border-[#4186FF] text-gray-600"
                  defaultValue={selectedAccount?.role || ''}
                >
                  <option value="" disabled>선택</option>
                  <option value="슈퍼 관리자">슈퍼 관리자</option>
                  <option value="관리자">관리자</option>
                  <option value="뷰어">뷰어</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-gray-900">활성화</label>
              <div className="flex items-center space-x-3">
                <Switch defaultChecked={selectedAccount?.isActive ?? true} />
                <span className="text-sm text-gray-500">계정이 활성화됩니다.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-8">
            <Button className="w-full bg-[#4186FF] hover:bg-blue-600 text-white h-10">
              저장
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 h-10"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="계정을 삭제하시겠어요?"
        description="삭제 시 해당 계정은 더 이상 사용할 수 없습니다."
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
