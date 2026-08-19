import 'server-only';

import { cache } from 'react';
import { canManageAdminUsers } from '@/lib/admin-access';
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  getAdminRole,
} from '@/lib/supabase';

const getAuthenticatedAdminContext = cache(async () => {
  const server = await createSupabaseServerClient();
  const {
    data: { user },
  } = server ? await server.auth.getUser() : { data: { user: null } };

  if (!user?.email) {
    throw new Error('Log opnieuw in met een geautoriseerd Google-account.');
  }

  const role = await getAdminRole(user.email);
  if (!role) {
    throw new Error('Dit Google-account heeft geen toegang tot het adminportaal.');
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error('Supabase is niet volledig geconfigureerd.');
  }

  return { admin, role, user };
});

export async function requireAdminClient(options?: { manageAdminUsers?: boolean }) {
  const context = await getAuthenticatedAdminContext();

  if (options?.manageAdminUsers && !canManageAdminUsers(context.role)) {
    throw new Error('Alleen een hoofdbeheerder kan beheerders en rollen wijzigen.');
  }

  return context.admin;
}
