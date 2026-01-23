// app/forgot-password/page.tsx
import { Suspense } from 'react';
import ForgotPasswordForm from '@/components/ForgotPassWordForm';
import './forgot-password.css';

export default function ForgotPasswordPage() {
  return (
    <div className="forgot-password-container">
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}