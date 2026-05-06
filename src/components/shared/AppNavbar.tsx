/**
 * Navbar global de AgentVerse.
 * Lee la sesión en servidor y delega la interacción al cliente.
 */
import { getCurrentSession } from '@/server-actions/auth.actions';
import { AppNavbarClient } from './AppNavbarClient';

export async function AppNavbar() {
  const session = await getCurrentSession();

  return <AppNavbarClient session={session} />;
}
