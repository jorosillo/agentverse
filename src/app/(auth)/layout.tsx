/**
 * Layout compartido para las páginas de autenticación.
 * El navbar global vive en el root layout.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100svh_-_var(--app-nav-height))] flex-col">
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-[var(--page-inline-padding)] py-8 sm:py-12">
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
