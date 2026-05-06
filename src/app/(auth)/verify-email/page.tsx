/**
 * Página de verificación de email.
 * Fuente: HU-06.
 * Wrapped in Suspense for useSearchParams() (Next.js requirement).
 */
import { Suspense } from 'react';
import { VerifyEmailContent } from '@/components/auth/VerifyEmailContent';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verificar correo',
  description: 'Verifica tu dirección de correo electrónico',
};

function VerifyEmailSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl flex items-center justify-center min-h-[250px]">
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
