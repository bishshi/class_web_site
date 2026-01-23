// app/forgot-password/ForgotPasswordForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 如果已登录，重定向到成员页面
    if (isAuthenticated()) {
      router.push('/members');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '发送重置链接失败');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password-card">
        <div className="success-icon">✓</div>
        <h1>邮件已发送</h1>
        <p className="success-message">
          如果该邮箱已注册，你将收到一封包含重置密码链接的邮件。
        </p>
        <p className="hint-text">
          请检查你的收件箱（包括垃圾邮件文件夹），并点击邮件中的链接来重置密码。
        </p>
        <Link href="/login" className="back-link">
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <div className="forgot-password-card">
      <h1>忘记密码</h1>
      <p className="subtitle">输入你的注册邮箱，我们将发送重置密码的链接给你。</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">邮箱地址</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '发送中...' : '发送重置链接'}
        </button>
      </form>

      <div className="footer-links">
        <Link href="/login">返回登录</Link>
      </div>
    </div>
  );
}