/**
 * Layout para rutas autenticadas (platform).
 * El navbar global vive en el root layout.
 */
import { Footer } from '@/components/shared/Footer';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100svh_-_var(--app-nav-height))] w-full flex-col items-center">
      <main className="flex w-full flex-1 flex-col items-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
