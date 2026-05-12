'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/providers/admin-auth-provider';
import { ApiError } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // mustChangePassword 분기는 디자인 확정 후 재도입. 지금은 일괄 배너로 진입.
      // const { mustChangePassword } = await login(loginId, password);
      // if (mustChangePassword) {
      //   router.replace('/change-password');
      // } else {
      //   router.replace('/banner');
      // }
      await login(loginId, password);
      router.replace('/banner');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 좌측 패널 - 네이비 배경 + 로고 */}
      <div style={styles.leftPanel}>
        <div style={styles.logoWrapper}>
          <img src="/logo.png" alt="tripflex" style={{ height: '40px', width: 'auto' }} />
        </div>
      </div>

      {/* 우측 패널 - 로그인 폼 */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h1 style={styles.title}>어드민 로그인</h1>

          <form onSubmit={handleLogin} style={styles.form}>
            {/* 로그인 ID */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>아이디</label>
              <div style={styles.inputWrapper}>
                <svg
                  style={styles.inputIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="z-10"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                </svg>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="admin"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="pl-10 h-11 border-gray-200 bg-white text-gray-900"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>비밀번호</label>
              <div style={styles.inputWrapper}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-4 pr-11 h-11 border-gray-200 bg-white text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  className="z-10"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={styles.eyeIcon}>
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={styles.eyeIcon}>
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              id="login-submit-btn"
              type="submit"
              style={{
                ...styles.loginButton,
                opacity: isLoading ? 0.8 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  leftPanel: {
    width: '50%',
    backgroundColor: '#1a2744',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#4dd9c0',
    letterSpacing: '-0.5px',
    fontFamily: "'Inter', sans-serif",
  },
  rightPanel: {
    width: '50%',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '28px',
    margin: '0 0 28px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    width: '16px',
    height: '16px',
    color: '#9ca3af',
    pointerEvents: 'none',
    flexShrink: 0,
  },
  input: {
    width: '100%',
    padding: '10px 16px 10px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    color: '#9ca3af',
  },
  eyeIcon: {
    width: '18px',
    height: '18px',
  },
  loginButton: {
    width: '100%',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a8af4',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '4px',
    transition: 'background-color 0.2s',
  },
};
