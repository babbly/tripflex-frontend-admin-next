/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

type ReCaptchaInstance = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    config: { sitekey: string; size: string; theme: string },
  ) => number;
  reset: (id: number) => void;
  getResponse: (id: number) => string;
};

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v2-script';
const isDev = process.env.NODE_ENV === 'development';
let scriptLoadPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve) => {
    if (
      document.getElementById(RECAPTCHA_SCRIPT_ID) &&
      (window as any).grecaptcha
    ) {
      resolve();
      return;
    }

    (window as any).onRecaptchaLoaded = () => {
      resolve();
    };

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function useRecaptchaV2(siteKey: string) {
  const widgetId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isRendered = useRef(false);
  const isInitializing = useRef(false);

  const initializeRecaptcha = async () => {
    if (isInitializing.current) return;
    if (!containerRef.current || !siteKey) return;

    isInitializing.current = true;

    try {
      if (widgetId.current !== null) {
        const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
        if (grecaptcha) {
          try {
            grecaptcha.reset(widgetId.current);
          } catch (error) {
            if (isDev) console.error('Error resetting reCAPTCHA:', error);
          }
        }
        widgetId.current = null;
        isRendered.current = false;
      }

      await loadRecaptchaScript();

      const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
      if (!grecaptcha) {
        throw new Error('reCAPTCHA failed to load');
      }

      await new Promise<void>((resolve) => {
        grecaptcha.ready(() => resolve());
      });

      if (containerRef.current && !isRendered.current) {
        widgetId.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          size: 'normal',
          theme: 'light',
        });
        isRendered.current = true;
      }
    } catch (error) {
      if (isDev) console.error('Error initializing reCAPTCHA:', error);
    } finally {
      isInitializing.current = false;
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      initializeRecaptcha();
    }

    return () => {
      if (widgetId.current !== null) {
        const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
        if (grecaptcha) {
          try {
            grecaptcha.reset(widgetId.current);
          } catch (error) {
            if (isDev) console.error('Error resetting reCAPTCHA:', error);
          }
        }
        widgetId.current = null;
        isRendered.current = false;
      }
    };
  }, [siteKey]);

  const getToken = (): string => {
    const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
    if (!grecaptcha || widgetId.current === null) {
      throw new Error('reCAPTCHA not initialized');
    }
    return grecaptcha.getResponse(widgetId.current);
  };

  const resetCaptcha = () => {
    const grecaptcha = (window as any).grecaptcha as ReCaptchaInstance;
    if (!grecaptcha || widgetId.current === null) return;

    try {
      grecaptcha.reset(widgetId.current);
      widgetId.current = null;
      isRendered.current = false;
    } catch (error) {
      if (isDev) console.error('Error resetting reCAPTCHA:', error);
    }
  };

  return {
    containerRef,
    getToken,
    resetCaptcha,
    initializeRecaptcha,
  };
}
