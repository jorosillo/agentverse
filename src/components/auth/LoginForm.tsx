/**
 * Formulario de Login.
 * Fuente: HU-03, HU-04.
 * Integra: React Hook Form + Zod (validación isomórfica) + Server Action.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth.schema';
import { login } from '@/server-actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await login(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 lg:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Bienvenido de nuevo</h1>
          <p className="text-sm text-gray-400 mt-2">
            Inicia sesión en tu cuenta de AgentVerse
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="login-email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <Input
            id="login-password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Checkbox
              label="Recordarme"
              {...register('rememberMe')}
            />
            <Link
              href="/forgot-password"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Button>
        </form>

        {/* Separator */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-500">¿No tienes cuenta?</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Register link */}
        <Link href="/register">
          <Button variant="outline" fullWidth>
            Crear una cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
}
