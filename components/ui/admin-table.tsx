import React from 'react';
import { cn } from '@/lib/utils';

interface AdminTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function AdminTableHeaderRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("bg-gray-50 border-b text-[#71717A] text-[12px] font-[600]", className)} {...props}>
      {children}
    </tr>
  );
}

export function AdminTableHead({ children, className, ...props }: AdminTableHeadProps) {
  return (
    <th className={cn("p-4", className)} {...props}>
      {children}
    </th>
  );
}
