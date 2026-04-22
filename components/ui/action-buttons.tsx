import { Edit2, Trash2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const CustomEditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
    <g clipPath="url(#clip0_774_93044)">
      <path d="M14.116 4.54029C14.4685 4.1879 14.6665 3.70993 14.6666 3.21152C14.6666 2.71311 14.4687 2.23509 14.1163 1.88262C13.7639 1.53015 13.286 1.33209 12.7876 1.33203C12.2892 1.33197 11.8111 1.5299 11.4587 1.88229L2.56133 10.7816C2.40654 10.936 2.29207 11.126 2.228 11.335L1.34733 14.2363C1.3301 14.2939 1.3288 14.3552 1.34356 14.4135C1.35833 14.4719 1.38861 14.5251 1.43119 14.5676C1.47378 14.6101 1.52708 14.6403 1.58544 14.655C1.64379 14.6697 1.70504 14.6683 1.76266 14.651L4.66466 13.771C4.87344 13.7075 5.06345 13.5937 5.218 13.4396L14.116 4.54029Z" stroke="#4186FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 3.33203L12.6667 5.9987" stroke="#4186FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_774_93044">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export function EditButton(props: ActionButtonProps) {
  return (
    <button 
      {...props} 
      className={`p-2 ${props.className || ''}`}
      aria-label="수정"
    >
      <CustomEditIcon className="w-4 h-4" />
    </button>
  );
}

const CustomDeleteIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M6.66663 7.33203V11.332" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.33337 7.33203V11.332" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2762 14.2761C12.0261 14.5262 11.687 14.6667 11.3334 14.6667H4.66671C4.31309 14.6667 3.97395 14.5262 3.7239 14.2761C3.47385 14.0261 3.33337 13.687 3.33337 13.3333V4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 4H14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.33337 3.9987V2.66536C5.33337 2.31174 5.47385 1.9726 5.7239 1.72256C5.97395 1.47251 6.31309 1.33203 6.66671 1.33203H9.33337C9.687 1.33203 10.0261 1.47251 10.2762 1.72256C10.5262 1.9726 10.6667 2.31174 10.6667 2.66536V3.9987" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function DeleteButton(props: ActionButtonProps) {
  return (
    <button 
      {...props} 
      className={`p-2 ${props.className || ''}`}
      aria-label="삭제"
    >
      <CustomDeleteIcon className="w-4 h-4" />
    </button>
  );
}
