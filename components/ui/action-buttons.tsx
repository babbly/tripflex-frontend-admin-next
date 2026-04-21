import { Edit2, Trash2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function EditButton(props: ActionButtonProps) {
  return (
    <button 
      {...props} 
      className={`p-2 text-blue-600 ${props.className || ''}`}
      aria-label="수정"
    >
      <Edit2 className="w-4 h-4" />
    </button>
  );
}

export function DeleteButton(props: ActionButtonProps) {
  return (
    <button 
      {...props} 
      className={`p-2 text-red-600 ${props.className || ''}`}
      aria-label="삭제"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
