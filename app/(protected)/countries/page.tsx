'use client';

// 국가 관리 — 국가/언어/통화 3탭 래퍼.
// 각 탭이 자체 데이터/뮤테이션을 가진다 (CountryTab/LanguageTab/CurrencyTab).

import { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CountryTab from './CountryTab';
import LanguageTab from './LanguageTab';
import CurrencyTab from './CurrencyTab';

const TAB_LABELS: Record<string, string> = {
  country: '국가관리',
  language: '언어관리',
  currency: '통화관리',
};

export default function CountryManagementPage() {
  const [activeTab, setActiveTab] = useState<'country' | 'language' | 'currency'>('country');

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <PageTitle>국가 관리 - {TAB_LABELS[activeTab]}</PageTitle>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="w-full"
      >
        <TabsList variant="line" size="lg" className="mb-6">
          <TabsTrigger value="country">
            국가관리
          </TabsTrigger>
          <TabsTrigger value="language">
            언어관리
          </TabsTrigger>
          <TabsTrigger value="currency">
            통화관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="country" className="mt-0">
          <CountryTab />
        </TabsContent>
        <TabsContent value="language" className="mt-0">
          <LanguageTab />
        </TabsContent>
        <TabsContent value="currency" className="mt-0">
          <CurrencyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
