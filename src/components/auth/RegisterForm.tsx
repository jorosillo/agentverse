/**
 * Formulario de Registro — Developer y Company.
 * Fuente: HU-01, HU-02.
 * 
 * Flujo:
 * 1. Selector de rol (Developer / Empresa)
 * 2. Formulario específico por rol con React Hook Form + Zod
 * 3. Server Action → JWT → Redirect dashboard
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  User,
  Globe,
  Code2,
  Building2,
  UserPlus,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';
import {
  registerDeveloperSchema,
  registerCompanySchema,
  type RegisterDeveloperInput,
  type RegisterCompanyInput,
} from '@/lib/schemas/auth.schema';
import { registerDeveloper, registerCompany } from '@/server-actions/auth.actions';
import { EXPERIENCE_LEVELS, INDUSTRIES, COMPANY_SIZES, SUGGESTED_SKILLS } from '@/lib/constants/industries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

type RoleSelection = null | 'DEVELOPER' | 'COMPANY';

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<RoleSelection>(null);

  const formVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-5 sm:p-6 lg:p-8 shadow-2xl relative">
        <AnimatePresence mode="wait">
          {selectedRole === null ? (
            <motion.div key="selector" variants={formVariants} initial="initial" animate="animate" exit="exit">
              <RoleSelector onSelect={setSelectedRole} />
            </motion.div>
          ) : selectedRole === 'DEVELOPER' ? (
            <motion.div key="developer" variants={formVariants} initial="initial" animate="animate" exit="exit">
              <DeveloperRegisterForm onBack={() => setSelectedRole(null)} />
            </motion.div>
          ) : (
            <motion.div key="company" variants={formVariants} initial="initial" animate="animate" exit="exit">
              <CompanyRegisterForm onBack={() => setSelectedRole(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// SELECTOR DE ROL
// ============================================================================

function RoleSelector({ onSelect }: { onSelect: (role: RoleSelection) => void }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="text-sm text-gray-400 mt-2">
          Selecciona tu tipo de perfil
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => onSelect('DEVELOPER')}
          className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left transition-all duration-300 hover:border-violet-500/20 hover:bg-violet-600/5 sm:p-6"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 mb-4 group-hover:bg-violet-600/20 transition-colors">
            <Code2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Desarrollador</h3>
          <p className="text-xs text-gray-400">
            Publica agentes de IA y postúlate a ofertas
          </p>
        </button>

        <button
          onClick={() => onSelect('COMPANY')}
          className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 text-left transition-all duration-300 hover:border-blue-500/20 hover:bg-blue-600/5 sm:p-6"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 mb-4 group-hover:bg-blue-600/20 transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Empresa</h3>
          <p className="text-xs text-gray-400">
            Busca agentes y publica ofertas de trabajo
          </p>
        </button>
      </div>

      {/* Login link */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </>
  );
}

// ============================================================================
// FORMULARIO DE DEVELOPER (HU-01)
// ============================================================================

function DeveloperRegisterForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDeveloperInput>({
    resolver: zodResolver(registerDeveloperSchema),
    defaultValues: {
      fullName: '',
      email: '',
      region: '',
      githubUrl: '',
      experienceLevel: undefined,
      skills: [],
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
      emailPreferences: true,
    },
  });

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    setValue('skills', newSkills, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterDeveloperInput) => {
    setServerError(null);
    const result = await registerDeveloper(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Registro de Desarrollador</h1>
          <p className="text-xs text-gray-400">Completa tu perfil profesional</p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre completo */}
        <Input
          id="reg-dev-name"
          label="Nombre completo"
          placeholder="Juan García"
          icon={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Email */}
        <Input
          id="reg-dev-email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        {/* Región */}
        <Input
          id="reg-dev-region"
          label="Región"
          placeholder="Comunidad Valenciana, España"
          icon={<Globe className="h-4 w-4" />}
          error={errors.region?.message}
          {...register('region')}
        />

        {/* GitHub URL */}
        <Input
          id="reg-dev-github"
          label="GitHub (opcional)"
          placeholder="https://github.com/tu-usuario"
          icon={<GitBranch className="h-4 w-4" />}
          error={errors.githubUrl?.message}
          {...register('githubUrl')}
        />

        {/* Experiencia */}
        <Select
          id="reg-dev-experience"
          label="Nivel de experiencia"
          placeholder="Selecciona tu nivel"
          options={Object.entries(EXPERIENCE_LEVELS).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.experienceLevel?.message}
          {...register('experienceLevel')}
        />

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
                className={`
                  px-3 py-1.5 text-xs rounded-lg border transition-all duration-200
                  ${selectedSkills.includes(skill)
                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
                  }
                `}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills?.message && (
            <p className="text-xs text-red-400">{errors.skills.message}</p>
          )}
        </div>

        {/* Contraseña */}
        <Input
          id="reg-dev-password"
          label="Contraseña"
          type="password"
          placeholder="Mín. 8 caracteres, 1 número, 1 símbolo"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          id="reg-dev-confirm"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        {/* Checkboxes legales */}
        <div className="space-y-3 pt-2">
          <Checkbox
            label={
              <span>
                Acepto los{' '}
                <Link href="/terms" className="text-violet-400 hover:underline" target="_blank">
                  Términos y Condiciones
                </Link>
              </span>
            }
            error={errors.acceptTerms?.message}
            {...register('acceptTerms')}
          />
          <Checkbox
            label={
              <span>
                Acepto la{' '}
                <Link href="/privacy" className="text-violet-400 hover:underline" target="_blank">
                  Política de Privacidad
                </Link>
              </span>
            }
            error={errors.acceptPrivacy?.message}
            {...register('acceptPrivacy')}
          />
          <Checkbox
            label="Deseo recibir notificaciones por correo electrónico"
            {...register('emailPreferences')}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="mt-4"
        >
          <UserPlus className="h-4 w-4" />
          Crear cuenta de Desarrollador
        </Button>
      </form>
    </>
  );
}

// ============================================================================
// FORMULARIO DE COMPANY (HU-02)
// ============================================================================

function CompanyRegisterForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompanyInput>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: '',
      email: '',
      website: '',
      industry: undefined,
      size: undefined,
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
      emailPreferences: true,
    },
  });

  const onSubmit = async (data: RegisterCompanyInput) => {
    setServerError(null);
    const result = await registerCompany(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Registro de Empresa</h1>
          <p className="text-xs text-gray-400">Datos de tu organización</p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="reg-comp-name"
          label="Nombre de la empresa"
          placeholder="Mi Empresa S.L."
          icon={<Building2 className="h-4 w-4" />}
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        <Input
          id="reg-comp-email"
          label="Correo electrónico corporativo"
          type="email"
          placeholder="contacto@empresa.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          id="reg-comp-website"
          label="Sitio web (opcional)"
          placeholder="https://www.empresa.com"
          icon={<Globe className="h-4 w-4" />}
          error={errors.website?.message}
          {...register('website')}
        />

        <Select
          id="reg-comp-industry"
          label="Sector"
          placeholder="Selecciona tu sector"
          options={Object.entries(INDUSTRIES).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.industry?.message}
          {...register('industry')}
        />

        <Select
          id="reg-comp-size"
          label="Tamaño de la empresa"
          placeholder="Selecciona el tamaño"
          options={Object.entries(COMPANY_SIZES).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.size?.message}
          {...register('size')}
        />

        <Input
          id="reg-comp-password"
          label="Contraseña"
          type="password"
          placeholder="Mín. 8 caracteres, 1 número, 1 símbolo"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          id="reg-comp-confirm"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <div className="space-y-3 pt-2">
          <Checkbox
            label={
              <span>
                Acepto los{' '}
                <Link href="/terms" className="text-violet-400 hover:underline" target="_blank">
                  Términos y Condiciones
                </Link>
              </span>
            }
            error={errors.acceptTerms?.message}
            {...register('acceptTerms')}
          />
          <Checkbox
            label={
              <span>
                Acepto la{' '}
                <Link href="/privacy" className="text-violet-400 hover:underline" target="_blank">
                  Política de Privacidad
                </Link>
              </span>
            }
            error={errors.acceptPrivacy?.message}
            {...register('acceptPrivacy')}
          />
          <Checkbox
            label="Deseo recibir notificaciones por correo electrónico"
            {...register('emailPreferences')}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="mt-4"
        >
          <UserPlus className="h-4 w-4" />
          Crear cuenta de Empresa
        </Button>
      </form>
    </>
  );
}
