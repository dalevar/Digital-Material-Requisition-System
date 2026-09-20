import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthShell from '@/Layouts/AuthShell';
import AuthInput from '@/Components/Auth/AuthInput';
import AuthSubmitButton from '@/Components/Auth/AuthSubmitButton';
import AuthAlert from '@/Components/Auth/AuthAlert';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    post('/forgot-password');
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your registered corporate email address and we'll send instructions to reset your password."
    >
      <Head title="Forgot Password - DMRS" />

      {/* Security Neutral Response (Prevents Account Enumeration) */}
      {(status || submitted) ? (
        <div className="space-y-5">
          <AuthAlert
            type="success"
            title="Reset instructions sent"
            message="If an account matches that email address, reset instructions have been sent."
          />

          <p className="text-xs text-slate-500 leading-relaxed">
            Please check your email inbox and follow the instructions to securely reset your DMRS password. If you do not receive an email within a few minutes, check your spam or junk folder.
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email Address"
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            placeholder="name@guthrie.co.id"
            required
            autoComplete="email"
            icon={Mail}
            error={errors.email}
          />

          <AuthSubmitButton loading={processing} loadingText="Sending Link...">
            Send Reset Link
          </AuthSubmitButton>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
