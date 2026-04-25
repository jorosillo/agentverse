/**
 * Formulario de edición de perfil de Company.
 * React Hook Form + Zod + Server Action.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Globe, Save, CheckCircle2 } from 'lucide-react';
import {
  updateCompanyProfileSchema,
  type UpdateCompanyProfileInput,
} from '@/lib/schemas/profile.schema';
import { updateCompanyProfile } from '@/server-actions/profile.actions';
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/constants/industries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { CompanyProfile } from '@prisma/client';

interface Props {
  profile: CompanyProfile;
}

export function CompanyProfileForm({ profile }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCompanyProfileInput>({
    resolver: zodResolver(updateCompanyProfileSchema),
    defaultValues: {
      companyName: profile.companyName,
      industry: profile.industry,
      size: profile.size,
      website: profile.website || '',
      description: profile.description || '',
    },
  });

  const onSubmit = async (data: UpdateCompanyProfileInput) => {
    setServerError(null);
    setSuccess(false);

    const result = await updateCompanyProfile(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Datos de la empresa</h2>

        <Input
          id="edit-company-name"
          label="Nombre de la empresa"
          icon={<Building2 className="h-4 w-4" />}
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Select
          id="edit-industry"
          label="Sector"
          options={Object.entries(INDUSTRIES).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.industry?.message}
          {...register('industry')}
        />

        <Select
          id="edit-size"
          label="Tamaño de la empresa"
          options={Object.entries(COMPANY_SIZES).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.size?.message}
          {...register('size')}
        />

        <Input
          id="edit-website"
          label="Sitio web (opcional)"
          icon={<Globe className="h-4 w-4" />}
          error={errors.website?.message}
          {...register('website')}
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="edit-desc" className="block text-sm font-medium text-gray-300">
            Descripción (opcional)
          </label>
          <textarea
            id="edit-desc"
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 hover:border-white/20 transition-all resize-none"
            placeholder="Describe tu empresa, misión y qué tipo de agentes de IA buscáis..."
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <p className="text-sm text-green-400">Perfil actualizado correctamente</p>
        </div>
      )}

      <Button type="submit" size="lg" isLoading={isSubmitting}>
        <Save className="h-4 w-4" />
        Guardar cambios
      </Button>
    </form>
  );
}
