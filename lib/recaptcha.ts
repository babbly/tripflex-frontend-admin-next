import { apiFetch } from './api';

interface ReCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

const isDev = process.env.NODE_ENV === 'development';

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      if (isDev) console.error('RECAPTCHA_SECRET_KEY is not set');
      return false;
    }

    const response = await apiFetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      },
    );

    const data: ReCaptchaVerifyResponse = await response.json();

    if (!data.success) {
      if (isDev) console.error('reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    if (isDev) console.error('Error verifying reCAPTCHA token:', error);
    return false;
  }
}
