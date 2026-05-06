/**
 * Formulario de edición de Oferta de Trabajo.
 * Pre-filled con datos existentes.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Briefcase, Code2, DollarSign, Upload, X, Plus, Save, Trash2, CheckCircle2,
} from 'lucide-react';
import { updateJobSchema, type UpdateJobInput } from '@/lib/schemas/job.schema';
import { updateJob, deleteJob } from '@/server-actions/job.actions';
import { PAYMENT_TYPES, SUGGESTED_SKILLS } from '@/lib/constants/industries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface Props {
  job: {
    id: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    technologies: string[];
    paymentType: string;
    budget: number | null;
    images: string[];
    categories: { category: { id: string; name: string } }[];
  };
}

export function EditJobForm({ job }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>(job.technologies);
  const [techInput, setTechInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(job.images);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateJobInput>({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      name: job.name,
      shortDescription: job.shortDescription,
      longDescription: job.longDescription,
      technologies: job.technologies,
      paymentType: job.paymentType as 'FIXED' | 'MONTHLY' | 'HOURLY',
      budget: job.budget ?? undefined,
      categoryIds: job.categories.map((c) => c.category.id),
    },
  });

  const addTechnology = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      const newTechs = [...technologies, trimmed];
      setTechnologies(newTechs);
      setValue('technologies', newTechs, { shouldValidate: true });
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    const newTechs = technologies.filter((t) => t !== tech);
    setTechnologies(newTechs);
    setValue('technologies', newTechs, { shouldValidate: true });
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateJobInput) => {
    setServerError(null);
    setSuccess(false);

    const result = await updateJob(job.id, data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteJob(job.id);
    if (!result.success) {
      setServerError(result.error);
      setIsDeleting(false);
      return;
    }
    router.push('/jobs');
  };

  return (
    <div className="space-y-6">
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
        {/* Info */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-400" />
            Información de la oferta
          </h2>

          <Input id="edit-job-name" label="Título" error={errors.name?.message} {...register('name')} />
          <Input id="edit-job-short" label="Descripción corta" error={errors.shortDescription?.message} {...register('shortDescription')} />

          <div className="space-y-1.5">
            <label htmlFor="edit-job-long" className="block text-sm font-medium text-gray-300">Descripción detallada (Markdown)</label>
            <textarea
              id="edit-job-long"
              rows={8}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-white/20 transition-all resize-none font-mono"
              {...register('longDescription')}
            />
            {errors.longDescription?.message && <p className="text-xs text-red-400">{errors.longDescription.message}</p>}
          </div>
        </div>

        {/* Technologies */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-400" />
            Tecnologías requeridas
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechnology(); } }}
              placeholder="Ej: Python..."
              className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            <button type="button" onClick={addTechnology} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span key={tech} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300">
                  {tech}
                  <button type="button" onClick={() => removeTechnology(tech)}><X className="h-3 w-3 hover:text-red-400" /></button>
                </span>
              ))}
            </div>
          )}
          {errors.technologies?.message && <p className="text-xs text-red-400">{errors.technologies.message}</p>}

          <div>
            <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.filter((s) => !technologies.includes(s)).slice(0, 8).map((skill) => (
                <button key={skill} type="button" onClick={() => { const t = [...technologies, skill]; setTechnologies(t); setValue('technologies', t, { shouldValidate: true }); }}
                  className="px-2.5 py-1 text-[10px] rounded-md bg-white/[0.02] border border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all">
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            Presupuesto
          </h2>
          <Select id="edit-job-payment" label="Modalidad" options={Object.entries(PAYMENT_TYPES).map(([value, label]) => ({ value, label }))} error={errors.paymentType?.message} {...register('paymentType')} />
          <Input id="edit-job-budget" label="Presupuesto (€)" type="number" error={errors.budget?.message} {...register('budget', { valueAsNumber: true })} />
        </div>

        {/* Images */}
        {imageUrls.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Material adjunto
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {serverError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <p className="text-sm text-green-400">Oferta actualizada correctamente</p>
          </div>
        )}

        <Button type="submit" size="lg" isLoading={isSubmitting}>
          <Save className="h-4 w-4" />
          Guardar cambios
        </Button>
      </form>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-300">Eliminar oferta</h3>
            <p className="text-xs text-gray-500 mt-0.5">Esta acción desactivará la oferta del marketplace</p>
          </div>
          {!showDeleteConfirm ? (
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} className="!text-red-400 !border-red-500/20 hover:!bg-red-500/10">
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              <Button size="sm" isLoading={isDeleting} onClick={handleDelete} className="!bg-red-600 hover:!bg-red-700">Confirmar</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
