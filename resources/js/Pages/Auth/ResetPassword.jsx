import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthShell from '@/Layouts/AuthShell';
import AuthPasswordInput from '@/Components/Auth/AuthPasswordInput';
import AuthSubmitButton from '@/Components/Auth/AuthSubmitButton';
import AuthAlert from '@/Components/Auth/AuthAlert';
import AuthRequirementList from '@/Components/Auth/AuthRequirementList';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ResetPassword({ token, email, isExpired = false, passwordRequirements }) {
  const { data, setData, post, processing, errors, setError } = useForm({
    token: token || '',
    email: email || '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.password !== data.password_confirmation) {
      setError('password_confirmation', 'Passwords do not match.');
      return;
    }
    post('/reset-password');
  };

  if (isExpired) {
    return (
      <AuthShell
        title="Invalid or expired link"
        subtitle="The password reset link you clicked is no longer valid."
      >
        <Head title="Reset Link Expired - DMRS" />

        <div className="space-y-5">
          <AuthAlert
            type="warning"
            title="Reset Link Expired"
            message="This password reset link is invalid or has already been used. Please request a new link."
          />

          <div className="space-y-2 pt-2">
            <Link
              href="/forgot-password"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Request New Reset Link
            </Link>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create a new password"
      subtitle="Please choose a secure new password for your DMRS enterprise account."
    >
      <Head title="Reset Password - DMRS" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthPasswordInput
          label="New Password"
          id="password"
          value={data.password}
          onChange={(e) => setData('password', e.target.value)}
          placeholder="Enter new password"
          required
          autoComplete="new-password"
          icon={Lock}
          error={errors.password}
        />

        <AuthPasswordInput
          label="Confirm New Password"
          id="password_confirmation"
          value={data.password_confirmation}
          onChange={(e) => setData('password_confirmation', e.target.value)}
          placeholder="Confirm new password"
          required
          autoComplete="new-password"
          icon={Lock}
          error={errors.password_confirmation}
        />

        <AuthRequirementList requirements={passwordRequirements} />

        <AuthSubmitButton loading={processing} loadingText="Resetting Password...">
          Reset Password
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
    </AuthShell>
  );
}
