/**
 * Página de restablecimiento de contraseña.
 * Fuente: HU-05.
 * Wrapped in Suspense for useSearchParams() (Next.js requirement).
 */
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Establece una nueva contraseña para tu cuenta',
};

function ResetPasswordSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
