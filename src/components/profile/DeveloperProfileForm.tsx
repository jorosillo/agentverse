/**
 * Formulario de edición de perfil de Developer.
 * React Hook Form + Zod + Server Action.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Globe, GitBranch, Save, CheckCircle2 } from 'lucide-react';
import {
  updateDeveloperProfileSchema,
  type UpdateDeveloperProfileInput,
} from '@/lib/schemas/profile.schema';
import { updateDeveloperProfile } from '@/server-actions/profile.actions';
import { EXPERIENCE_LEVELS, SUGGESTED_SKILLS } from '@/lib/constants/industries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { DeveloperProfile } from '@prisma/client';

interface Props {
  profile: DeveloperProfile;
}

export function DeveloperProfileForm({ profile }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.skills);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateDeveloperProfileInput>({
    resolver: zodResolver(updateDeveloperProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      region: profile.region,
      githubUrl: profile.githubUrl || '',
      skills: profile.skills,
      experienceLevel: profile.experienceLevel,
      bio: profile.bio || '',
    },
  });

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setValue('skills', newSkills, { shouldValidate: true });
  };

  const onSubmit = async (data: UpdateDeveloperProfileInput) => {
    setServerError(null);
    setSuccess(false);

    const result = await updateDeveloperProfile(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 lg:space-y-8">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <h2 className="text-xl font-bold text-white">Información personal</h2>

        <Input
          id="edit-name"
          label="Nombre completo"
          icon={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          id="edit-region"
          label="Región"
          icon={<Globe className="h-4 w-4" />}
          error={errors.region?.message}
          {...register('region')}
        />

        <Input
          id="edit-github"
          label="GitHub (opcional)"
          icon={<GitBranch className="h-4 w-4" />}
          error={errors.githubUrl?.message}
          {...register('githubUrl')}
        />

        <Select
          id="edit-experience"
          label="Nivel de experiencia"
          options={Object.entries(EXPERIENCE_LEVELS).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.experienceLevel?.message}
          {...register('experienceLevel')}
        />

        {/* Bio */}
        <div className="space-y-1.5">
          <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-300">
            Bio (opcional)
          </label>
          <textarea
            id="edit-bio"
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 hover:border-white/20 transition-all resize-none"
            placeholder="Cuéntanos sobre ti y tu experiencia con agentes de IA..."
            {...register('bio')}
          />
          {errors.bio?.message && (
            <p className="text-xs text-red-400">{errors.bio.message}</p>
          )}
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Habilidades técnicas
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                  selectedSkills.includes(skill)
                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills?.message && (
            <p className="text-xs text-red-400">{errors.skills.message}</p>
          )}
        </div>
      </div>

      {/* Status messages */}
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
