/**
 * Navbar global interactivo.
 * Cambia navegación y acciones según exista sesión autenticada.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Briefcase,
  Cpu,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logout } from '@/server-actions/auth.actions';
import type { SessionUser } from '@/lib/types';

interface AppNavbarClientProps {
  session: SessionUser | null;
}

const AUTH_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agentes', icon: Cpu },
  { href: '/jobs', label: 'Ofertas', icon: Briefcase },
  { href: '/messages', label: 'Mensajes', icon: MessageSquare },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavbarClient({ session }: AppNavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = Boolean(session);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="navbar-container">
        <div className="flex h-[var(--app-nav-height)] items-center justify-between gap-4">
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            onClick={closeMobile}
            className="group flex min-w-0 items-center gap-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 transition-shadow group-hover:shadow-violet-600/40">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="truncate text-lg font-bold tracking-tight text-white">
              Agent<span className="text-violet-400">Verse</span>
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden items-center gap-1 lg:flex">
              {AUTH_NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none focus-visible:ring-1 focus-visible:ring-violet-500 ${active
                      ? 'bg-violet-600/15 text-white border border-violet-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${isActivePath(pathname, '/profile')
                    ? 'border-violet-500/20 bg-violet-600/15 text-white'
                    : 'border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                  aria-label="Mi perfil"
                >
                  <UserCircle className="h-5 w-5" />
                </Link>
                <Link
                  href="/settings"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${isActivePath(pathname, '/settings')
                    ? 'border-violet-500/20 bg-violet-600/15 text-white'
                    : 'border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                  aria-label="Configuración"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-400 transition-all hover:border-red-500/10 hover:bg-red-600/5 hover:text-red-400"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="md">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar-container absolute left-0 right-0 top-[var(--app-nav-height)] border-b border-white/10 bg-[#0a0a0f]/95 py-4 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex w-full flex-col gap-2">
            {isAuthenticated ? (
              <>
                {AUTH_NAV_ITEMS.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active
                        ? 'bg-violet-600/15 text-white border border-violet-500/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="mt-2 border-t border-white/5 pt-2">
                  <Link
                    href="/profile"
                    onClick={closeMobile}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <UserCircle className="h-4 w-4" />
                    Mi perfil
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMobile}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-all hover:bg-red-600/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile}>
                  <Button variant="ghost" size="md" fullWidth>
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobile}>
                  <Button variant="primary" size="md" fullWidth>
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
