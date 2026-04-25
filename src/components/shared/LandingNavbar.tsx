/**
 * Navbar para usuarios no autenticados (Landing page).
 * Logo + nombre a la izquierda, botones login/register a la derecha.
 * Fuente: AgentVerse.md — Disposición del navbar.
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bot, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y nombre */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 transition-shadow group-hover:shadow-violet-600/40">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Agent<span className="text-violet-400">Verse</span>
            </span>
          </Link>

          {/* Desktop: Botones de auth */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-white/5 py-4 space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="sm" fullWidth>
                Registrarse
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
