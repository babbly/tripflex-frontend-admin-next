'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bold,
  ChevronDown,
  Check,
  Image as ImageIcon,
  Indent,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Outdent,
  Quote,
  Redo,
  Undo,
  Video,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { faqApi } from '@/lib/faq-api';
import { ApiError } from '@/types/api';

export default function FAQEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const faqId = id as string;

  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [locale, setLocale] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);

  const [initCategory, setInitCategory] = useState('');
  const [initQuestion, setInitQuestion] = useState('');
  const [initIsActive, setInitIsActive] = useState(true);
  const [editorModified, setEditorModified] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastRange = useRef<Range | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['faq', faqId],
    queryFn: () => faqApi.detail(faqId),
    enabled: !!faqId,
  });

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!data || hydrated) return;
    setCategory(data.category ?? '');
    setQuestion(data.question ?? '');
    setIsActive(data.active);
    setLocale(data.locale ?? '');
    if (editorRef.current) {
      editorRef.current.innerHTML = data.answer ?? '';
    }
    const plainText = (data.answer ?? '').replace(/<[^>]+>/g, '').trim();
    setAnswerText(plainText);
    setInitCategory(data.category ?? '');
    setInitQuestion(data.question ?? '');
    setInitIsActive(data.active);
    setHydrated(true);
  }, [data, hydrated]);

  const isFormValid =
    category.trim().length > 0 &&
    question.trim().length > 0 &&
    answerText.trim().length > 0;

  const isDirty =
    category !== initCategory ||
    question !== initQuestion ||
    isActive !== initIsActive ||
    editorModified;

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        lastRange.current = range;
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && lastRange.current) {
      sel.removeAllRanges();
      sel.addRange(lastRange.current);
    } else if (editorRef.current) {
      editorRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      lastRange.current = range;
    }
  };

  const handleCommand = (command: string, value?: string) => {
    restoreSelection();
    if (command === 'formatBlock' && value) {
      document.execCommand(command, false, `<${value.toUpperCase()}>`);
    } else {
      document.execCommand(command, false, value);
    }
    saveSelection();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        restoreSelection();
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '10px 0';

        if (
          lastRange.current &&
          editorRef.current?.contains(lastRange.current.commonAncestorContainer)
        ) {
          lastRange.current.deleteContents();
          lastRange.current.insertNode(img);
          const br = document.createElement('br');
          img.after(br);
          const newRange = document.createRange();
          newRange.setStartAfter(br);
          newRange.setEndAfter(br);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(newRange);
            lastRange.current = newRange;
          }
        } else if (editorRef.current) {
          editorRef.current.appendChild(img);
          editorRef.current.appendChild(document.createElement('br'));
          editorRef.current.focus();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const insertVideo = () => {
    const url = prompt(
      'YouTube 영상 URL을 입력하세요',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
    if (url) {
      const embedUrl = url.includes('watch?v=')
        ? url.replace('watch?v=', 'embed/')
        : url;
      const videoHTML = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin: 10px 0;">
        <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allowfullscreen></iframe>
      </div><p><br></p>`;
      handleCommand('insertHTML', videoHTML);
    }
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      const answer = editorRef.current?.innerHTML ?? '';
      return faqApi.update(faqId, {
        category: category.trim(),
        question: question.trim(),
        answer,
        active: isActive,
        displayOrder: data?.displayOrder,
      });
    },
    onSuccess: () => {
      toast.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['faq', faqId] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      router.replace('/faq');
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.');
    },
  });

  const handleSave = () => {
    if (!isFormValid) return;
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full p-12 text-center text-gray-500 text-sm">
        불러오는 중...
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full p-12 text-center text-red-500 text-sm">
        {error instanceof ApiError ? error.message : 'FAQ를 불러오지 못했습니다.'}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[24px] pb-20">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/faq">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </Button>
          </Link>
          <PageTitle>FAQ 수정</PageTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-[44px] px-6 border-[#E4E4E7] text-[#18181B] font-[600] rounded-[6px] bg-white hover:bg-gray-50"
            onClick={() => {
              if (isDirty) setCancelOpen(true);
              else router.push('/faq');
            }}
          >
            취소
          </Button>
          <Button
            disabled={!isFormValid || updateMutation.isPending}
            className="font-[600] h-[44px] px-6 rounded-[6px] flex items-center gap-2 shadow-sm"
            style={
              !isFormValid
                ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
                : undefined
            }
            onClick={handleSave}
          >
            <Check className="w-4 h-4" />
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E4E4E7] shadow-sm p-6 flex flex-col gap-5">
        <div className="space-y-5">
          <h2 className="text-[16px] font-[700] text-[#18181B]">기본 정보</h2>
          <div className="w-full h-[1px] bg-[#E4E4E7]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[14px] font-[600] text-[#18181B]">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예: 이용방법"
              maxLength={50}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[44px] border-[#E4E4E7]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[14px] font-[600] text-[#18181B]">
              언어
            </label>
            <Input
              value={locale}
              readOnly
              className="h-[44px] border-[#E4E4E7] bg-gray-50 text-gray-500"
            />
            <p className="text-[11px] text-gray-400">
              언어는 등록 시 결정되며 수정할 수 없습니다.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-[600] text-[#18181B]">
            질문 (제목) <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="질문을 입력하세요"
            maxLength={500}
            className="h-[52px] text-[15px] border-[#E4E4E7] placeholder:text-[#A1A1AA] focus:ring-[#4186FF] focus:border-[#4186FF] rounded-[8px]"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-[600] text-[#18181B]">
            답변 (내용) <span className="text-red-500">*</span>
          </label>
          <div className="border border-[#E4E4E7] rounded-[8px] overflow-hidden">
            <div className="bg-[#F8F9FB] border-b border-[#E4E4E7] p-1.5 flex flex-wrap items-center gap-0.5">
              <Select onValueChange={(val) => handleCommand('formatBlock', val)}>
                <SelectTrigger className="w-[120px] h-8 bg-white border-[#E4E4E7] text-[13px] font-[500] px-3">
                  <SelectValue placeholder="Heading 1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="p">Paragraph</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-[1px] h-6 bg-[#E4E4E7] mx-1" />
              <ToolbarButton
                onClick={() => handleCommand('bold')}
                icon={<Bold className="w-4 h-4" />}
              />
              <ToolbarButton
                onClick={() => handleCommand('italic')}
                icon={<Italic className="w-4 h-4" />}
              />
              <ToolbarButton
                onClick={() => {
                  saveSelection();
                  handleCommand('createLink', prompt('URL:') || '');
                }}
                icon={<LinkIcon className="w-4 h-4" />}
              />

              <div className="w-[1px] h-6 bg-[#E4E4E7] mx-1" />
              <ToolbarButton
                onClick={() => handleCommand('insertUnorderedList')}
                icon={<List className="w-4 h-4" />}
              />
              <ToolbarButton
                onClick={() => handleCommand('insertOrderedList')}
                icon={<ListOrdered className="w-4 h-4" />}
              />

              <div className="w-[1px] h-6 bg-[#E4E4E7] mx-1" />
              <ToolbarButton
                onClick={() => handleCommand('outdent')}
                icon={<Outdent className="w-4 h-4" />}
              />
              <ToolbarButton
                onClick={() => handleCommand('indent')}
                icon={<Indent className="w-4 h-4" />}
              />

              <div className="w-[1px] h-6 bg-[#E4E4E7] mx-1" />
              <ToolbarButton
                onClick={() => {
                  saveSelection();
                  fileInputRef.current?.click();
                }}
                icon={<ImageIcon className="w-4 h-4" />}
              />
              <ToolbarButton
                onClick={() => handleCommand('formatBlock', 'blockquote')}
                icon={<Quote className="w-4 h-4" />}
              />
              <div
                onClick={() => {
                  saveSelection();
                  insertVideo();
                }}
                className="flex items-center gap-1 hover:bg-[#E4E4E7] p-1.5 rounded transition-colors cursor-pointer group"
              >
                <Video className="w-4 h-4 text-[#3F3F46]" />
                <ChevronDown className="w-3 h-3 text-[#71717A] group-hover:text-[#3F3F46]" />
              </div>

              <div className="w-[1px] h-6 bg-[#E4E4E7] mx-1" />
              <ToolbarButton
                onClick={() => handleCommand('undo')}
                icon={<Undo className="w-4 h-4" />}
              />
              <ToolbarButton
                onClick={() => handleCommand('redo')}
                icon={<Redo className="w-4 h-4" />}
              />
            </div>

            <style jsx global>{`
              .faq-editor h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
              .faq-editor h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
              .faq-editor h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
              .faq-editor p { margin-bottom: 1em; }
              .faq-editor blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #666; margin: 1em 0; }
            `}</style>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onBlur={saveSelection}
              onInput={(e) => {
                const text = (e.currentTarget.textContent ?? '').trim();
                setAnswerText(text);
                setEditorModified(true);
              }}
              className="faq-editor min-h-[400px] p-8 outline-none text-[16px] text-[#3F3F46] leading-relaxed bg-white focus:ring-0"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-[700] text-[#18181B]">활성화</label>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span className="text-[14px] text-[#71717A]">FAQ를 즉시 노출합니다</span>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="변경사항이 있습니다."
        description="취소하시겠습니까?"
        variant="double"
        confirmText="확인"
        cancelText="취소"
        confirmColor="blue"
        onConfirm={() => router.push('/faq')}
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon,
}: {
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="p-1.5 hover:bg-[#E4E4E7] rounded transition-colors text-[#3F3F46]"
    >
      {icon}
    </button>
  );
}
