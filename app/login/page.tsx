import { Suspense } from 'react';
import LoginForm from './Form';
import './form.css'; // 确保引入了 CSS

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}

// 更新后的 Loading 组件：全屏居中，使用新的主题色
function LoginLoading() {
  return (
    // 复用新的全屏容器样式，并使其居中
    <div className="login-page-container" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fb' }}>
      <div style={{ textAlign: 'center' }}>
        {/* 使用 CSS 中定义的 Spinner 类 */}
        <div className="loading-spinner" style={{ borderTopColor: 'var(--primary-cyan)', width: '40px', height: '40px', margin: '0 auto 20px', border: '4px solid #e0e0e0', borderTop: '4px solid var(--primary-cyan)' }}></div>
        <p style={{ color: 'var(--text-gray)', fontSize: '18px' }}>Loading Space...</p>
      </div>
    </div>
  );
}