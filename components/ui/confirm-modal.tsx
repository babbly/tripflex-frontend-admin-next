'use client';

// 디자인 시스템 "알림 모달" — Figma node 1338:16206
// shadcn AlertDialog wrapper의 grid / space-x 기본값이 Figma 스펙과 충돌해서
// Radix 프리미티브를 직접 사용하고 스타일을 처음부터 잡음.

import React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: 'single' | 'double';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmColor?: 'blue' | 'red';
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  variant = 'double',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  confirmColor,
}: ConfirmModalProps) {
  const actualConfirmColor = confirmColor || (variant === 'single' ? 'blue' : 'red');

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    onConfirm();
    onClose();
  };

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className="
            fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
            w-[491px] max-w-[calc(100vw-32px)]
            bg-white rounded-[16px] overflow-hidden
            p-[30px] flex flex-col items-center justify-center gap-[20px]
            shadow-lg
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          "
        >
          <div className="flex flex-col items-center justify-center gap-[10px] w-full text-center text-[#091D32]">
            <AlertDialogPrimitive.Title className="w-full h-[65px] flex items-center justify-center text-[20px] font-semibold leading-[30px]">
              {title}
            </AlertDialogPrimitive.Title>
            {description && (
              <AlertDialogPrimitive.Description
                className="w-full h-[65px] flex items-center justify-center font-normal not-italic text-[#091D32] text-center text-[13px] leading-[20px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {description}
              </AlertDialogPrimitive.Description>
            )}
          </div>

          <div className="flex items-center justify-center gap-[10px] w-full px-[30px]">
            {variant === 'double' && (
              <AlertDialogPrimitive.Cancel
                onClick={onClose}
                className="
                  w-[200px] px-[16px] py-[13px]
                  bg-[#F4F6FA] text-[#18181B]
                  rounded-[6px]
                  text-[13px] font-medium leading-[14px] tracking-[-0.13px]
                  hover:bg-[#E4E7EE] transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4186FF]
                "
              >
                {cancelText}
              </AlertDialogPrimitive.Cancel>
            )}
            <AlertDialogPrimitive.Action
              onClick={handleConfirm}
              className={`
                w-[200px] px-[16px] py-[13px]
                text-white rounded-[6px]
                text-[13px] font-medium leading-[14px] tracking-[-0.13px]
                transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${
                  actualConfirmColor === 'red'
                    ? 'bg-[#EF4444] hover:bg-[#DC2626] focus-visible:ring-[#EF4444]'
                    : 'bg-[#4186FF] hover:bg-[#3271DC] focus-visible:ring-[#4186FF]'
                }
              `}
            >
              {confirmText}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
