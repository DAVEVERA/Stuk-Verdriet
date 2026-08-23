'use server';

import { requireAdminClient } from '@/lib/admin-authorization';
import type {
  AdminCustomer,
  AdminLogisticsEvent,
  AdminOrder,
  AdminReturn,
  AdminReview,
  AdminServiceQuestion,
  AdminUser,
  LegalDocument,
  FAQ,
  HostProfile,
  AdminUserRole,
  ContentStatus,
  MarketingItem,
  AISettings,
  Automation,
  MarketingItemStatus,
} from '@/types/content';

export async function getAdminCustomers() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('shop_customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error && data?.length) return data as AdminCustomer[];

  const { data: orders, error: ordersError } = await admin
    .from('shop_orders')
    .select('id, customer_email, status, total_cents, currency, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(25);

  if (ordersError || !orders?.length) return [] as AdminCustomer[];

  return orders.map((order) => ({
    id: order.id,
    name: order.customer_email ? order.customer_email.split('@')[0] : 'Klant',
    email: order.customer_email ?? null,
    phone: null,
    status: order.status === 'paid' ? 'active' : 'needs_follow_up',
    created_at: order.created_at,
    updated_at: order.updated_at,
    last_order_at: order.created_at,
    order_count: 1,
    total_spent_cents: Number(order.total_cents ?? 0),
    note: null,
    source: 'shop',
  })) as AdminCustomer[];
}

export async function getAdminOrders() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('shop_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [] as AdminOrder[];
  return (data ?? []) as AdminOrder[];
}

export async function getAdminReturns() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('shop_order_returns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25);

  if (!error && data?.length) return data as AdminReturn[];

  const { data: orders, error: ordersError } = await admin
    .from('shop_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25);

  if (ordersError || !orders?.length) return [] as AdminReturn[];

  return (orders as AdminOrder[])
    .filter((order) => order.status === 'cancelled' || order.status === 'refunded')
    .map((order) => ({
      id: `${order.id}-return`,
      order_id: order.id,
      customer_email: order.customer_email,
      customer_name: order.customer_email ? order.customer_email.split('@')[0] : null,
      reason: 'Retour aangevraagd via klantservice',
      status: 'requested',
      created_at: order.created_at,
      updated_at: order.updated_at,
      notes: order.fulfillment_notes ?? null,
    })) as AdminReturn[];
}

export async function getAdminReviews() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('shop_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25);

  if (!error && data?.length) return data as AdminReview[];

  return [] as AdminReview[];
}

export async function getAdminLogisticsEvents() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('shop_logistics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error && data?.length) return data as AdminLogisticsEvent[];

  return [] as AdminLogisticsEvent[];
}

export async function getAdminServiceQuestions() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('customer_questions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!error && data?.length) return data as AdminServiceQuestion[];

  return [] as AdminServiceQuestion[];
}

// === ADMIN USERS CRUD ===
export async function getAdminUsers() {
  const result = await getAdminUsersWithStatus();
  return result.users;
}

export async function getAdminUsersWithStatus() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching admin users:', error);
    return { users: [] as AdminUser[], error: error.message };
  }
  return { users: (data ?? []) as AdminUser[], error: null as string | null };
}

export async function addAdminUser(email: string, role: AdminUserRole) {
  const admin = await requireAdminClient({ manageAdminUsers: true });

  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await admin
    .from('admin_users')
    .insert({ email: cleanEmail, role })
    .select()
    .single();

  if (error) {
    console.error('Error adding admin user:', error);
    return { error: error.message };
  }
  return { success: true, data: data as AdminUser };
}

export async function removeAdminUser(id: string) {
  const admin = await requireAdminClient({ manageAdminUsers: true });

  const { error } = await admin.from('admin_users').delete().eq('id', id);

  if (error) {
    console.error('Error removing admin user:', error);
    return { error: error.message };
  }
  return { success: true };
}

export async function updateAdminUserRole(id: string, role: AdminUserRole) {
  const admin = await requireAdminClient({ manageAdminUsers: true });

  const { data, error } = await admin
    .from('admin_users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating admin role:', error);
    return { error: error.message };
  }
  return { success: true, data: data as AdminUser };
}

// === LEGAL DOCUMENTS CRUD ===
export async function getLegalDocuments() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('legal_documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching legal documents:', error);
    return [] as LegalDocument[];
  }
  return (data ?? []) as LegalDocument[];
}

export async function saveLegalDocument(
  id: string | null,
  title: string,
  slug: string,
  content: string,
  isVisible: boolean
) {
  const admin = await requireAdminClient();

  const docPayload = {
    title: title.trim(),
    slug: slug.trim().toLowerCase(),
    content,
    is_visible: isVisible,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await admin
      .from('legal_documents')
      .update(docPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating legal document:', error);
      return { error: error.message };
    }
    return { success: true, data: data as LegalDocument };
  } else {
    const { data, error } = await admin
      .from('legal_documents')
      .insert(docPayload)
      .select()
      .single();

    if (error) {
      console.error('Error inserting legal document:', error);
      return { error: error.message };
    }
    return { success: true, data: data as LegalDocument };
  }
}

export async function deleteLegalDocument(id: string) {
  const admin = await requireAdminClient();

  const { error } = await admin.from('legal_documents').delete().eq('id', id);

  if (error) {
    console.error('Error deleting legal document:', error);
    return { error: error.message };
  }
  return { success: true };
}

// === FAQS CRUD ===
export async function getAdminFaqs() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching FAQs:', error);
    return [] as FAQ[];
  }
  return (data ?? []) as FAQ[];
}

export async function saveFaq(
  id: string | null,
  question: string,
  answer: string,
  category: string | null,
  displayOrder: number,
  status: ContentStatus
) {
  const admin = await requireAdminClient();

  const faqPayload = {
    question: question.trim(),
    answer: answer.trim(),
    category: category ? category.trim() : null,
    display_order: displayOrder,
    status,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await admin
      .from('faqs')
      .update(faqPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as FAQ };
  } else {
    const { data, error } = await admin.from('faqs').insert(faqPayload).select().single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as FAQ };
  }
}

export async function deleteFaq(id: string) {
  const admin = await requireAdminClient();

  const { error } = await admin.from('faqs').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

// === HOSTS CRUD ===
export async function getAdminHosts() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('host_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching host profiles:', error);
    return [] as HostProfile[];
  }
  return (data ?? []) as HostProfile[];
}

export async function saveHost(
  id: string | null,
  name: string,
  role: string | null,
  imageUrl: string | null,
  bio: string | null,
  personalMotivation: string | null,
  displayOrder: number,
  status: ContentStatus
) {
  const admin = await requireAdminClient();

  const hostPayload = {
    name: name.trim(),
    role: role ? role.trim() : null,
    image_url: imageUrl ? imageUrl.trim() : null,
    bio: bio ? bio.trim() : null,
    personal_motivation: personalMotivation ? personalMotivation.trim() : null,
    display_order: displayOrder,
    status,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await admin
      .from('host_profiles')
      .update(hostPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as HostProfile };
  } else {
    const { data, error } = await admin.from('host_profiles').insert(hostPayload).select().single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as HostProfile };
  }
}

export async function deleteHost(id: string) {
  const admin = await requireAdminClient();

  const { error } = await admin.from('host_profiles').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

// === MARKETING ITEMS CRUD ===
export async function getAdminMarketingItems() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('marketing_items')
    .select('*')
    .order('date', { ascending: true })
    .limit(1000);

  if (error) {
    console.error('Error fetching marketing items:', error);
    return [] as MarketingItem[];
  }
  return (data ?? []) as MarketingItem[];
}

export async function saveMarketingItem(
  id: string | null,
  date: string,
  channel: string,
  title: string,
  status: MarketingItemStatus
) {
  const admin = await requireAdminClient();

  const payload = {
    date,
    channel: channel.trim(),
    title: title.trim(),
    status,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await admin
      .from('marketing_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as MarketingItem };
  } else {
    const { data, error } = await admin.from('marketing_items').insert(payload).select().single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as MarketingItem };
  }
}

export async function deleteMarketingItem(id: string) {
  const admin = await requireAdminClient();

  const { error } = await admin.from('marketing_items').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

// === CONTENTASSISTENT INSTELLINGEN ===
export async function getAISettings() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('ai_settings')
    .select('*')
    .eq('id', 'main')
    .maybeSingle();

  if (error || !data) {
    // Return a default object if row doesn't exist yet
    return {
      id: 'main',
      text_prompt:
        'Schrijf een warme Instagram-caption over een nieuw interview, zonder te zwaar te worden.',
      image_prompt:
        'Maak een serene social visual met vlinder, zachte natuur en ruimte voor echte HTML tekst.',
      tone_warmth: 82,
      tone_directness: 58,
      tone_hopeful: 74,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as AISettings;
  }
  return data as AISettings;
}

export async function saveAISettings(
  textPrompt: string,
  imagePrompt: string,
  toneWarmth: number,
  toneDirectness: number,
  toneHopeful: number
) {
  const admin = await requireAdminClient();

  const payload = {
    text_prompt: textPrompt,
    image_prompt: imagePrompt,
    tone_warmth: toneWarmth,
    tone_directness: toneDirectness,
    tone_hopeful: toneHopeful,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from('ai_settings')
    .upsert({ id: 'main', ...payload })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }
  return { success: true, data: data as AISettings };
}

// === AUTOMATIONS CRUD ===
export async function getAdminAutomations() {
  const admin = await requireAdminClient();

  const { data, error } = await admin
    .from('automations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching automations:', error);
    return [] as Automation[];
  }
  return (data ?? []) as Automation[];
}

export async function saveAutomation(
  id: string | null,
  triggerEvent: string,
  actionType: string,
  description: string,
  isActive: boolean
) {
  const admin = await requireAdminClient();

  const payload = {
    trigger_event: triggerEvent.trim(),
    action_type: actionType.trim(),
    description: description.trim(),
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data, error } = await admin
      .from('automations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as Automation };
  } else {
    const { data, error } = await admin.from('automations').insert(payload).select().single();

    if (error) {
      return { error: error.message };
    }
    return { success: true, data: data as Automation };
  }
}

export async function deleteAutomation(id: string) {
  const admin = await requireAdminClient();

  const { error } = await admin.from('automations').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
