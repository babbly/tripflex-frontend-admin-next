'use client';

import React, { useState } from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { adminAuthApi } from '@/lib/admin-api';
import { ApiError } from '@/types/api';
import { useAdminAuth } from '@/providers/admin-auth-provider';

const PASSWORD_PATTERN =
  /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,}$/;

type PasswordFieldProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
};

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 pr-10 border-gray-200"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function ChangePasswordModal({ open }: { open: boolean }) {
  const { markPasswordChanged } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const newValid = PASSWORD_PATTERN.test(newPassword);
  const matched = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    !submitting && currentPassword.length > 0 && newValid && matched;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await adminAuthApi.changePassword(currentPassword, newPassword);
      toast.success('비밀번호가 변경되었습니다.');
      markPasswordChanged();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : '비밀번호 변경에 실패했습니다.',
      );
      setSubmitting(false);
    }
  };

  return (
    <AlertDialogPrimitive.Root open={open}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className="
            fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
            w-[491px] max-w-[calc(100vw-32px)]
            bg-white rounded-[16px] overflow-hidden
            p-[30px] flex flex-col gap-[20px]
            shadow-lg
            data-[state=open]:animate-in data-[state=open]:fade-in-0
            data-[state=open]:zoom-in-95
          "
        >
          <div className="flex flex-col items-center text-center text-[#091D32] gap-[8px]">
            <AlertDialogPrimitive.Title className="text-[20px] font-semibold leading-[30px]">
              비밀번호 변경
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description
              className="text-[13px] font-normal leading-[20px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              보안을 위해 비밀번호를 변경해주세요.
            </AlertDialogPrimitive.Description>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-[600] text-[#18181B]">
                현재 비밀번호
              </label>
              <PasswordField
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="현재 비밀번호를 입력해주세요"
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-[600] text-[#18181B]">
                새로운 비밀번호
              </label>
              <PasswordField
                value={newPassword}
                onChange={setNewPassword}
                placeholder="8자 이상, 숫자와 특수문자 조합"
                autoComplete="new-password"
              />
              {newPassword.length > 0 && !newValid && (
                <p className="text-[11px] text-red-500">
                  8자 이상, 숫자와 특수문자를 모두 포함해야 합니다.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] font-[600] text-[#18181B]">
                새로운 비밀번호 확인
              </label>
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="새 비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && !matched && (
                <p className="text-[11px] text-red-500">
                  새 비밀번호와 일치하지 않습니다.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                mt-[6px] w-full px-[16px] py-[13px]
                rounded-[6px] text-white text-[13px] font-medium leading-[14px]
                transition-colors
                ${
                  canSubmit
                    ? 'bg-[#4186FF] hover:bg-[#3271DC]'
                    : 'bg-[#A1A1AA] cursor-not-allowed'
                }
              `}
            >
              {submitting ? '변경 중...' : '완료'}
            </button>
          </form>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
