/**
 * Página de configuración — Preferencias y eliminación de cuenta.
 * Fuente: HU-12 (preferencias), HU-13 (GDPR delete).
 */
import { redirect } from 'next/navigation';
import { getCurrentSessionWithProfile } from '@/server-actions/auth.actions';
import { EmailPreferencesToggle } from '@/components/settings/EmailPreferencesToggle';
import { DeleteAccountSection } from '@/components/settings/DeleteAccountSection';
import { Settings } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuración',
  description: 'Gestiona tus preferencias y la configuración de tu cuenta',
};

export default async function SettingsPage() {
  const user = await getCurrentSessionWithProfile();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10">
          <Settings className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestiona tus preferencias y la seguridad de tu cuenta
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Email preferences */}
        <EmailPreferencesToggle initialValue={user.emailPreferences} />

        {/* Danger zone */}
        <DeleteAccountSection />
      </div>
    </div>
  );
}
