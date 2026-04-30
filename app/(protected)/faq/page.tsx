'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronDown } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const dummyFAQs: FAQ[] = [
  {
    id: '1',
    question: '메뉴판을 어떻게 촬영하나요?',
    answer: '앱 메인 화면에서 카메라 아이콘을 탭하거나 갤러리에서 사진을 선택하세요. 메뉴판이 선명하게 보이도록 촬영하면 더 정확한 번역 결과를 얻을 수 있습니다. 최대 5장까지 업로드 가능합니다.',
  },
  {
    id: '2',
    question: '지원하는 언어는 어떤 것이 있나요?',
    answer: '현재 한국어, 영어, 일본어, 중국어 등 전 세계 주요 언어를 지원하고 있습니다. 지속적으로 지원 언어를 확대하고 있습니다.',
  },
  {
    id: '3',
    question: '팁 계산은 어떻게 이루어지나요?',
    answer: '메뉴 가격을 입력하면 해당 국가의 일반적인 팁 비율을 바탕으로 권장 팁 금액을 계산해 드립니다. 사용자가 직접 팁 비율을 조정할 수도 있습니다.',
  },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(dummyFAQs);

  const handleDelete = (id: string) => {
    if (confirm('이 FAQ를 삭제하시겠습니까?')) {
      setFaqs(faqs.filter((faq) => faq.id !== id));
    }
  };

  return (
    <div className="w-full flex flex-col gap-[24px]">
      <div className="flex justify-between items-center">
        <PageTitle>FAQ 관리</PageTitle>
        <Link href="/faq/create">
          <Button className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-[40px]">
            <Plus className="w-4 h-4 mr-2" />
            FAQ 추가
          </Button>
        </Link>
      </div>

      <div className="w-full">
        <Accordion 
          type="single" 
          collapsible 
          // @ts-ignore - 'none' is a valid variant in trigger but not in Accordion props type
          indicator="none"
          className="w-full space-y-4"
        >
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="group bg-white border border-[#E4E4E7] rounded-[12px] overflow-hidden shadow-sm transition-all data-[state=open]:border-[#4186FF] px-0"
            >
              {/* Custom Header with Buttons and Trigger */}
              <div className="flex items-center justify-between px-6 w-full">
                <AccordionTrigger 
                  className="flex-1 py-6 hover:no-underline text-left text-[16px] font-[600] text-[#18181B] border-none"
                >
                  {faq.question}
                </AccordionTrigger>
                
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/faq/${faq.id}`}>
                    <EditButton />
                  </Link>
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(faq.id);
                    }}
                  />
                  {/* Manually adding chevron that rotates based on state */}
                  <div className="p-2 text-[#71717A] group-data-[state=open]:rotate-180 transition-transform duration-200">
                    <ChevronDown className="size-4" />
                  </div>
                </div>
              </div>

              <AccordionContent className="px-6 pb-6 text-[14px] leading-relaxed text-[#71717A] border-t border-gray-50">
                <div className="pt-4">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
