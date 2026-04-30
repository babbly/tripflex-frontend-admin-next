'use client';

import React, { useState } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ChevronLeft, ChevronRight, Upload, Search } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AdminTableHeaderRow, AdminTableHead } from '@/components/ui/admin-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Country {
  id: string;
  name: string;
  nameEn: string;
  isoCode: string;
  flagUrl: string;
}

interface Language {
  id: string;
  name: string;
  nameEn: string;
  code: string;
}

interface Currency {
  id: string;
  name: string;
  symbol: string;
  code: string;
  countries?: string[]; // Array of country IDs
}

const dummyCountries: Country[] = [
  { id: '1', name: '미국', nameEn: 'USA', isoCode: 'US', flagUrl: 'https://flagcdn.com/w80/us.png' },
  { id: '2', name: '그리스', nameEn: 'Greece', isoCode: 'GR', flagUrl: 'https://flagcdn.com/w80/gr.png' },
  { id: '3', name: '네덜란드', nameEn: 'Netherlands', isoCode: 'NL', flagUrl: 'https://flagcdn.com/w80/nl.png' },
  { id: '4', name: '뉴질랜드', nameEn: 'New Zealand', isoCode: 'NZ', flagUrl: 'https://flagcdn.com/w80/nz.png' },
  { id: '5', name: '대만', nameEn: 'Taiwan', isoCode: 'TW', flagUrl: 'https://flagcdn.com/w80/tw.png' },
  { id: '6', name: '한국', nameEn: 'Korea', isoCode: 'KR', flagUrl: 'https://flagcdn.com/w80/kr.png' },
  { id: '7', name: '독일', nameEn: 'Germany', isoCode: 'DE', flagUrl: 'https://flagcdn.com/w80/de.png' },
  { id: '8', name: '룩셈부르크', nameEn: 'Luxembourg', isoCode: 'LU', flagUrl: 'https://flagcdn.com/w80/lu.png' },
  { id: '9', name: '말레이시아', nameEn: 'Malaysia', isoCode: 'MY', flagUrl: 'https://flagcdn.com/w80/my.png' },
  { id: '10', name: '모나코', nameEn: 'Monaco', isoCode: 'MC', flagUrl: 'https://flagcdn.com/w80/mc.png' },
  { id: '11', name: '일본', nameEn: 'Japan', isoCode: 'JP', flagUrl: 'https://flagcdn.com/w80/jp.png' },
  { id: '12', name: '프랑스', nameEn: 'France', isoCode: 'FR', flagUrl: 'https://flagcdn.com/w80/fr.png' },
];

const dummyLanguages: Language[] = [
  { id: '1', name: '한국어', nameEn: 'Korean', code: 'ko' },
  { id: '2', name: '영어', nameEn: 'English', code: 'en' },
  { id: '3', name: '일본어', nameEn: 'Japanese', code: 'ja' },
  { id: '4', name: '중국어(간체)', nameEn: 'Chinese (Simplified)', code: 'zh-CN' },
  { id: '5', name: '중국어(번체)', nameEn: 'Chinese (Traditional)', code: 'zh-TW' },
  { id: '6', name: '프랑스어', nameEn: 'French', code: 'fr' },
  { id: '7', name: '독일어', nameEn: 'German', code: 'de' },
  { id: '8', name: '스페인어', nameEn: 'Spanish', code: 'es' },
];

const dummyCurrencies: Currency[] = [
  { id: '1', name: '원', symbol: '₩', code: 'KRW', countries: ['6'] },
  { id: '2', name: '달러', symbol: '$', code: 'USD', countries: ['1'] },
  { id: '3', name: '엔', symbol: '¥', code: 'JPY', countries: ['11'] },
  { id: '4', name: '유로', symbol: '€', code: 'EUR', countries: ['2', '7', '12'] },
  { id: '5', name: '파운드', symbol: '£', code: 'GBP', countries: [] },
  { id: '6', name: '위안', symbol: '¥', code: 'CNY', countries: [] },
  { id: '7', name: '대만 달러', symbol: 'NT$', code: 'TWD', countries: ['5'] },
];

export default function CountryManagementPage() {
  const [activeTab, setActiveTab] = useState('country');
  
  // Country State
  const [countries, setCountries] = useState<Country[]>(dummyCountries);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isEditingCountry, setIsEditingCountry] = useState(false);
  
  // Language State
  const [languages, setLanguages] = useState<Language[]>(dummyLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);

  // Currency State
  const [currencies, setCurrencies] = useState<Currency[]>(dummyCurrencies);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [selectedCountriesForCurrency, setSelectedCountriesForCurrency] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'country' | 'language' | 'currency' } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');
  const itemsPerPage = parseInt(pageSize);

  const currentCountries = countries.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalCountryPages = Math.max(1, Math.ceil(countries.length / itemsPerPage));

  const currentLanguages = languages.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalLanguagePages = Math.max(1, Math.ceil(languages.length / itemsPerPage));

  const currentCurrencies = currencies.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalCurrencyPages = Math.max(1, Math.ceil(currencies.length / itemsPerPage));

  const handleEditCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsEditingCountry(true);
  };

  const handleEditLanguage = (language: Language) => {
    setSelectedLanguage(language);
    setIsEditingLanguage(true);
  };

  const handleEditCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setSelectedCountriesForCurrency(currency.countries || []);
    setIsEditingCurrency(true);
  };

  const handleDeleteClick = (id: string, type: 'country' | 'language' | 'currency') => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'country') {
        setCountries((prev) => prev.filter((c) => c.id !== itemToDelete.id));
        if (selectedCountry?.id === itemToDelete.id) {
          setSelectedCountry(null);
          setIsEditingCountry(false);
        }
      } else if (itemToDelete.type === 'language') {
        setLanguages((prev) => prev.filter((l) => l.id !== itemToDelete.id));
        if (selectedLanguage?.id === itemToDelete.id) {
          setSelectedLanguage(null);
          setIsEditingLanguage(false);
        }
      } else {
        setCurrencies((prev) => prev.filter((c) => c.id !== itemToDelete.id));
        if (selectedCurrency?.id === itemToDelete.id) {
          setSelectedCurrency(null);
          setIsEditingCurrency(false);
        }
      }
      setItemToDelete(null);
    }
  };

  const handleAddCountry = () => {
    setSelectedCountry(null);
    setIsEditingCountry(true);
  };

  const handleAddLanguage = () => {
    setSelectedLanguage(null);
    setIsEditingLanguage(true);
  };

  const handleAddCurrency = () => {
    setSelectedCurrency(null);
    setSelectedCountriesForCurrency([]);
    setIsEditingCurrency(true);
  };

  const tabLabels: { [key: string]: string } = {
    country: '국가관리',
    language: '언어관리',
    currency: '통화관리',
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <PageTitle>국가 관리 - {tabLabels[activeTab]}</PageTitle>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPage(1); }} className="w-full">
        <TabsList variant="line" size="lg" className="mb-6">
          <TabsTrigger value="country" variant="line">국가관리</TabsTrigger>
          <TabsTrigger value="language" variant="line">언어관리</TabsTrigger>
          <TabsTrigger value="currency" variant="line">통화관리</TabsTrigger>
        </TabsList>

        <TabsContent value="country" className="mt-0">
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-end">
                <Button onClick={handleAddCountry} className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold h-10 px-4"><Plus className="w-4 h-4 mr-2" />국가 추가</Button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
                  <span className="text-[13px] text-gray-500">페이지당</span>
                  <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(1); }}>
                    <SelectTrigger className="w-[80px] h-10 text-sm border-gray-200">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead><AdminTableHeaderRow><AdminTableHead className="px-6 py-4 w-[80%]">국가명</AdminTableHead><AdminTableHead className="px-6 py-4 text-center">관리</AdminTableHead></AdminTableHeaderRow></thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentCountries.map((country) => (
                      <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><img src={country.flagUrl} alt={country.name} className="w-6 h-4 object-cover rounded-sm shadow-sm" /><span className="text-[14px] font-medium text-gray-900">{country.name}</span></div></td>
                        <td className="px-6 py-4"><div className="flex items-center justify-center gap-2"><EditButton onClick={() => handleEditCountry(country)} /><DeleteButton onClick={() => handleDeleteClick(country.id, 'country')} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end p-4 items-center gap-1 bg-white border-t border-gray-100">
                  <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                  {Array.from({ length: totalCountryPages }, (_, i) => i + 1).map((p) => (<Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`} onClick={() => setPage(p)}>{p}</Button>))}
                  <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.min(totalCountryPages, p + 1))} disabled={page === totalCountryPages}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            {isEditingCountry && (
              <div className="w-[360px] flex flex-col gap-4 shrink-0">
                <Card className="p-6 border-gray-200 shadow-sm flex flex-col gap-6">
                  <h3 className="font-bold text-[18px] text-gray-900">{selectedCountry ? '국가 편집' : '국가 추가'}</h3>
                  <div className="h-[1px] bg-gray-100 w-full" />
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">국가명 (ex. 대한민국)</label><Input placeholder="국가명을 입력해주세요" defaultValue={selectedCountry?.name || ''} className="border-gray-200 h-11" /></div>
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">국가명 영문 (ex. Korea)</label><Input placeholder="English Name" defaultValue={selectedCountry?.nameEn || ''} className="border-gray-200 h-11" /></div>
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">ISO 국가코드 (ex. KR)</label><Input placeholder="ISO Code" defaultValue={selectedCountry?.isoCode || ''} className="border-gray-200 h-11" /></div>
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">국가 이미지</label><div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"><div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4186FF]"><Upload className="w-5 h-5" /></div><div className="text-center"><p className="text-[13px] font-semibold text-gray-900">이미지를 드래그하거나 클릭하여 업로드</p><p className="text-[12px] text-gray-500 mt-1">PNG, JPG, GIF (최대 5MB)</p></div></div><Button variant="outline" className="w-full mt-2 border-gray-200 h-11 text-gray-700 font-semibold"><Upload className="w-4 h-4 mr-2" />파일 선택</Button></div>
                  </div>
                  <div className="flex flex-col gap-3 mt-4"><Button className="w-full bg-[#4186FF] hover:bg-blue-600 text-white h-11 font-bold">저장</Button><Button variant="outline" className="w-full border-gray-200 h-11 text-gray-700 font-bold hover:bg-gray-50" onClick={() => setIsEditingCountry(false)}>취소</Button></div>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="language" className="mt-0">
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-end">
                <Button onClick={handleAddLanguage} className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold h-10 px-4"><Plus className="w-4 h-4 mr-2" />언어 추가</Button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
                  <span className="text-[13px] text-gray-500">페이지당</span>
                  <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(1); }}>
                    <SelectTrigger className="w-[80px] h-10 text-sm border-gray-200">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead><AdminTableHeaderRow><AdminTableHead className="px-6 py-4 w-[80%]">언어명</AdminTableHead><AdminTableHead className="px-6 py-4 text-center">관리</AdminTableHead></AdminTableHeaderRow></thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentLanguages.map((lang) => (
                      <tr key={lang.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><span className="text-[14px] font-medium text-gray-900">{lang.name}</span></td>
                        <td className="px-6 py-4"><div className="flex items-center justify-center gap-2"><EditButton onClick={() => handleEditLanguage(lang)} /><DeleteButton onClick={() => handleDeleteClick(lang.id, 'language')} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end p-4 items-center gap-1 bg-white border-t border-gray-100">
                  <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                  {Array.from({ length: totalLanguagePages }, (_, i) => i + 1).map((p) => (<Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`} onClick={() => setPage(p)}>{p}</Button>))}
                  <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.min(totalLanguagePages, p + 1))} disabled={page === totalLanguagePages}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            {isEditingLanguage && (
              <div className="w-[360px] flex flex-col gap-4 shrink-0">
                <Card className="p-6 border-gray-200 shadow-sm flex flex-col gap-6">
                  <h3 className="font-bold text-[18px] text-gray-900">{selectedLanguage ? '언어 편집' : '언어 추가'}</h3>
                  <div className="h-[1px] bg-gray-100 w-full" />
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">언어명 (ex. 한국어)</label><Input placeholder="언어명을 입력해주세요" defaultValue={selectedLanguage?.name || ''} className="border-gray-200 h-11" /></div>
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">언어명 영문 (ex. Korean)</label><Input placeholder="English Name" defaultValue={selectedLanguage?.nameEn || ''} className="border-gray-200 h-11" /></div>
                    <div className="flex flex-col gap-2"><label className="text-[14px] font-semibold text-gray-900">언어코드 (ex. ko)</label><Input placeholder="Language Code" defaultValue={selectedLanguage?.code || ''} className="border-gray-200 h-11" /></div>
                  </div>
                  <div className="flex flex-col gap-3 mt-4"><Button className="w-full bg-[#4186FF] hover:bg-blue-600 text-white h-11 font-bold">저장</Button><Button variant="outline" className="w-full border-gray-200 h-11 text-gray-700 font-bold hover:bg-gray-50" onClick={() => setIsEditingLanguage(false)}>취소</Button></div>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="currency" className="mt-0">
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-end">
                <Button onClick={handleAddCurrency} className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold h-10 px-4"><Plus className="w-4 h-4 mr-2" />통화 추가</Button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
                  <span className="text-[13px] text-gray-500">페이지당</span>
                  <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(1); }}>
                    <SelectTrigger className="w-[80px] h-10 text-sm border-gray-200">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead><AdminTableHeaderRow><AdminTableHead className="px-6 py-4 w-[80%]">통화명</AdminTableHead><AdminTableHead className="px-6 py-4 text-center">관리</AdminTableHead></AdminTableHeaderRow></thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentCurrencies.map((curr) => (
                      <tr key={curr.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="text-[14px] font-medium text-gray-900">{curr.name} ({curr.symbol})</span><span className="text-[12px] text-gray-400">{curr.code}</span></div></td>
                        <td className="px-6 py-4"><div className="flex items-center justify-center gap-2"><EditButton onClick={() => handleEditCurrency(curr)} /><DeleteButton onClick={() => handleDeleteClick(curr.id, 'currency')} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end p-4 items-center gap-1 bg-white border-t border-gray-100">
                  <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                  {Array.from({ length: totalCurrencyPages }, (_, i) => i + 1).map((p) => (<Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className={`w-8 h-8 p-0 ${p === page ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`} onClick={() => setPage(p)}>{p}</Button>))}
                  <Button variant="outline" size="icon" className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50" onClick={() => setPage((p) => Math.min(totalCurrencyPages, p + 1))} disabled={page === totalCurrencyPages}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            {isEditingCurrency && (
              <div className="w-[360px] flex flex-col gap-4 shrink-0">
                <Card className="p-6 border-gray-200 shadow-sm flex flex-col gap-6">
                  <h3 className="font-bold text-[18px] text-gray-900">{selectedCurrency ? '통화 편집' : '통화 추가'}</h3>
                  <div className="h-[1px] bg-gray-100 w-full" />
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-semibold text-gray-900">통화명 (ex. 원)</label>
                      <Input placeholder="통화명을 입력해주세요" defaultValue={selectedCurrency?.name || ''} className="border-gray-200 h-11" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-semibold text-gray-900">통화기호 (ex. ₩)</label>
                      <Input placeholder="통화기호를 입력해주세요" defaultValue={selectedCurrency?.symbol || ''} className="border-gray-200 h-11" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-semibold text-gray-900">통화코드 (ex. KRW)</label>
                      <Input placeholder="통화코드를 입력해주세요" defaultValue={selectedCurrency?.code || ''} className="border-gray-200 h-11" />
                    </div>
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[14px] font-semibold text-gray-900">국가 선택 (다중선택)</label>
                      <div 
                        className="min-h-11 p-2 border border-gray-200 rounded-md flex flex-wrap gap-2 items-center bg-white cursor-pointer"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      >
                        {selectedCountriesForCurrency.map(countryId => {
                          const country = countries.find(c => c.id === countryId);
                          return (
                            <div key={countryId} className="flex items-center gap-1 bg-[#E8F0FF] text-[#4186FF] px-2 py-1 rounded-md text-[13px] font-medium">
                              {country?.name}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCountriesForCurrency(prev => prev.filter(id => id !== countryId));
                                }}
                                className="hover:text-blue-700"
                              >
                                <Plus className="w-3 h-3 rotate-45" />
                              </button>
                            </div>
                          );
                        })}
                        <input 
                          type="text"
                          className="flex-1 outline-none text-[14px] min-w-[60px]"
                          placeholder={selectedCountriesForCurrency.length === 0 ? "국가를 선택해주세요" : ""}
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setIsCountryDropdownOpen(true);
                          }}
                        />
                      </div>
                      
                      {isCountryDropdownOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto">
                          {countries
                            .filter(c => c.name.includes(countrySearch) && !selectedCountriesForCurrency.includes(c.id))
                            .map(country => (
                              <div 
                                key={country.id} 
                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-[14px]"
                                onClick={() => {
                                  setSelectedCountriesForCurrency(prev => [...prev, country.id]);
                                  setCountrySearch('');
                                  setIsCountryDropdownOpen(false);
                                }}
                              >
                                {country.name}
                              </div>
                            ))}
                          {countries.filter(c => c.name.includes(countrySearch) && !selectedCountriesForCurrency.includes(c.id)).length === 0 && (
                            <div className="px-4 py-2 text-gray-400 text-[13px]">검색 결과가 없습니다.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button className="w-full bg-[#4186FF] hover:bg-blue-600 text-white h-11 font-bold">저장</Button>
                    <Button variant="outline" className="w-full border-gray-200 h-11 text-gray-700 font-bold hover:bg-gray-50" onClick={() => setIsEditingCurrency(false)}>취소</Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`${itemToDelete?.type === 'country' ? '국가' : itemToDelete?.type === 'language' ? '언어' : '통화'}를 삭제하시겠어요?`}
        description={`삭제 시 해당 ${itemToDelete?.type === 'country' ? '국가' : itemToDelete?.type === 'language' ? '언어' : '통화'}의 정보가 모두 제거됩니다.`}
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
