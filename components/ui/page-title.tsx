import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function PageTitle({ children, className, ...props }: PageTitleProps) {
  return (
    <h1 
      className={cn('text-[22px] text-[#18181B] font-[700] not-italic leading-normal', className)}
      {...props}
    >
      {children}
    </h1>
  );
}
