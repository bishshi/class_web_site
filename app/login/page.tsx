'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LoginResponse, StrapiError } from '@/types/auth';
import { isAuthenticated } from '@/lib/auth';
import './login.css';

export default function Login() {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 检查是否已登录，如果已登录则直接跳转
  useEffect(() => {
    if (isAuthenticated()) {
      const redirect = searchParams.get('redirect') || '/members';
      router.push(redirect);
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data: LoginResponse | StrapiError = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok) {
        const loginData = data as LoginResponse;
        localStorage.setItem('token', loginData.jwt);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        
        // 获取redirect参数，如果没有则默认跳转到 /members
        const redirect = searchParams.get('redirect') || '/members';
        
        // 刷新页面后跳转
        window.location.href = redirect;
      } else {
        const errorData = data as StrapiError;
        const errorMessage = errorData.error?.message || '登录失败，请检查用户名和密码';
        setError(errorMessage);
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 如果已登录，显示加载状态
  if (isAuthenticated()) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="login-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#64748b' }}>已登录，正在跳转...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>欢迎回来</h1>
          <p>登录访问班级空间</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              用户名或邮箱
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
              placeholder="输入你的用户名"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="输入你的密码"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>还没有账号？请联系班级管理员</p>
        </div>
      </div>
    </div>
  );
}