/**
 * Página de edición de perfil.
 * Fuente: HU-10, HU-11.
 * Renderiza el formulario correcto según el rol del usuario.
 */
import { redirect } from 'next/navigation';
import { getCurrentSessionWithProfile } from '@/server-actions/auth.actions';
import { DeveloperProfileForm } from '@/components/profile/DeveloperProfileForm';
import { CompanyProfileForm } from '@/components/profile/CompanyProfileForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar perfil',
  description: 'Actualiza la información de tu perfil',
};

export default async function ProfilePage() {
  const user = await getCurrentSessionWithProfile();
  if (!user) redirect('/login');

  return (
    <div className="page-shell-narrow">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar perfil</h1>
        <p className="text-sm text-gray-400 mt-1">
          Actualiza tu información profesional. El correo y el rol no son editables.
        </p>
      </div>

      {/* Email / Role (readonly info) */}
      <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Correo electrónico</span>
            <p className="text-sm text-white mt-1">{user.email}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Rol</span>
            <p className="text-sm text-white mt-1">
              {user.role === 'DEVELOPER' ? 'Desarrollador' : 'Empresa'}
            </p>
          </div>
        </div>
      </div>

      {/* Role-specific form */}
      {user.role === 'DEVELOPER' && user.developerProfile ? (
        <DeveloperProfileForm profile={user.developerProfile} />
      ) : user.role === 'COMPANY' && user.companyProfile ? (
        <CompanyProfileForm profile={user.companyProfile} />
      ) : (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">
            No se encontró tu perfil. Contacta soporte.
          </p>
        </div>
      )}
    </div>
  );
}
