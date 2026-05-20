'use client';

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
  onConfirm: () => void | Promise<unknown>;
  confirmColor?: 'blue' | 'red';
  titleClassName?: string;
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
  titleClassName,
}: ConfirmModalProps) {
  const actualConfirmColor = confirmColor || (variant === 'single' ? 'blue' : 'red');

  // onConfirm이 throw하거나 reject되면 모달 유지. 정상 종료 시에만 onClose 호출.
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await onConfirm();
      onClose();
    } catch {
      /* 모달 유지 — 호출 측에서 toast 등으로 에러 안내 */
    }
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
            <AlertDialogPrimitive.Title className={`w-full flex items-center justify-center text-[20px] font-semibold leading-[30px] whitespace-pre-line ${titleClassName ?? 'h-[65px]'}`}>
              {title}
            </AlertDialogPrimitive.Title>
            {description && (
              <AlertDialogPrimitive.Description
                className="w-full flex items-center justify-center font-normal not-italic text-[#091D32] text-center text-[13px] leading-[20px] whitespace-pre-line"
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
