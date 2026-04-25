/**
 * Navbar autenticado para la plataforma.
 * Muestra avatar, nombre del usuario y enlaces de navegación.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  LayoutDashboard,
  Cpu,
  Briefcase,
  MessageSquare,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { logout } from '@/server-actions/auth.actions';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agentes', icon: Cpu },
  { href: '/jobs', label: 'Ofertas', icon: Briefcase },
  { href: '/messages', label: 'Mensajes', icon: MessageSquare },
];

export function PlatformNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 transition-shadow group-hover:shadow-violet-600/40">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">
              Agent<span className="text-violet-400">Verse</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side: user menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
            <Link
              href="/settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-600/5 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-3 mt-3 space-y-1">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <UserCircle className="h-4 w-4" />
                Mi perfil
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-600/5 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
