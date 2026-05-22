'use client';

import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bold,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Indent,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Outdent,
  Plus,
  Quote,
  Redo,
  Undo,
  Video,
  X,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { faqApi } from '@/lib/faq-api';
import { FaqResponse } from '@/types/faq';
import { ApiError } from '@/types/api';
import { usePagePermission } from '@/hooks/use-page-permission';

function ToolbarButton({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="p-1.5 hover:bg-[#E4E4E7] rounded transition-colors text-[#3F3F46]"
    >
      {icon}
    </button>
  );
}

export default function FAQPage() {
  const queryClient = useQueryClient();
  const { canRead, canWrite, canDelete } = usePagePermission('/faq');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const size = parseInt(pageSize, 10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqResponse | null>(null);

  // form state
  const [question, setQuestion] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [answerText, setAnswerText] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastRange = useRef<Range | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['faqs', { page, size }],
    queryFn: () => faqApi.list({ page, size }),
  });

  const faqs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const openCreate = () => {
    setEditing(null);
    setQuestion('');
    setIsActive(true);
    setAnswerText('');
    if (editorRef.current) editorRef.current.innerHTML = '';
    lastRange.current = null;
    setShowForm(true);
  };

  const openEdit = (faq: FaqResponse) => {
    setEditing(faq);
    setQuestion(faq.question);
    setIsActive(faq.active);
    setAnswerText(faq.answer.replace(/<[^>]+>/g, '').trim());
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = faq.answer;
    }, 0);
    lastRange.current = null;
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
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
        if (lastRange.current && editorRef.current?.contains(lastRange.current.commonAncestorContainer)) {
          lastRange.current.deleteContents();
          lastRange.current.insertNode(img);
          const br = document.createElement('br');
          img.after(br);
          const newRange = document.createRange();
          newRange.setStartAfter(br);
          newRange.setEndAfter(br);
          const sel = window.getSelection();
          if (sel) { sel.removeAllRanges(); sel.addRange(newRange); lastRange.current = newRange; }
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
    const url = prompt('YouTube 영상 URL을 입력하세요', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
    if (url) {
      const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
      const videoHTML = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:10px 0;"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
      handleCommand('insertHTML', videoHTML);
    }
  };

  const isFormValid = question.trim().length > 0 && answerText.trim().length > 0;

  const createMutation = useMutation({
    mutationFn: () => faqApi.create({ question: question.trim(), answer: editorRef.current?.innerHTML ?? '', active: isActive }),
    onSuccess: () => {
      toast.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      closeForm();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: () => faqApi.update(editing!.id, { question: question.trim(), answer: editorRef.current?.innerHTML ?? '', active: isActive, displayOrder: editing?.displayOrder }),
    onSuccess: () => {
      toast.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      closeForm();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다. 다시 시도해주세요.'),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!canRead) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-[15px] text-gray-400">
        접근 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="flex-1 flex flex-col gap-[24px] min-w-0">
        <div className="flex justify-between items-center">
          <PageTitle>FAQ 관리</PageTitle>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-gray-500">페이지당</span>
            <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(0); }}>
              <SelectTrigger className="w-[80px] h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            {canWrite && !showForm && (
              <Button onClick={openCreate} className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[40px]">
                <Plus className="w-4 h-4 mr-2" />
                FAQ 추가
              </Button>
            )}
          </div>
        </div>

        <div className="w-full">
          {isLoading && (
            <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-8 text-center text-sm text-gray-500">불러오는 중...</div>
          )}
          {isError && !isLoading && (
            <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-8 text-center text-sm text-red-500">
              {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
            </div>
          )}
          {!isLoading && !isError && faqs.length === 0 && (
            <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-8 text-center text-sm text-gray-500">등록된 FAQ가 없습니다.</div>
          )}
          {!isLoading && !isError && faqs.length > 0 && (
            <Accordion type="single" collapsible
              // @ts-ignore
              indicator="none"
              className="w-full space-y-4"
            >
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="group bg-white border border-[#E4E4E7] rounded-[12px] overflow-hidden shadow-sm transition-all px-0">
                  <div className="relative">
                    <AccordionTrigger className="flex items-center justify-between px-6 py-5 hover:no-underline text-left text-[16px] font-[700] text-[#18181B] border-none w-full">
                      <div className="flex items-center gap-3 flex-1 pr-24 min-w-0">
                        {!faq.active && (
                          <span className="shrink-0 inline-flex items-center text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">비활성</span>
                        )}
                        <span className="truncate">{faq.question}</span>
                      </div>
                      <div className="p-2 text-[#A1A1AA] group-data-[state=open]:rotate-180 transition-transform duration-200">
                        <ChevronDown className="size-5" />
                      </div>
                    </AccordionTrigger>
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                      {canWrite && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(faq); }} className="block">
                          <EditButton />
                        </button>
                      )}
                      {canDelete && (
                        <DeleteButton onClick={(e) => { e.stopPropagation(); setDeleteTarget(faq); }} />
                      )}
                    </div>
                  </div>
                  <AccordionContent className="px-8 pb-8 text-[14px] leading-relaxed text-[#71717A] border-t border-[#E4E4E7]">
                    <div className="pt-5 faq-answer max-w-[360px]" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {totalPages > 0 && (
          <div className="flex justify-end items-center space-x-1">
            <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <Button key={p} variant={p === page ? 'primary' : 'outline'} size="icon"
                className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setPage(p)}
              >{p + 1}</Button>
            ))}
            <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 슬라이드 패널 */}
      <div className={`transition-all duration-300 overflow-hidden shrink-0 ${showForm ? 'w-[420px]' : 'w-0'}`}>
        <div className="w-[420px]">
          <Card className="p-6 border-gray-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[18px] text-gray-900">{editing ? 'FAQ 수정' : 'FAQ 추가'}</h3>
              <button type="button" onClick={closeForm} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[1px] bg-gray-100 w-full" />

            <div className="space-y-2">
              <label className="text-[14px] font-[600] text-[#18181B]">질문 (제목) <span className="text-red-500">*</span></label>
              <Input
                placeholder="질문을 입력하세요"
                maxLength={500}
                className="h-[44px] text-[14px] border-[#E4E4E7] placeholder:text-[#A1A1AA] rounded-[8px]"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-[600] text-[#18181B]">답변 (내용) <span className="text-red-500">*</span></label>
              <div className="border border-[#E4E4E7] rounded-[8px] overflow-hidden">
                <div className="bg-[#F8F9FB] border-b border-[#E4E4E7] p-1.5 flex flex-wrap items-center gap-0.5">
                  <Select onValueChange={(val) => handleCommand('formatBlock', val)}>
                    <SelectTrigger className="w-[100px] h-7 bg-white border-[#E4E4E7] text-[12px] font-[500] px-2">
                      <SelectValue placeholder="Heading 1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1">Heading 1</SelectItem>
                      <SelectItem value="h2">Heading 2</SelectItem>
                      <SelectItem value="h3">Heading 3</SelectItem>
                      <SelectItem value="p">Paragraph</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-[1px] h-5 bg-[#E4E4E7] mx-1" />
                  <ToolbarButton onClick={() => handleCommand('bold')} icon={<Bold className="w-3.5 h-3.5" />} />
                  <ToolbarButton onClick={() => handleCommand('italic')} icon={<Italic className="w-3.5 h-3.5" />} />
                  <ToolbarButton onClick={() => { saveSelection(); handleCommand('createLink', prompt('URL:') || ''); }} icon={<LinkIcon className="w-3.5 h-3.5" />} />
                  <div className="w-[1px] h-5 bg-[#E4E4E7] mx-1" />
                  <ToolbarButton onClick={() => handleCommand('insertUnorderedList')} icon={<List className="w-3.5 h-3.5" />} />
                  <ToolbarButton onClick={() => handleCommand('insertOrderedList')} icon={<ListOrdered className="w-3.5 h-3.5" />} />
                  <div className="w-[1px] h-5 bg-[#E4E4E7] mx-1" />
                  <ToolbarButton onClick={() => handleCommand('outdent')} icon={<Outdent className="w-3.5 h-3.5" />} />
                  <ToolbarButton onClick={() => handleCommand('indent')} icon={<Indent className="w-3.5 h-3.5" />} />
                  <div className="w-[1px] h-5 bg-[#E4E4E7] mx-1" />
                  <ToolbarButton onClick={() => { saveSelection(); fileInputRef.current?.click(); }} icon={<ImageIcon className="w-3.5 h-3.5" />} />
                  <ToolbarButton onClick={() => handleCommand('formatBlock', 'blockquote')} icon={<Quote className="w-3.5 h-3.5" />} />
                  <div onClick={() => { saveSelection(); insertVideo(); }} className="flex items-center gap-0.5 hover:bg-[#E4E4E7] p-1.5 rounded transition-colors cursor-pointer group">
                    <Video className="w-3.5 h-3.5 text-[#3F3F46]" />
                    <ChevronDown className="w-3 h-3 text-[#71717A]" />
                  </div>
                  <div className="w-[1px] h-5 bg-[#E4E4E7] mx-1" />
                  <ToolbarButton onClick={() => handleCommand('undo')} icon={<Undo className="w-3.5 h-3.5" />} />
                  <ToolbarButton onClick={() => handleCommand('redo')} icon={<Redo className="w-3.5 h-3.5" />} />
                </div>
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
                  }}
                  className="faq-editor min-h-[300px] px-6 py-4 outline-none text-[14px] text-[#3F3F46] leading-relaxed bg-white focus:ring-0"
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

            <div className="flex flex-col gap-3 mt-2">
              <Button
                disabled={!isFormValid || isSaving}
                className="w-full h-11 font-bold bg-[#4186FF] hover:bg-blue-600 text-white disabled:hover:bg-[#E4E4E7]"
                style={!isFormValid || isSaving ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' } : undefined}
                onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
              <Button variant="outline" className="w-full h-11 border-gray-200 text-gray-700 font-bold hover:bg-gray-50" onClick={closeForm}>
                취소
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="FAQ를 삭제하시겠어요?"
        description="삭제 후에는 복구할 수 없습니다."
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
        }}
      />

      <style jsx global>{`
        .faq-answer h1, .faq-editor h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
        .faq-answer h2, .faq-editor h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
        .faq-answer h3, .faq-editor h3 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; }
        .faq-answer p, .faq-editor p { margin-bottom: 1em; }
        .faq-answer blockquote, .faq-editor blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #666; margin: 1em 0; }
        .faq-answer img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  );
}
