/**
 * Cookie Consent Banner — Componente global.
 * Se muestra a usuarios no logueados que no han aceptado cookies.
 * Almacena preferencia en localStorage.
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const consent = localStorage.getItem('cookie_consent');
      setVisible(!consent);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300">
              Utilizamos cookies esenciales para el funcionamiento de la plataforma.{' '}
              <Link href="/legal/cookies" className="text-violet-400 hover:text-violet-300 transition-colors">
                Más información
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-700 transition-all"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
