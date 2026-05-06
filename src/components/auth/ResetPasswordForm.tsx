/**
 * Formulario de Restablecimiento de contraseña.
 * Fuente: HU-05.
 * Lee el token desde ?token= en la URL.
 */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowLeft, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { resetPassword } from '@/server-actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  // Si no hay token en la URL
  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-600/10 mx-auto mb-5">
            <AlertTriangle className="h-7 w-7 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Enlace inválido</h2>
          <p className="text-sm text-gray-400 mb-6">
            El enlace de restablecimiento no es válido. Solicita un nuevo enlace.
          </p>
          <Link href="/forgot-password">
            <Button variant="primary" fullWidth>
              Solicitar nuevo enlace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600/10 mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Contraseña actualizada</h2>
          <p className="text-sm text-gray-400 mb-6">
            Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
          </p>
          <Link href="/login">
            <Button variant="primary" fullWidth>
              Ir al login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    const result = await resetPassword(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-sm text-gray-400 mt-2">
            Establece una nueva contraseña para tu cuenta
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input type="hidden" {...register('token')} />

          <Input
            id="reset-password"
            label="Nueva contraseña"
            type="password"
            placeholder="Mín. 8 caracteres, 1 número, 1 símbolo"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />

          <Input
            id="reset-confirm"
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu nueva contraseña"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            <KeyRound className="h-4 w-4" />
            Restablecer contraseña
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
