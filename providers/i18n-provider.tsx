'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import { I18N_LANGUAGES } from '@/i18n/config';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/i18n/messages/en.json';
import arTranslations from '@/i18n/messages/ar.json';
import esTranslations from '@/i18n/messages/es.json';
import deTranslations from '@/i18n/messages/de.json';
import chTranslations from '@/i18n/messages/ch.json';

interface I18nProviderProps {
  children: ReactNode;
}

function I18nProvider({ children }: I18nProviderProps) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    if (!i18n.isInitialized) {
      const resources = {
        en: { translation: enTranslations },
        ar: { translation: arTranslations },
        es: { translation: esTranslations },
        de: { translation: deTranslations },
        ch: { translation: chTranslations },
      };

      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: 'en',
          debug: process.env.NODE_ENV === 'development',

          interpolation: {
            escapeValue: false, // React already does escaping
          },

          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'language',
          },

          react: {
            useSuspense: false, // Important for Next.js SSR
          },
        })
        .then(() => {
          setIsI18nInitialized(true);
        });
    } else {
      setIsI18nInitialized(true);
    }

    const handleLanguageChange = (lng: string) => {
      const language = I18N_LANGUAGES.find((lang) => lang.code === lng);
      if (language?.direction) {
        document.documentElement.setAttribute('dir', language.direction);
      }
    };

    if (i18n.language) {
      handleLanguageChange(i18n.language);
    }

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const currentLanguage = I18N_LANGUAGES.find((lang) => lang.code === (i18n.language || 'en')) || I18N_LANGUAGES[0];

  if (!isI18nInitialized) {
    return (
      <RadixDirectionProvider dir="ltr">
        {children}
      </RadixDirectionProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <RadixDirectionProvider dir={currentLanguage.direction}>
        {children}
      </RadixDirectionProvider>
    </I18nextProvider>
  );
}

const useLanguage = () => {
  const currentLanguage = I18N_LANGUAGES.find((lang) => lang.code === i18n.language) || I18N_LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return {
    languageCode: i18n.language,
    language: currentLanguage,
    changeLanguage,
  };
};

export { I18nProvider, useLanguage };
