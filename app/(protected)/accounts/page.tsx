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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Account {
  id: string;
  accountId: string;
  name: string;
  role: '슈퍼 관리자' | '관리자' | '뷰어';
  isActive: boolean;
  createdAt: string;
}

export default function AccountsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const ITEMS_PER_PAGE = parseInt(pageSize);

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      accountId: 'mhu_admin',
      name: '유명호',
      role: '슈퍼 관리자',
      isActive: true,
      createdAt: '2026-04-01',
    },
    {
      id: '2',
      accountId: 'ecjo_staff',
      name: '조은채',
      role: '관리자',
      isActive: true,
      createdAt: '2026-04-15',
    },
    {
      id: '3',
      accountId: 'jehur_viewer',
      name: '허지은',
      role: '뷰어',
      isActive: false,
      createdAt: '2026-04-30',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const filteredAccounts = accounts.filter((account) => {
    // 텍스트 검색
    const matchesQuery = account.accountId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         account.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    
    return matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE));

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
        </div>

        {/* Search & Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-[280px]">
              <Input 
                type="text" 
                className="pl-9 h-10 border-gray-200 bg-white text-[#71717A] placeholder:text-[#71717A]" 
                placeholder="아이디, 이름 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>


            <Button 
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6"
              onClick={() => setPage(1)}
            >
              검색
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleAddClick} className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold leading-normal h-9 px-4">
              <Plus className="w-4 h-4 mr-2" />
              계정 추가
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
          <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow>
                  <AdminTableHead className="px-6 py-4">아이디</AdminTableHead>
                  <AdminTableHead className="px-6 py-4">이름</AdminTableHead>
                  <AdminTableHead className="px-6 py-4">권한 선택</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 text-center">상태</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 text-center">관리</AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {account.accountId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {account.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-[#eef1ff] text-[#1C2340] text-[11px] font-[600] leading-normal hover:bg-[#eef1ff]"
                      >
                        {account.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Badge 
                          variant="secondary" 
                          className={`font-semibold flex items-center gap-1.5 ${
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <EditButton onClick={() => handleEditClick(account)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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

      {/* Right Area - Edit Panel */}
      {isEditing && (
        <div 
          key={selectedAccount?.id || 'new'}
          className="w-[320px] bg-white rounded-lg border border-gray-200 shadow-sm p-[20px] flex flex-col shrink-0 self-start gap-[16px]"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">
              {selectedAccount ? '계정 편집' : '계정 추가'}
            </h3>
            {selectedAccount && (
              <DeleteButton onClick={() => handleDeleteClick(selectedAccount.id)} />
            )}
          </div>
          
          <div className="h-[1px] bg-[#E4E4E7] self-stretch" />

          <div className="flex flex-col gap-[16px]">
            <label className="text-sm font-semibold text-gray-900">아이디</label>
            <Input 
              type="text" 
              placeholder="아이디를 입력해주세요" 
              defaultValue={selectedAccount?.accountId || ''}
              className="border-blue-400 focus-visible:ring-[#4186FF] focus-visible:border-[#4186FF]"
            />
          </div>
          
          <div className="flex flex-col gap-[16px]">
            <label className="text-sm font-semibold text-gray-900">이름</label>
            <Input 
              type="text" 
              placeholder="이름을 입력해주세요" 
              defaultValue={selectedAccount?.name || ''}
              className="border-gray-200"
            />
          </div>

          <div className="flex flex-col gap-[16px]">
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

          <div className="flex flex-col gap-[8px]">
            <label className="text-sm font-semibold text-gray-900">활성화</label>
            <div className="flex items-center space-x-3">
              <Switch defaultChecked={selectedAccount?.isActive ?? true} />
              <span className="text-sm text-gray-500">계정이 활성화됩니다.</span>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Button className="w-full bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10">
              저장
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold"
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
