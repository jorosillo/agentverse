/**
 * Layout compartido para las páginas de autenticación.
 * Fondo oscuro con glow + centrado vertical.
 */
import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mini navbar */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Agent<span className="text-violet-400">Verse</span>
          </span>
        </Link>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Mesh Gradient Glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] opacity-40 animate-pulse duration-[4000ms]" />
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] opacity-40" />
        </div>

        {children}
      </main>
    </div>
  );
}
