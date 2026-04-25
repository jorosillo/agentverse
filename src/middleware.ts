/**
 * Next.js Middleware — Protección de rutas por autenticación.
 * 
 * Reglas:
 * - Rutas públicas (landing, legal, auth): acceso sin token
 * - Rutas de plataforma (/dashboard, /agents, /jobs, /messages, etc.): requieren JWT válido
 * - Rutas de auth (/login, /register): redirigen al dashboard si ya hay sesión
 * - API /cron/*: protegida con CRON_SECRET header
 */
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, SESSION_COOKIE_NAME } from '@/infrastructure/services/auth.service';

// ============================================================================
// CONFIGURACIÓN DE RUTAS
// ============================================================================

const PUBLIC_ROUTES = ['/', '/terms', '/privacy', '/cookies'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const CRON_ROUTES = ['/api/cron'];

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas de CRON: verificar CRON_SECRET
  if (CRON_ROUTES.some((route) => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Rutas públicas: permitir acceso directo
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de sesión
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Rutas de autenticación: si ya tiene sesión, redirigir al dashboard
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token) {
      const session = await verifyToken(token);
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Rutas protegidas: verificar token JWT
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifyToken(token);
  if (!session) {
    // Token inválido o expirado: limpiar cookie y redirigir
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // ============================================================================
  // RBAC (Role-Based Access Control)
  // ============================================================================
  
  // Un DEVELOPER no debe acceder a la creación/edición de ofertas de trabajo
  if (pathname.startsWith('/jobs/new') && session.role !== 'COMPANY') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Una COMPANY no debe acceder a la creación/edición de agentes de IA
  if (pathname.startsWith('/agents/new') && session.role !== 'DEVELOPER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Token válido: permitir acceso
  return NextResponse.next();
}

// ============================================================================
// CONFIGURACIÓN DEL MATCHER
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
