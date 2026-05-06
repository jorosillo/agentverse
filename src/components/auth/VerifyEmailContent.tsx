/**
 * Contenido de la página de verificación de email.
 * Fuente: HU-06.
 * Lee el token desde ?token= y lo envía al server action.
 */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { verifyEmail } from '@/server-actions/auth.actions';
import { Button } from '@/components/ui/Button';

type VerifyState = 'loading' | 'success' | 'error' | 'no-token';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'no-token');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      const result = await verifyEmail(token);

      if (result.success) {
        setState('success');
      } else {
        setState('error');
        setErrorMessage(result.error);
      }
    };

    verify();
  }, [token]);

  // Sin token
  if (state === 'no-token') {
    return (
      <VerifyCard
        icon={<AlertTriangle className="h-7 w-7 text-yellow-400" />}
        iconBg="bg-yellow-600/10"
        title="Enlace inválido"
        description="No se encontró un token de verificación válido."
      >
        <Link href="/login">
          <Button variant="secondary" fullWidth>
            Ir al login
          </Button>
        </Link>
      </VerifyCard>
    );
  }

  // Cargando
  if (state === 'loading') {
    return (
      <VerifyCard
        icon={<Loader2 className="h-7 w-7 text-violet-400 animate-spin" />}
        iconBg="bg-violet-600/10"
        title="Verificando..."
        description="Estamos verificando tu correo electrónico."
      />
    );
  }

  // Éxito
  if (state === 'success') {
    return (
      <VerifyCard
        icon={<CheckCircle2 className="h-7 w-7 text-green-400" />}
        iconBg="bg-green-600/10"
        title="¡Correo verificado!"
        description="Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades."
      >
        <Link href="/dashboard">
          <Button variant="primary" fullWidth>
            Ir al Dashboard
          </Button>
        </Link>
      </VerifyCard>
    );
  }

  // Error
  return (
    <VerifyCard
      icon={<XCircle className="h-7 w-7 text-red-400" />}
      iconBg="bg-red-600/10"
      title="Verificación fallida"
      description={errorMessage || 'El enlace es inválido o ha expirado.'}
    >
      <Link href="/login">
        <Button variant="secondary" fullWidth>
          Ir al login
        </Button>
      </Link>
    </VerifyCard>
  );
}

// ============================================================================
// HELPER COMPONENT
// ============================================================================

function VerifyCard({
  icon,
  iconBg,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} mx-auto mb-5`}
        >
          {icon}
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-6">{description}</p>
        {children}
      </div>
    </div>
  );
}
