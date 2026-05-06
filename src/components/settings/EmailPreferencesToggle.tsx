/**
 * Toggle de preferencias de notificación por email.
 */
'use client';

import { useState, useTransition } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { updateEmailPreferences } from '@/server-actions/profile.actions';

interface Props {
  initialValue: boolean;
}

export function EmailPreferencesToggle({ initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    startTransition(async () => {
      await updateEmailPreferences(newValue);
    });
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            {enabled ? (
              <Bell className="h-5 w-5 text-violet-400" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">
              Notificaciones por correo
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Recibe actualizaciones sobre mensajes, ofertas y acuerdos
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={toggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
            enabled ? 'bg-violet-600' : 'bg-white/10'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Toggle email notifications"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
