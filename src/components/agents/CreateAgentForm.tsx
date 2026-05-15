/**
 * Formulario de creación de Agente.
 * React Hook Form + Zod + Server Action.
 * Soporta hasta 5 imágenes (validación client-side).
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Cpu, Code2, DollarSign, Upload, X, Plus, CheckCircle2, Tag,
} from 'lucide-react';
import { createAgentSchema, type CreateAgentInput } from '@/lib/schemas/agent.schema';
import { createAgent } from '@/server-actions/agent.actions';
import { PAYMENT_TYPES, SUGGESTED_SKILLS } from '@/lib/constants/industries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const MAX_IMAGES = 5;
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

interface Props {
  categories: { id: string; name: string; slug: string }[];
}

export function CreateAgentForm({ categories }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      longDescription: '',
      categoryIds: [],
      technologies: [],
      paymentType: undefined,
      price: undefined,
    },
  });

  // Category management
  const toggleCategory = (categoryId: string) => {
    const updated = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    setSelectedCategoryIds(updated);
    setValue('categoryIds', updated, { shouldValidate: true });
  };

  // Technology management
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

  const addSuggestedTech = (tech: string) => {
    if (!technologies.includes(tech)) {
      const newTechs = [...technologies, tech];
      setTechnologies(newTechs);
      setValue('technologies', newTechs, { shouldValidate: true });
    }
  };

  // Image upload (placeholder: stores as data URLs for now, production would use Vercel Blob)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      setServerError(`Máximo ${MAX_IMAGES} imágenes permitidas.`);
      return;
    }

    setUploading(true);
    setServerError(null);

    for (const file of Array.from(files)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setServerError('Formato de imagen no soportado. Usa PNG, JPG, GIF o WebP.');
        setUploading(false);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setServerError('La imagen no puede exceder 10MB.');
        setUploading(false);
        return;
      }

      // For MVP: use base64 data URL (producción usaría Vercel Blob)
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrls((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateAgentInput) => {
    setServerError(null);

    const result = await createAgent(data, imageUrls);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push(`/agents/${result.data.agentId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      {/* Basic info */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-violet-400" />
          Información del agente
        </h2>

        <Input
          id="agent-name"
          label="Nombre del agente"
          placeholder="Ej: Chatbot Soporte Técnico Pro"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="agent-short-desc"
          label="Descripción corta (máx. 100 caracteres)"
          placeholder="Resumen breve de qué hace tu agente"
          error={errors.shortDescription?.message}
          {...register('shortDescription')}
        />

        <div className="space-y-1.5">
          <label htmlFor="agent-long-desc" className="block text-sm font-medium text-gray-300">
            Descripción larga (Markdown)
          </label>
          <textarea
            id="agent-long-desc"
            rows={8}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 hover:border-white/20 transition-all resize-none font-mono"
            placeholder="Describe tu agente en detalle. Soporta Markdown..."
            {...register('longDescription')}
          />
          {errors.longDescription?.message && (
            <p className="text-xs text-red-400">{errors.longDescription.message}</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Tag className="h-5 w-5 text-violet-400" />
          Categoría
        </h2>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.02] border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No hay categorías disponibles.</p>
        )}
        {errors.categoryIds?.message && (
          <p className="text-xs text-red-400">{errors.categoryIds.message}</p>
        )}
      </div>

      {/* Technologies */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Code2 className="h-5 w-5 text-violet-400" />
          Tecnologías
        </h2>

        {/* Custom input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechnology(); } }}
            placeholder="Ej: LangChain, OpenAI..."
            className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
          <button
            type="button"
            onClick={addTechnology}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Selected */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-300"
              >
                {tech}
                <button type="button" onClick={() => removeTechnology(tech)}>
                  <X className="h-3 w-3 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.technologies?.message && (
          <p className="text-xs text-red-400">{errors.technologies.message}</p>
        )}

        {/* Suggested */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SKILLS.filter((s) => !technologies.includes(s)).slice(0, 10).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSuggestedTech(skill)}
                className="px-2.5 py-1 text-[10px] rounded-md bg-white/[0.02] border border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-violet-400" />
          Precios
        </h2>

        <Select
          id="agent-payment-type"
          label="Modalidad de pago"
          options={Object.entries(PAYMENT_TYPES).map(([value, label]) => ({ value, label }))}
          error={errors.paymentType?.message}
          {...register('paymentType')}
        />

        <Input
          id="agent-price"
          label="Precio (€)"
          type="number"
          placeholder="0.00"
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
      </div>

      {/* Images */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-violet-400" />
          Imágenes <span className="text-xs text-gray-500 font-normal">({imageUrls.length}/{MAX_IMAGES})</span>
        </h2>

        {imageUrls.length < MAX_IMAGES && (
          <label className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/30 transition-all cursor-pointer group">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="h-6 w-6 text-gray-600 mx-auto mb-2 group-hover:text-violet-400 transition-colors" />
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {uploading ? 'Subiendo...' : 'Haz clic para subir (PNG, JPG, GIF, WebP — máx 10MB)'}
              </p>
            </div>
          </label>
        )}

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {serverError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        <CheckCircle2 className="h-4 w-4" />
        Publicar agente
      </Button>
    </form>
  );
}
