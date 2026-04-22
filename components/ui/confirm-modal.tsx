'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90%] sm:max-w-[491px] p-[30px] rounded-2xl border-0 shadow-lg gap-[20px]">
        <AlertDialogHeader className="w-full sm:w-[431px] flex flex-col items-center justify-center">
          <AlertDialogTitle className="w-full h-[65px] flex items-center justify-center text-[#091D32] text-center text-[20px] font-[600] leading-[30px] m-0 p-0">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="w-full h-[65px] flex items-center justify-center text-center text-[15px] text-[#555968] font-medium m-0 p-0">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex w-full gap-3 sm:space-x-0 sm:justify-center flex-row">
          {variant === 'double' && (
            <AlertDialogCancel asChild>
              <Button
                variant="secondary"
                className="flex-1 bg-[#F4F5F7] hover:bg-gray-200 text-[#1C2340] h-12 rounded-xl text-base font-semibold border-0 mt-0"
                onClick={onClose}
              >
                {cancelText}
              </Button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button
              className={`flex-1 h-12 rounded-xl text-base font-semibold text-white ${
                actualConfirmColor === 'red' 
                  ? 'bg-[#EF4444] hover:bg-red-600' 
                  : 'bg-[#4186FF] hover:bg-blue-600'
              }`}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
