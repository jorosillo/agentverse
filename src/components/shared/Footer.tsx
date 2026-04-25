/**
 * Footer global de la aplicación.
 * Incluye enlaces legales (T&C, Privacidad, Cookies) y branding.
 * Fuente: AgentVerse.md — Sección Legal (HU-46).
 */
import Link from 'next/link';
import { Bot } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Agent<span className="text-violet-400">Verse</span>
            </span>
          </div>

          {/* Enlaces legales */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <Link
              href="/legal/terms"
              className="hover:text-gray-300 transition-colors"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/legal/cookies"
              className="hover:text-gray-300 transition-colors"
            >
              Política de Cookies
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} AgentVerse. Proyecto académico.
          </p>
        </div>
      </div>
    </footer>
  );
}
