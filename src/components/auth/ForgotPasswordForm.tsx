/**
 * Formulario de Recuperación de contraseña.
 * Fuente: HU-05.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth.schema';
import { forgotPassword } from '@/server-actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await forgotPassword(data);
    // Siempre mostrar éxito (anti-enumeración)
    setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 shadow-2xl text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600/10 mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Correo enviado</h2>
          <p className="text-sm text-gray-400 mb-6">
            Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.
          </p>
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
          <p className="text-sm text-gray-400 mt-2">
            Introduce tu correo y te enviaremos un enlace de restablecimiento
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="forgot-email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            <Send className="h-4 w-4" />
            Enviar enlace
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
