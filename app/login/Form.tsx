'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Turnstile, { useTurnstile } from 'react-turnstile';
import { isAuthenticated } from '@/lib/auth';
import type { LoginResponse, StrapiError } from '@/types/auth';
import './form.css';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstile = useTurnstile();

  // 'login' = 登录模式, 'reset' = 重置密码模式
  const [view, setView] = useState<'login' | 'reset'>('login');

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // 新增：用于显示邮件发送成功
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 1. 检查登录状态
  useEffect(() => {
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const redirect = searchParams.get('redirect') ||
                       (user.person ? `/resume/${user.person}` : '/members');
      window.location.href = redirect;
    } else {
      setIsCheckingAuth(false);
    }
  }, [searchParams]);

  // 2. 切换模式时清理状态
  const switchView = (newView: 'login' | 'reset') => {
    setView(newView);
    setErrorMessage('');
    setSuccessMessage('');
    setStatus('idle');
    // 如果需要，可以在这里重置 Turnstile
    if (turnstile) turnstile.reset();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 3. 统一提交处理
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!token) {
      setErrorMessage('请完成人机验证');
      return;
    }

    setStatus('loading');

    try {
      if (view === 'login') {
        // --- 登录逻辑 ---
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: formData.identifier,
            password: formData.password,
            captchaToken: token,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          const loginData = data as LoginResponse;
          localStorage.setItem('token', loginData.jwt);
          localStorage.setItem('user', JSON.stringify(loginData.user));

          const redirect = searchParams.get('redirect') ||
                           (loginData.user.person ? `/students/${loginData.user.person}` : '/');
          window.location.href = redirect;
        } else {
          throw new Error(data.error?.message || '登录失败，请检查用户名和密码');
        }

      } else {
        // --- 重置密码逻辑 (Strapi 默认接口) ---
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.identifier, // Strapi 重置密码通常需要 email 字段
            captchaToken: token,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setSuccessMessage('重置链接已发送！请检查您的邮箱。');
          setFormData({ ...formData, password: '' }); // 清空密码以防万一
        } else {
          throw new Error(data.error?.message || '发送失败，请检查邮箱是否正确');
        }
      }

    } catch (err: any) {
      if (turnstile) turnstile.reset();
      setToken('');
      setStatus('error');
      setErrorMessage(err.message || '网络连接错误，请稍后重试');
    } finally {
      // 如果是重置密码成功，保持 success 状态以显示绿字，否则恢复 idle
      if (view === 'reset' && status === 'success') {
         // do nothing, keep showing success message
      } else if (status !== 'success') {
        setStatus('idle');
      }
    }
  };

  if (isCheckingAuth) return null;

  return (
    <div className="login-page-container">
      {/* --- 左侧：表单区域 --- */}
      <div className="login-form-section">
        <div className="form-wrapper">
          <h1 className="form-title">
            {view === 'login' ? '登录' : '重置密码'}
          </h1>

          {/* 顶部 Tabs：现在用于切换 登录/重置 */}
          <div className="form-tabs">
            <div 
              className={`tab-item ${view === 'login' ? 'active' : ''}`}
              onClick={() => switchView('login')}
            >
              Login
            </div>
            <div 
              className={`tab-item ${view === 'reset' ? 'active' : ''}`}
              onClick={() => switchView('reset')}
            >
              Forgot Password
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* 邮箱/用户名输入框 (两个模式都共用) */}
            <div className="input-group">
              <input
                id="identifier"
                type="text"
                className="styled-input"
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={status === 'loading' || (view === 'reset' && status === 'success')}
                placeholder={view === 'login' ? "邮箱或用户名" : "邮箱"}
                autoComplete="username"
              />
            </div>

            {/* 密码输入框 (仅在登录模式显示) */}
            {view === 'login' && (
              <div className="input-group">
                <input
                  id="password"
                  type="password"
                  className="styled-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={status === 'loading'}
                  placeholder="密码"
                  autoComplete="current-password"
                />
                <EyeIcon className="password-toggle-icon" />
              </div>
            )}

            {/* 辅助选项 (仅在登录模式显示) */}
            {view === 'login' && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>
                {/* 点击这个小链接也会切换到 reset 模式 */}
                <span 
                  className="forgot-password-link" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => switchView('reset')}
                >
                  Forgot Password?
                </span>
              </div>
            )}

            {/* 验证码 (两个模式都共用) */}
            <div className="captcha-container">
              {TURNSTILE_SITE_KEY && (
                <Turnstile
                  sitekey={TURNSTILE_SITE_KEY}
                  onVerify={(token) => {
                    setToken(token);
                    setErrorMessage('');
                  }}
                  onError={() => setErrorMessage('验证服务连接失败')}
                  onExpire={() => setToken('')}
                  theme="light"
                />
              )}
            </div>

            {/* 错误信息 */}
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            {/* 成功信息 (仅重置密码模式) */}
            {successMessage && view === 'reset' && (
              <div className="success-message" style={{ color: 'var(--primary-cyan)', textAlign: 'center', fontWeight: 500 }}>
                {successMessage}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={status === 'loading' || !token || (view === 'reset' && status === 'success')}
              className="cyan-button"
            >
              {status === 'loading' ? (
                <span className="loading-spinner"></span>
              ) : (
                view === 'login' ? 'LOGIN' : 'SEND RESET LINK'
              )}
            </button>
            
            {/* 重置密码模式下，提供返回登录的链接 */}
            {view === 'reset' && (
               <div style={{ textAlign: 'center', marginTop: '10px' }}>
                 <span 
                    style={{ color: '#999', fontSize: '14px', cursor: 'pointer' }}
                    onClick={() => switchView('login')}
                 >
                   返回登录
                 </span>
               </div>
            )}
          </form>
        </div>
      </div>

      {/* --- 右侧：插画区域 --- */}
      <div className="login-illustration-section">
        <div className="illustration-container">
          <LockIllustration />
        </div>
      </div>
    </div>
  );
}

// --- 底部提取的图标组件 ---

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const LockIllustration = () => (
  <svg
    width="100%"
    height="auto"
    viewBox="0 0 240 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ maxWidth: '420px', display: 'block', margin: '0 auto' }}
  >
    <path
      d="M60 110 V 70 C 60 36.86 86.86 10 120 10 C 153.14 10 180 36.86 180 70 V 110"
      stroke="var(--text-dark)"
      strokeWidth="24"
      strokeLinecap="round"
    />
    <rect
      x="30"
      y="110"
      width="180"
      height="190"
      rx="32"
      fill="var(--primary-cyan)"
    />
    <circle cx="120" cy="195" r="22" fill="white" />
    <path d="M120 215 L 96 270 H 144 L 120 215 Z" fill="white" />
  </svg>
);