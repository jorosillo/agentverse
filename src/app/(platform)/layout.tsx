/**
 * Layout para rutas autenticadas (platform).
 * Incluye navbar autenticado + footer.
 */
import { PlatformNavbar } from '@/components/shared/PlatformNavbar';
import { Footer } from '@/components/shared/Footer';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PlatformNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
