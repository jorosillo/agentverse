/**
 * Sección de eliminación de cuenta (GDPR – HU-13).
 * Requiere escribir "ELIMINAR MI CUENTA" como confirmación.
 */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  deleteAccountSchema,
  type DeleteAccountInput,
} from '@/lib/schemas/profile.schema';
import { deleteAccount } from '@/server-actions/profile.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function DeleteAccountSection() {
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onSubmit = async (data: DeleteAccountInput) => {
    setServerError(null);
    const result = await deleteAccount(data);
    if (!result.success) {
      setServerError(result.error);
    }
    // Si es exitoso, la Server Action redirige a /
  };

  return (
    <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
          <Trash2 className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-red-300">Zona de peligro</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Eliminación permanente e irreversible de tu cuenta y todos tus datos
          </p>
        </div>
      </div>

      {!showForm ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(true)}
          className="!text-red-400 !border-red-500/20 hover:!bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar mi cuenta
        </Button>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-300">
                Esta acción es irreversible
              </p>
              <p className="text-xs text-yellow-400/70 mt-1">
                Se eliminarán permanentemente tu perfil, agentes, ofertas, mensajes, reseñas y todos los datos asociados a tu cuenta.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="delete-confirmation"
              label='Escribe "ELIMINAR MI CUENTA" para confirmar'
              placeholder="ELIMINAR MI CUENTA"
              error={errors.confirmation?.message}
              {...register('confirmation')}
            />

            {serverError && (
              <p className="text-sm text-red-400">{serverError}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                className="!bg-red-600 !hover:bg-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Confirmar eliminación
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
