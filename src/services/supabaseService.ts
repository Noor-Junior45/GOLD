import { supabase } from '../lib/supabaseClient';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Order, OrderStatus, WiringServiceBooking, SavedAddress, UserProfile, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { soundService } from './sound';
import { showToast } from '../utils/toast';

// Offline Sync Queue Types & Constants
export interface PendingSyncItem {
  id: string;
  type: 'profile' | 'address' | 'delete_address' | 'upi' | 'delete_upi' | 'service_booking' | 'order';
  payload: any;
  userScope?: string;
  timestamp: number;
}

const PENDING_SYNC_STORAGE_KEY = 'giriraj_pending_sync_queue_v1';

export function getPendingSyncQueue(): PendingSyncItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(PENDING_SYNC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingSyncQueue(queue: PendingSyncItem[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('Error saving sync queue:', err);
  }
}

export function enqueuePendingSync(item: Omit<PendingSyncItem, 'id' | 'timestamp'>): void {
  const queue = getPendingSyncQueue();
  const newItem: PendingSyncItem = {
    ...item,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now()
  };
  // Avoid duplicate queue entries for the same entity
  const filtered = queue.filter(
    (q) => !(q.type === newItem.type && JSON.stringify(q.payload?.id || q.payload?.user_id) === JSON.stringify(newItem.payload?.id || newItem.payload?.user_id))
  );
  filtered.push(newItem);
  savePendingSyncQueue(filtered);
}

/**
 * Retries and drains any pending sync items when connection is re-established
 */
export async function retryPendingSync(): Promise<number> {
  const queue = getPendingSyncQueue();
  if (queue.length === 0) return 0;

  const remaining: PendingSyncItem[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      if (item.type === 'profile') {
        const { user_id, ...profileData } = item.payload;
        const res = await syncUserProfileToSupabase(user_id, profileData);
        if (!res.success) remaining.push(item);
        else syncedCount++;
      } else if (item.type === 'address') {
        const res = await syncAddressDirect(item.payload);
        if (!res.success) remaining.push(item);
        else syncedCount++;
      } else if (item.type === 'delete_address') {
        const res = await syncDeleteAddressDirect(item.payload.id, item.payload.userId);
        if (!res.success) remaining.push(item);
        else syncedCount++;
      } else if (item.type === 'service_booking') {
        const res = await syncServiceBookingDirect(item.payload);
        if (!res.success) remaining.push(item);
        else syncedCount++;
      } else if (item.type === 'upi') {
        const res = await syncUpiDirect(item.payload.upiId, item.payload.userId);
        if (!res.success) remaining.push(item);
        else syncedCount++;
      } else if (item.type === 'delete_upi') {
        const res = await syncDeleteUpiDirect(item.payload.upiId, item.payload.userId);
        if (!res.success) remaining.push(item);
        else syncedCount++;
      }
    } catch {
      remaining.push(item);
    }
  }

  savePendingSyncQueue(remaining);

  if (syncedCount > 0) {
    showToast(`Online: ${syncedCount} local change${syncedCount > 1 ? 's' : ''} synced to cloud.`, 'success');
  }

  return syncedCount;
}

// Auto-bind online event listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    retryPendingSync().catch(() => {});
  });
  // Trigger on load
  setTimeout(() => {
    retryPendingSync().catch(() => {});
  }, 3000);
}

// Helper direct sync functions used by retry engine
async function syncAddressDirect(rowPayload: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('saved_addresses').upsert(rowPayload, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

async function syncDeleteAddressDirect(id: string, userId?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabase.from('saved_addresses').delete().eq('id', id);
    if (userId) query = query.eq('user_id', userId);
    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

async function syncServiceBookingDirect(bookingPayload: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('wiring_service_bookings').insert(bookingPayload);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

async function syncUpiDirect(upiId: string, userId?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('saved_upi_ids').upsert({
      upi_id: upiId,
      user_id: userId || null,
      created_at: new Date().toISOString()
    }, { onConflict: 'upi_id,user_id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

async function syncDeleteUpiDirect(upiId: string, userId?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    let query = supabase.from('saved_upi_ids').delete().eq('upi_id', upiId);
    if (userId) query = query.eq('user_id', userId);
    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Local storage key constants
export const USER_PHONE_KEY = 'giriraj_user_phone';
export const USER_NAME_KEY = 'giriraj_user_name';
export const USER_EMAIL_KEY = 'giriraj_user_email';
export const USER_PHOTO_KEY = 'giriraj_user_photo';
export const USER_DOB_KEY = 'giriraj_user_dob';
export const USER_EMAIL_VERIFIED_KEY = 'giriraj_user_email_verified';
export const USER_WALLET_BALANCE_KEY = 'giriraj_user_wallet_balance';
export const USER_REFUND_BALANCE_KEY = 'giriraj_user_refund_balance';
export const USER_CASHBACK_BALANCE_KEY = 'giriraj_user_cashback_balance';
export const SAVED_ADDRESSES_STORAGE_KEY = 'giriraj_user_addresses_v4';
export const ACTIVE_SAVED_ADDRESS_KEY = 'giriraj_active_address_v4';
export const SAVED_UPI_STORAGE_KEY = 'giriraj_user_saved_upi';
export const ORDERS_STORAGE_KEY = 'giriraj_orders_v2';

// In-memory active user scope to prevent cross-account data leakage
let activeUserScope: string | null = null;

export function setActiveUserScope(scope: string | null): void {
  activeUserScope = scope;
}

export function getActiveUserScope(): string | null {
  return activeUserScope;
}

export function getUserScopeKeyFromUser(user?: { id?: string; email?: string | null; phone?: string | null } | null): string | null {
  if (!user) return null;
  if (user.id) return `uid_${user.id}`;
  if (user.email && user.email.trim()) return `email_${user.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  if (user.phone && user.phone.trim()) return `phone_${user.phone.replace(/\D/g, '')}`;
  return null;
}

/**
 * Purges legacy unscoped global localStorage keys to permanently eliminate cross-user data leakage
 */
export function purgeLegacyUnscopedStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const legacyKeys = [
      'giriraj_user_phone',
      'giriraj_user_name',
      'giriraj_user_email',
      'giriraj_user_photo',
      'giriraj_user_dob',
      'giriraj_user_email_verified',
      'giriraj_user_wallet_balance',
      'giriraj_user_refund_balance',
      'giriraj_user_cashback_balance',
      'giriraj_user_addresses_v4',
      'giriraj_active_address_v4',
      'giriraj_active_address',
      'giriraj_active_landmark',
      'giriraj_user_saved_upi',
      'giriraj_orders_v2',
      'giriraj_customer_orders',
      'giriraj_orders_cache',
      'giriraj_saved_items_v1',
      'giriraj_master_orders'
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }
}

// Auto-purge legacy shared keys once on load
if (typeof window !== 'undefined') {
  purgeLegacyUnscopedStorage();
}

// Safe LocalStorage helpers for SSR / sandboxed iframe environments
export function safeGetItem(key: string): string | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
  } catch (e) {
    console.warn(`Error reading from localStorage key "${key}":`, e);
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`Error writing to localStorage key "${key}":`, e);
  }
}

export function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`Error removing from localStorage key "${key}":`, e);
  }
}

// ============================================================================
// TASK 2: SUPABASE AUTHENTICATION (Google OAuth + Mobile OTP + Email & Password)
// ============================================================================

/**
 * 1. Email & Password Sign-in using Supabase
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    });

    if (error) {
      return { user: null, session: null, error };
    }

    if (data.user) {
      const userMeta = data.user.user_metadata || {};
      const name = userMeta.full_name || userMeta.name || email.split('@')[0] || 'Customer';
      saveUserProfile({
        email: data.user.email,
        name,
        emailVerified: !!data.user.email_confirmed_at || !!data.user.confirmed_at
      });
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { user: null, session: null, error };
  }
}

/**
 * 2. Email & Password Sign-up / Registration using Supabase
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: User | null; session: Session | null; error: Error | null; requiresEmailVerification?: boolean }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName?.trim() || 'Giriraj Customer'
        }
      }
    });

    if (error) {
      return { user: null, session: null, error };
    }

    const requiresEmailVerification = !data.session && !!data.user;

    if (data.user) {
      const name = fullName?.trim() || email.split('@')[0] || 'Customer';
      saveUserProfile({
        email: data.user.email,
        name,
        emailVerified: !requiresEmailVerification
      });
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
      requiresEmailVerification
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { user: null, session: null, error };
  }
}

/**
 * 3. Send Password Reset Email using Supabase
 */
export async function resetPasswordForEmail(
  email: string
): Promise<{ error: Error | null; success: boolean }> {
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo
    });

    if (error) {
      return { error, success: false };
    }
    return { error: null, success: true };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { error, success: false };
  }
}

/**
 * 4. Google OAuth Sign-in using Supabase
 */
export async function signInWithGoogle(): Promise<{ error: Error | null; url?: string | null }> {
  try {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: isIframe,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      console.error('Supabase Google OAuth error:', error);
      return { error };
    }

    if (isIframe && data?.url) {
      // In an iframe preview (like AI Studio canvas), open in a new window to bypass iframe 403 security blocks
      const authWindow = window.open(data.url, '_blank');
      if (!authWindow) {
        window.location.href = data.url;
      }
    }

    return { error: null, url: data.url };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected Google OAuth error:', error);
    return { error };
  }
}

/**
 * 2. Send SMS OTP to Mobile Phone number using Supabase Phone Auth
 */
export async function sendPhoneOtp(rawPhone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanDigits = rawPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    // Format with E.164 country code (India +91)
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      console.warn('Supabase Phone OTP notice:', error.message);
      // If SMS provider not yet activated in dashboard, return friendly message while allowing dev flow
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * 3. Verify SMS OTP using Supabase Phone Auth
 */
export async function verifyPhoneOtp(
  rawPhone: string,
  token: string
): Promise<{ user: User | null; session: Session | null; error?: string }> {
  try {
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'sms'
    });

    if (error) {
      console.warn('Supabase verifyOtp notice:', error.message);
      return { user: null, session: null, error: error.message };
    }

    if (data.user) {
      // Sync user profile immediately
      const defaultName = data.user.user_metadata?.full_name || 'Giriraj Customer';
      saveUserProfile({
        phone: formattedPhone,
        name: defaultName,
        email: data.user.email
      });
    }

    return { user: data.user, session: data.session };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { user: null, session: null, error: msg };
  }
}

/**
 * 4. Sign Out from Supabase
 */
export async function signOutUser(): Promise<void> {
  try {
    clearUserProfile();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Supabase sign out error:', error);
  } finally {
    clearUserProfile();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('giriraj_user_logged_out'));
    }
  }
}

/**
 * 5. Global Auth State Listener & Initial Session Getter
 */
export async function getInitialAuthSession(): Promise<{ session: Session | null; user: User | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Initial session notice:', error.message);
      return { session: null, user: null };
    }
    return { session: data.session, user: data.session?.user || null };
  } catch (err) {
    console.warn('Session fetch error:', err);
    return { session: null, user: null };
  }
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null, user: User | null) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user || null;

    if (event === 'SIGNED_OUT' || (!session && !user && event !== 'INITIAL_SESSION')) {
      clearUserProfile();
      setActiveUserScope(null);
      callback(event, null, null);
      return;
    }

    if (user) {
      const scope = getUserScopeKeyFromUser(user);
      setActiveUserScope(scope);

      // Extract profile details strictly for this authenticated user
      const userMeta = user.user_metadata || {};
      const localProf = scope ? getSavedUserProfile(scope) : null;
      const phone = user.phone || userMeta.phone || localProf?.phone || '';
      const name = userMeta.full_name || userMeta.name || userMeta.custom_claims?.name || localProf?.name || (user.email ? user.email.split('@')[0] : 'Customer');
      const email = user.email || userMeta.email || localProf?.email || '';
      const photoURL = userMeta.avatar_url || userMeta.picture || localProf?.photoURL || undefined;
      const emailVerified = !!user.email_confirmed_at || !!user.confirmed_at;

      saveUserProfile(
        {
          phone,
          name,
          email,
          photoURL,
          emailVerified
        },
        scope || undefined
      );

      // Also upsert profile row to Supabase `user_profiles` table
      syncUserProfileToSupabase(user.id, {
        phone,
        full_name: name,
        email,
        avatar_url: photoURL
      }).catch((e) => console.warn('Background profile sync:', e));
    }
    callback(event, session, user);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Syncs user profile data into Supabase `user_profiles` table with RLS and server-side backup
 */
export async function syncUserProfileToSupabase(
  userId: string,
  profile: { phone?: string; full_name?: string; email?: string; avatar_url?: string; dob?: string }
): Promise<{ success: boolean; error?: string }> {
  const payload = {
    user_id: userId,
    phone: profile.phone || null,
    full_name: profile.full_name || null,
    email: profile.email || null,
    avatar_url: profile.avatar_url || null,
    dob: profile.dob || null,
    updated_at: new Date().toISOString()
  };

  // 1. Also sync to server API backup
  try {
    fetch('/api/user-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch {}

  // 2. Direct Supabase Upsert
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.warn('user_profiles upsert notice:', error.message);
      enqueuePendingSync({
        type: 'profile',
        payload
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn('Profile sync error:', msg);
    enqueuePendingSync({
      type: 'profile',
      payload
    });
    return { success: false, error: msg };
  }
}

/**
 * Fetch profile directly from Supabase `user_profiles` table
 */
export async function fetchUserProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      const mappedProfile: UserProfile = {
        name: data.full_name || 'Customer',
        phone: data.phone || '',
        email: data.email || '',
        emailVerified: true,
        photoURL: data.avatar_url || undefined,
        dob: data.dob || undefined,
        walletBalance: Number(data.wallet_balance || 0),
        refundBalance: Number(data.refund_balance || 0),
        cashbackBalance: Number(data.cashback_balance || 0)
      };

      const scope = `uid_${userId}`;
      safeSetItem(`giriraj_profile_${scope}`, JSON.stringify(mappedProfile));
      return mappedProfile;
    }
  } catch (err) {
    console.warn('Error fetching profile from Supabase:', err);
  }
  return null;
}

/**
 * Get saved user profile from storage & current Supabase session
 */
export function getSavedUserProfile(userScopeOverride?: string): UserProfile | null {
  const scope = userScopeOverride || activeUserScope;
  if (!scope) {
    return null;
  }

  const raw = safeGetItem(`giriraj_profile_${scope}`);
  if (!raw) {
    return null;
  }

  try {
    const prof: UserProfile = JSON.parse(raw);
    if (!prof.phone && !prof.email && (!prof.name || prof.name === 'Customer')) {
      return null;
    }
    return prof;
  } catch {
    return null;
  }
}

/**
 * Save user profile updates to local state (offline-first) and Supabase
 */
export async function saveUserProfile(
  data: {
    phone?: string;
    name?: string;
    email?: string;
    emailVerified?: boolean;
    photoURL?: string;
    dob?: string;
    refundBalance?: number;
    cashbackBalance?: number;
  },
  userScopeOverride?: string
): Promise<{ success: boolean; profile: UserProfile; error?: string }> {
  const scope =
    userScopeOverride ||
    activeUserScope ||
    (data.email ? getUserScopeKeyFromUser({ email: data.email }) : null) ||
    (data.phone ? getUserScopeKeyFromUser({ phone: data.phone }) : null);

  const existing = (scope ? getSavedUserProfile(scope) : null) || {
    name: 'Customer',
    phone: '',
    email: '',
    emailVerified: false,
    walletBalance: 0,
    refundBalance: 0,
    cashbackBalance: 0
  };

  const effectiveEmail = data.email !== undefined ? data.email : existing.email;

  const updated: UserProfile = {
    ...existing,
    phone: data.phone !== undefined ? data.phone : existing.phone,
    name: data.name !== undefined ? data.name : existing.name,
    email: effectiveEmail,
    emailVerified: data.emailVerified !== undefined ? data.emailVerified : existing.emailVerified,
    photoURL: data.photoURL !== undefined ? data.photoURL : existing.photoURL,
    dob: data.dob !== undefined ? data.dob : existing.dob,
    refundBalance: data.refundBalance !== undefined ? data.refundBalance : existing.refundBalance,
    cashbackBalance: data.cashbackBalance !== undefined ? data.cashbackBalance : existing.cashbackBalance,
    walletBalance:
      (data.refundBalance !== undefined ? data.refundBalance : existing.refundBalance || 0) +
      (data.cashbackBalance !== undefined ? data.cashbackBalance : existing.cashbackBalance || 0)
  };

  if (scope) {
    safeSetItem(`giriraj_profile_${scope}`, JSON.stringify(updated));
  }

  // Also save to generic backup if scope wasn't set yet
  if (data.phone) {
    const phoneScope = `phone_${data.phone.replace(/\D/g, '')}`;
    safeSetItem(`giriraj_profile_${phoneScope}`, JSON.stringify(updated));
  }
  if (data.email) {
    const emailScope = `email_${data.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    safeSetItem(`giriraj_profile_${emailScope}`, JSON.stringify(updated));
  }

  // Synchronize to Supabase & Backend API
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      const syncResult = await syncUserProfileToSupabase(authData.user.id, {
        phone: data.phone,
        full_name: data.name,
        email: data.email,
        avatar_url: data.photoURL,
        dob: data.dob
      });
      return { success: syncResult.success, profile: updated, error: syncResult.error };
    }
  } catch (err: any) {
    return { success: true, profile: updated };
  }

  return { success: true, profile: updated };
}

export function clearUserProfile(): void {
  // We detach the active in-memory session on log out, but MUST NOT delete
  // the user's persisted orders or saved addresses from localStorage.
  // This ensures that when the user logs back in with their account, their
  // full order history and addresses are immediately preserved and restored.
  activeUserScope = null;
}

// ============================================================================
// TASK 3: PER-USER ORDERS & REAL-TIME DATA ISOLATION (Supabase Database)
// ============================================================================

type OrderListener = (orders: Order[]) => void;
const orderListeners: Set<OrderListener> = new Set();
let ordersChannel: ReturnType<typeof supabase.channel> | null = null;

function isRealOrder(order: Order): boolean {
  if (!order || !order.id) return false;
  if (order.id.includes('7001') || order.id.toLowerCase().includes('demo')) return false;
  if (order.customerName === 'Anindya Chatterjee') return false;
  return true;
}

export function doesOrderBelongToUser(
  order: any,
  user?: { id?: string | null; email?: string | null; phone?: string | null; user_metadata?: any } | null
): boolean {
  if (!order || !isRealOrder(order)) return false;
  if (!user || !user.id) return false;

  // 1. Check exact user_id match
  if (order.user_id && String(order.user_id) === String(user.id)) {
    return true;
  }
  if (order.userId && String(order.userId) === String(user.id)) {
    return true;
  }

  // 2. Check exact email match (case-insensitive)
  const uEmail = (user.email || user.user_metadata?.email || '').trim().toLowerCase();
  const oEmail = (order.customerEmail || order.customer_email || order.recipient_email || order.recipientEmail || '').trim().toLowerCase();
  if (uEmail && oEmail && uEmail.includes('@') && uEmail === oEmail) {
    return true;
  }

  // 3. Check exact 10-digit phone match
  const rawUPhone = user.phone || user.user_metadata?.phone || '';
  const uPhone = rawUPhone.replace(/\D/g, '').slice(-10);
  const rawOPhone = order.phone || order.recipient_phone || order.recipientPhone || order.customerPhone || '';
  const oPhone = rawOPhone.replace(/\D/g, '').slice(-10);
  if (uPhone && oPhone && uPhone.length === 10 && uPhone === oPhone) {
    return true;
  }

  return false;
}

export function getDeletedOrderIds(): Set<string> {
  try {
    const raw = safeGetItem('giriraj_deleted_order_ids');
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markOrderAsDeleted(orderId: string): void {
  try {
    const set = getDeletedOrderIds();
    set.add(String(orderId));
    safeSetItem('giriraj_deleted_order_ids', JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Error saving deleted order id:', e);
  }
}

export function unmarkOrderAsDeleted(orderId: string): void {
  try {
    const set = getDeletedOrderIds();
    if (set.has(String(orderId))) {
      set.delete(String(orderId));
      safeSetItem('giriraj_deleted_order_ids', JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.warn('Error unmarking deleted order id:', e);
  }
}

export function markAllOrdersAsDeleted(orderIds: string[]): void {
  try {
    const set = getDeletedOrderIds();
    orderIds.forEach((id) => set.add(String(id)));
    safeSetItem('giriraj_deleted_order_ids', JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Error saving deleted order ids list:', e);
  }
}

export function getStoredOrders(userScopeOverride?: string): Order[] {
  try {
    const scope = userScopeOverride || activeUserScope;
    // Strict isolation: Never return any orders if there is no active user scope
    if (!scope) {
      return [];
    }

    const raw = safeGetItem(`giriraj_orders_${scope}`);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deletedIds = getDeletedOrderIds();
    return parsed
      .filter(isRealOrder)
      .filter((o) => !deletedIds.has(String(o.id)));
  } catch (e) {
    console.error('Failed reading orders from storage', e);
    return [];
  }
}

export function clearAllStoredOrders(): void {
  try {
    if (activeUserScope) {
      localStorage.removeItem(`giriraj_orders_${activeUserScope}`);
    }
    notifyOrderListeners([]);
  } catch (e) {
    console.error('Failed clearing orders', e);
  }
}

function notifyOrderListeners(orders: Order[]) {
  orderListeners.forEach((listener) => {
    try {
      listener(orders);
    } catch (e) {
      console.error('Error notifying order listener', e);
    }
  });
}

// Global fetch helper for orders - strictly isolates per authenticated user
export async function fetchUserOrders(): Promise<Order[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    // If not logged in, strictly return empty orders array to prevent any cross-account data leak
    if (!userData?.user?.id) {
      if (!activeUserScope) {
        notifyOrderListeners([]);
        return [];
      }
      const stored = getStoredOrders(activeUserScope);
      notifyOrderListeners(stored);
      return stored;
    }

    const user = userData.user;
    const scope = getUserScopeKeyFromUser(user);
    if (scope) {
      activeUserScope = scope;
    }

    const userEmail = (user.email || user.user_metadata?.email || '').trim().toLowerCase();
    const rawPhone = user.phone || user.user_metadata?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    const orClauses: string[] = [`user_id.eq.${user.id}`];
    if (userEmail && userEmail.includes('@')) {
      orClauses.push(`customer_email.ilike.${userEmail}`);
      orClauses.push(`recipient_email.ilike.${userEmail}`);
    }
    if (cleanPhone && cleanPhone.length === 10) {
      orClauses.push(`phone.eq.${cleanPhone}`);
      orClauses.push(`phone.eq.+91${cleanPhone}`);
      orClauses.push(`recipient_phone.eq.${cleanPhone}`);
      orClauses.push(`recipient_phone.eq.+91${cleanPhone}`);
    }

    let query = supabase.from('orders').select('*');
    if (orClauses.length === 1) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.or(orClauses.join(','));
    }

    const { data, error } = await query.order('updated_at', { ascending: false }).limit(50);
    const localOrders = getStoredOrders(scope || undefined);

    if (!error && Array.isArray(data)) {
      // Filter strictly by user ownership so that no other user's order can ever pass
      const dbOrders: Order[] = data
        .filter((row) => doesOrderBelongToUser(row, user))
        .map((row) => ({
          id: String(row.id),
          customerName: row.recipient_name || row.customer_name || 'Customer',
          recipientName: row.recipient_name || row.customer_name || 'Customer',
          phone: row.recipient_phone || row.phone || '',
          recipientPhone: row.recipient_phone || row.phone || '',
          customerEmail: row.recipient_email || row.customer_email || undefined,
          recipientEmail: row.recipient_email || row.customer_email || undefined,
          address: [row.address_line1, row.address_line2, row.city, row.pincode].filter(Boolean).join(', ') || row.address || row.delivery_address || '',
          addressLine1: row.address_line1,
          addressLine2: row.address_line2,
          city: row.city || 'Kolkata',
          state: row.state || 'West Bengal',
          area: row.address_line2 || row.area || 'Salt Lake Sector V',
          landmark: row.delivery_notes || row.landmark || undefined,
          deliveryNotes: row.delivery_notes || row.landmark || undefined,
          pincode: row.pincode || '700091',
          items: row.items || [],
          itemTotal: Number(row.subtotal ?? row.item_total ?? 0),
          subtotal: Number(row.subtotal ?? row.item_total ?? 0),
          deliveryFee: Number(row.delivery_fee || 0),
          handlingFee: Number(row.handling_fee || 0),
          fees: Number(row.fees ?? ((row.delivery_fee || 0) + (row.handling_fee || 0))),
          discount: Number(row.discount_amount ?? row.discount ?? 0),
          discountAmount: Number(row.discount_amount ?? row.discount ?? 0),
          couponCode: row.coupon_code || null,
          totalAmount: Number(row.total_amount || 0),
          paymentMethod: (row.payment_method || 'cod').toLowerCase() as any,
          paymentStatus: (row.payment_status || 'pending').toLowerCase() as any,
          status: row.status || 'pending',
          createdAt: row.placed_at || row.updated_at || row.created_at || new Date().toISOString(),
          placed_at: row.placed_at || row.created_at || undefined,
          packed_at: row.packed_at || undefined,
          out_for_delivery_at: row.out_for_delivery_at || row.dispatched_at || undefined,
          delivered_at: row.delivered_at || undefined,
          placedAt: row.placed_at || row.created_at || undefined,
          packedAt: row.packed_at || undefined,
          outForDeliveryAt: row.out_for_delivery_at || row.dispatched_at || undefined,
          deliveredAt: row.delivered_at || undefined,
          estimatedDeliveryTimestamp: Number(row.estimated_delivery_timestamp || Date.now() + 3600000),
          deliveryPartner: row.delivery_partner || undefined,
          notes: row.delivery_notes || row.notes || undefined
        })).filter(isRealOrder);

      // Merge DB orders and local orders strictly for this user
      const mergedMap = new Map<string, Order>();
      dbOrders.forEach((o) => mergedMap.set(o.id, o));
      localOrders
        .filter((o) => doesOrderBelongToUser(o, user))
        .forEach((o) => {
          if (!mergedMap.has(o.id)) {
            mergedMap.set(o.id, o);
          }
        });

      const deletedIds = getDeletedOrderIds();
      const finalOrders = Array.from(mergedMap.values())
        .filter((o) => !deletedIds.has(String(o.id)))
        .sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

      if (scope) {
        safeSetItem(`giriraj_orders_${scope}`, JSON.stringify(finalOrders));
      }
      notifyOrderListeners(finalOrders);
      return finalOrders;
    } else {
      const deletedIds = getDeletedOrderIds();
      const validLocal = localOrders
        .filter((o) => doesOrderBelongToUser(o, user))
        .filter((o) => !deletedIds.has(String(o.id)));
      notifyOrderListeners(validLocal);
      return validLocal;
    }
  } catch (err) {
    console.warn('Supabase orders fetch notice:', err);
    const scope = activeUserScope;
    const fallback = scope ? getStoredOrders(scope) : [];
    notifyOrderListeners(fallback);
    return fallback;
  }
}

/**
 * Fetch and Subscribe to Orders from Supabase with per-user data isolation
 */
export function subscribeToOrders(listener: OrderListener): () => void {
  orderListeners.add(listener);
  // Send user-scoped cached state first for immediate UI display
  const initial = activeUserScope ? getStoredOrders(activeUserScope) : [];
  listener(initial);

  // Fetch initial orders for the active user
  fetchUserOrders();

  // Initialize singleton channel only once across all subscribers
  if (!ordersChannel) {
    ordersChannel = supabase
      .channel('orders_realtime_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchUserOrders();
        }
      )
      .subscribe();
  }

  return () => {
    orderListeners.delete(listener);
    if (orderListeners.size === 0 && ordersChannel) {
      supabase.removeChannel(ordersChannel);
      ordersChannel = null;
    }
  };
}

/**
 * Creates an order in Supabase `orders` table attaching the user's ID
 */
export async function createFirestoreOrder(order: Order): Promise<Order> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;
  const scope =
    getUserScopeKeyFromUser(authData?.user) ||
    (order.customerEmail ? getUserScopeKeyFromUser({ email: order.customerEmail }) : null) ||
    (order.phone ? getUserScopeKeyFromUser({ phone: order.phone }) : null);

  // If this order ID was previously in deleted list, remove it from blacklist
  if (order.id) {
    unmarkOrderAsDeleted(order.id);
  }

  if (scope) {
    activeUserScope = scope;
    const currentOrders = getStoredOrders(scope);
    const updatedOrders = [order, ...currentOrders.filter((o) => o.id !== order.id)];
    safeSetItem(`giriraj_orders_${scope}`, JSON.stringify(updatedOrders));
    notifyOrderListeners(updatedOrders);
  }

  // Also persist by specific scoped key if authenticated
  if (authData?.user?.id) {
    const uOrders = getStoredOrders(`uid_${authData.user.id}`);
    safeSetItem(`giriraj_orders_uid_${authData.user.id}`, JSON.stringify([order, ...uOrders.filter((o) => o.id !== order.id)]));
  }

  // Sound chime alert
  soundService.playNewOrderChime();

  // 1. Submit through the Idempotent & Validated Server Pipeline
  try {
    const idempotencyKey = `idemp_${order.id}_${order.totalAmount}`;
    const apiRes = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        ...order,
        idempotencyKey
      })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data?.order) {
        // Backend pipeline validated and confirmed order
      }
    }
  } catch (apiErr) {
    console.warn('Backend /api/order pipeline notice (direct client sync active):', apiErr);
  }

  // 2. Prepare comprehensive item representations with color & variant details
  const formattedItemsForDb = (Array.isArray(order.items) ? order.items : []).map((item) => {
    const color = item.selectedColor || item.product?.selectedColor || undefined;
    const baseName = item.product?.name || 'Electrical Item';
    const displayName = color ? `${baseName} (${color} Color)` : baseName;
    return {
      quantity: item.quantity || 1,
      selectedColor: color,
      color: color,
      product: {
        ...(item.product || {}),
        name: displayName,
        selectedColor: color
      }
    };
  });

  const itemsSummaryText = formattedItemsForDb
    .map((it) => {
      const colStr = it.selectedColor ? ` [${it.selectedColor}]` : '';
      return `${it.quantity}x ${it.product?.name || 'Item'}${colStr}`;
    })
    .join(', ');

  // 3. Insert into Supabase `orders` and `order_items` tables
  const orderRowPayload: Record<string, any> = {
    user_id: userId,
    status: 'pending',
    recipient_name: order.recipientName || order.customerName,
    recipient_phone: order.recipientPhone || order.phone,
    recipient_email: order.recipientEmail || order.customerEmail || null,
    address_line1: order.addressLine1 || order.address,
    address_line2: order.addressLine2 || order.area || '',
    city: order.city || 'Kolkata',
    state: order.state || 'West Bengal',
    pincode: order.pincode,
    address_label: order.addressLabel || 'Home',
    delivery_notes: order.deliveryNotes || order.landmark || order.notes || null,
    items: formattedItemsForDb,
    subtotal: order.subtotal ?? order.itemTotal,
    discount_amount: order.discountAmount ?? order.discount ?? 0,
    fees: order.fees ?? ((order.deliveryFee || 0) + (order.handlingFee || 0)),
    total_amount: order.totalAmount,
    coupon_code: order.couponCode || null,
    payment_method: (order.paymentMethod || 'COD').toUpperCase(),
    payment_status: order.paymentStatus || 'pending',
    placed_at: order.createdAt || new Date().toISOString(),
    updated_at: order.createdAt || new Date().toISOString(),
    packed_at: null,
    delivered_at: null,
    estimated_delivery_timestamp: order.estimatedDeliveryTimestamp,
    delivery_partner: order.deliveryPartner || null,
    notes: order.notes || null
  };

  let insertedOrder: any = null;

  // Step 1: Insert into `orders` table
  const { data: orderData, error: orderInsertError } = await supabase
    .from('orders')
    .insert(orderRowPayload)
    .select()
    .single();

  if (orderInsertError) {
    console.warn('Primary orders insert returned error, testing compatibility format:', orderInsertError.message);
    // Compatibility fallback in case table has legacy column names
    const legacyRowPayload: Record<string, any> = {
      id: order.id,
      user_id: userId,
      customer_name: order.customerName,
      phone: order.phone,
      customer_email: order.customerEmail || null,
      address: order.address,
      area: order.area,
      landmark: order.landmark || null,
      pincode: order.pincode,
      items: formattedItemsForDb,
      item_total: order.itemTotal,
      delivery_fee: order.deliveryFee,
      handling_fee: order.handlingFee,
      discount: order.discount,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      status: order.status,
      updated_at: order.createdAt || new Date().toISOString(),
      placed_at: order.createdAt || new Date().toISOString(),
      packed_at: null,
      delivered_at: null,
      estimated_delivery_timestamp: order.estimatedDeliveryTimestamp,
      delivery_partner: order.deliveryPartner || null,
      notes: order.notes || null
    };

    const { data: legacyData, error: legacyError } = await supabase
      .from('orders')
      .insert(legacyRowPayload)
      .select()
      .single();

    if (legacyError) {
      console.error('Fatal error inserting into orders table:', legacyError);
      throw new Error(`Failed to save order to Supabase: ${legacyError.message || orderInsertError.message}`);
    }
    insertedOrder = legacyData;
  } else {
    insertedOrder = orderData;
  }

  const savedOrderId = insertedOrder?.id || order.id;

  // Step 2: Insert one row into `order_items` for EACH item in cart
  if (Array.isArray(order.items) && order.items.length > 0) {
    const orderItemsPayload = order.items.map((item) => {
      const color = item.selectedColor || item.product?.selectedColor || undefined;
      const baseName = item.product?.name || 'Item';
      const displayName = color ? `${baseName} (${color} Color)` : baseName;
      return {
        order_id: savedOrderId,
        product_id: item.product?.id ? String(item.product.id) : null,
        product_name: displayName,
        product_image: item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]) || null,
        brand: item.product?.brand || 'Giriraj Power',
        unit: item.product?.unit || 'piece',
        quantity: item.quantity || 1,
        price_at_purchase: item.product?.price || 0
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.warn('Notice inserting into order_items table (items persisted in orders.items):', itemsError.message);
    }
  }

  // Secure stock decrement via PostgreSQL function
  if (Array.isArray(order.items) && order.items.length > 0) {
    for (const item of order.items) {
      if (!item?.product?.id) continue;
      try {
        await supabase.rpc('decrement_stock', {
          p_product_id: String(item.product.id),
          p_quantity: item.quantity || 1,
          p_order_id: String(savedOrderId)
        });
      } catch (stockErr) {
        console.warn(`Stock decrement note for ${item.product.id}:`, stockErr);
      }
    }
  }

  const finalSavedOrder: Order = {
    ...order,
    id: String(savedOrderId)
  };

  // Analytics event
  if (typeof (window as unknown as { trackGirirajEvent?: (name: string, p: object) => void }).trackGirirajEvent === 'function') {
    (window as unknown as { trackGirirajEvent: (name: string, p: object) => void }).trackGirirajEvent('purchase', {
      transaction_id: order.id,
      value: order.totalAmount,
      currency: 'INR',
      shipping: order.deliveryFee,
      items: order.items.map((i) => ({
        item_id: i.product.id,
        item_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity
      }))
    });
  }

  return order;
}

/**
 * Updates order status in Supabase
 */
export async function updateOrderStatusInFirestore(orderId: string, newStatus: OrderStatus): Promise<boolean> {
  let updatedDeliveryPartner = undefined;

  if (newStatus === 'out_for_delivery') {
    updatedDeliveryPartner = {
      name: 'Bikash Mondal ⚡',
      phone: '+91 87774 00280',
      vehicleNumber: 'WB 07 C 1089',
      currentHub: 'Giriraj Power Kasba Hub'
    };
  }

  if (activeUserScope) {
    const currentOrders = getStoredOrders(activeUserScope);
    const updatedOrders = currentOrders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          deliveryPartner: updatedDeliveryPartner || o.deliveryPartner
        };
      }
      return o;
    });

    safeSetItem(`giriraj_orders_${activeUserScope}`, JSON.stringify(updatedOrders));
    notifyOrderListeners(updatedOrders);
  }

  try {
    const updatePayload: Record<string, unknown> = {
      status: newStatus
    };
    if (updatedDeliveryPartner) {
      updatePayload.delivery_partner = updatedDeliveryPartner;
    }
    await supabase.from('orders').update(updatePayload).eq('id', orderId);
    return true;
  } catch (error) {
    console.warn('Supabase update order error:', error);
    return false;
  }
}

export const updateOrderStatusInSupabase = updateOrderStatusInFirestore;

/**
 * Delete a specific order from Supabase (orders + order_items), Server API, and local caches
 */
export async function deleteFirestoreOrder(orderId: string): Promise<boolean> {
  if (!orderId) return false;

  // 1. Mark ID in persistent deletion blacklist so it can never reappear
  markOrderAsDeleted(orderId);

  // 2. Remove from active user's local storage key immediately for responsive UI
  try {
    if (activeUserScope) {
      const currentOrders = getStoredOrders(activeUserScope);
      const filtered = currentOrders.filter((o) => String(o.id) !== String(orderId));
      safeSetItem(`giriraj_orders_${activeUserScope}`, JSON.stringify(filtered));
      notifyOrderListeners(filtered);
    }
  } catch (storageErr) {
    console.warn('Local storage order deletion notice:', storageErr);
  }

  // 3. Call Server Backend API to delete with elevated DB permissions
  try {
    fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
      headers: { 'Cache-Control': 'no-cache' }
    }).catch((apiErr) => console.warn('Server order delete API notice:', apiErr));
  } catch (err) {
    console.warn('Server delete call notice:', err);
  }

  // 4. Delete from Supabase Database client (`order_items` then `orders`)
  try {
    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
    } catch (itemDelErr) {
      console.warn('Supabase order_items delete note:', itemDelErr);
    }

    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.warn('Supabase order delete error:', error.message);
    }
  } catch (error) {
    console.warn('Error deleting order from database:', error);
  }

  // 5. Re-fetch remaining orders to ensure local and DB sync
  try {
    const remaining = await fetchUserOrders();
    notifyOrderListeners(remaining);
  } catch {
    const fallback = activeUserScope ? getStoredOrders(activeUserScope) : [];
    notifyOrderListeners(fallback);
  }
  return true;
}

export const deleteOrder = deleteFirestoreOrder;
export const deleteOrderFromFirestore = deleteFirestoreOrder;

/**
 * Clear all order history for the current user across Supabase, Server API, and local storage
 */
export async function clearAllUserOrders(): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    const userId = user?.id;

    // 1. Mark all existing orders as deleted in persistent blacklist
    const currentOrders = activeUserScope ? getStoredOrders(activeUserScope) : [];
    const orderIdsToClear = currentOrders.map((o) => String(o.id));
    if (orderIdsToClear.length > 0) {
      markAllOrdersAsDeleted(orderIdsToClear);
    }

    // 2. Clear current user's local storage order records immediately
    if (activeUserScope) {
      safeRemoveItem(`giriraj_orders_${activeUserScope}`);
    }

    // 3. Immediately notify listeners with empty array for instant UI feedback
    notifyOrderListeners([]);

    // 4. Call Server Backend API to clear orders with elevated DB privileges
    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.set('userId', userId);
      if (user?.email) queryParams.set('email', user.email);
      if (user?.phone) queryParams.set('phone', user.phone);

      fetch(`/api/orders?${queryParams.toString()}`, {
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' }
      }).catch(() => {
        // Fallback POST
        fetch('/api/orders/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            email: user?.email,
            phone: user?.phone,
            orderIds: orderIdsToClear
          })
        }).catch(console.warn);
      });
    } catch (apiErr) {
      console.warn('Server clear orders API notice:', apiErr);
    }

    // 5. Delete all user orders from Supabase Client if logged in
    if (userId) {
      try {
        const { data: userOrderRows } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', userId);

        if (userOrderRows && userOrderRows.length > 0) {
          const orderIds = userOrderRows.map((r) => r.id);
          await supabase.from('order_items').delete().in('order_id', orderIds);
        }

        await supabase.from('orders').delete().eq('user_id', userId);
      } catch (dbErr) {
        console.warn('Supabase clear user orders notice:', dbErr);
      }
    }

    return true;
  } catch (error) {
    console.warn('Error clearing all user orders:', error);
    notifyOrderListeners([]);
    return true;
  }
}

/**
 * Service Booking in Supabase & Server API Backup
 */
export async function createFirestoreServiceBooking(booking: WiringServiceBooking): Promise<{ success: boolean; error?: string }> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;

  const payload = {
    id: booking.id,
    user_id: userId,
    service_title: booking.serviceTitle,
    service_category: booking.serviceCategory,
    project_type: booking.projectType,
    approx_area_sq_ft: booking.approxAreaSqFt,
    preferred_date: booking.preferredDate,
    preferred_time_slot: booking.preferredTimeSlot,
    site_address: booking.siteAddress,
    area: booking.area,
    pincode: booking.pincode,
    contact_name: booking.contactName,
    contact_phone: booking.contactPhone,
    contact_email: booking.contactEmail || null,
    estimated_price: booking.estimatedPrice,
    wire_grade: booking.wireGrade,
    notes: booking.notes || null,
    status: booking.status,
    created_at: booking.createdAt
  };

  // 1. Server API backup call
  try {
    fetch('/api/service-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch {}

  // 2. Direct Supabase insert
  try {
    const { error } = await supabase.from('wiring_service_bookings').insert(payload);
    if (error) {
      console.warn('wiring_service_bookings insert notice:', error.message);
      enqueuePendingSync({
        type: 'service_booking',
        payload
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.warn('Supabase service booking error:', msg);
    enqueuePendingSync({
      type: 'service_booking',
      payload
    });
    return { success: false, error: msg };
  }
}

// ============================================================================
// SAVED ADDRESSES (Server-Side Storage + Supabase `saved_addresses` table with RLS)
// ============================================================================

type AddressListener = (addresses: SavedAddress[]) => void;
const addressListeners: Set<AddressListener> = new Set();
let addressesChannel: ReturnType<typeof supabase.channel> | null = null;
let hasInitiatedInitialAddressFetch = false;

export function getStoredAddresses(userScopeOverride?: string): SavedAddress[] {
  try {
    const scope = userScopeOverride || activeUserScope;
    const collected: SavedAddress[] = [];
    const seenIds = new Set<string>();

    const addAddresses = (list: any) => {
      if (!Array.isArray(list)) return;
      for (const a of list) {
        if (a && a.id && !seenIds.has(a.id)) {
          seenIds.add(a.id);
          collected.push(a);
        }
      }
    };

    // 1. Check scoped storage if scope is known
    if (scope) {
      const raw = localStorage.getItem(`giriraj_addrs_${scope}`);
      if (raw) {
        try {
          addAddresses(JSON.parse(raw));
        } catch {}
      }
    }

    // 2. Check general fallback storage
    const generalRaw = localStorage.getItem('giriraj_saved_addresses');
    if (generalRaw) {
      try {
        addAddresses(JSON.parse(generalRaw));
      } catch {}
    }

    // 3. Check any other address keys in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('giriraj_addrs_')) {
          const rawK = localStorage.getItem(k);
          if (rawK) {
            try {
              addAddresses(JSON.parse(rawK));
            } catch {}
          }
        }
      }
    }

    // 4. Check active address key as single fallback
    const activeStored = localStorage.getItem(ACTIVE_SAVED_ADDRESS_KEY);
    if (activeStored) {
      try {
        const activeObj = JSON.parse(activeStored);
        if (activeObj && activeObj.id && !seenIds.has(activeObj.id)) {
          seenIds.add(activeObj.id);
          collected.push(activeObj);
        }
      } catch {}
    }

    // If local storage was cleared / empty, trigger server fetch asynchronously to restore addresses
    if (collected.length === 0 && !hasInitiatedInitialAddressFetch) {
      hasInitiatedInitialAddressFetch = true;
      setTimeout(() => {
        fetchUserAddresses().catch(() => {});
      }, 50);
    }

    return collected;
  } catch (e) {
    console.error('Error reading saved addresses:', e);
    return [];
  }
}

export async function fetchUserAddresses(): Promise<SavedAddress[]> {
  try {
    let authUser: User | null = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      authUser = authData?.user || null;
    } catch {
      // ignore
    }

    const scope = (authUser ? getUserScopeKeyFromUser(authUser) : null) || activeUserScope;
    if (scope) {
      activeUserScope = scope;
    }

    const savedProf = scope ? getSavedUserProfile(scope) : getSavedUserProfile();
    const userPhone = authUser?.phone || savedProf?.phone || '';
    const userEmail = authUser?.email || savedProf?.email || '';
    const userId = authUser?.id || '';

    const collectedMap = new Map<string, SavedAddress>();

    // 1. Fetch from Server API (Persistent Server Storage)
    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.set('userId', userId);
      if (userPhone) queryParams.set('phone', userPhone);
      if (userEmail) queryParams.set('email', userEmail);
      if (scope) queryParams.set('userScope', scope);

      const serverRes = await fetch(`/api/saved-addresses?${queryParams.toString()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (serverRes.ok) {
        const json = await serverRes.json();
        if (json.success && Array.isArray(json.addresses)) {
          for (const row of json.addresses) {
            if (row && row.id) {
              collectedMap.set(row.id, {
                id: row.id,
                tag: row.tag || 'home',
                tagLabel: row.tagLabel || row.tag_label || undefined,
                houseName: row.houseName || row.house_name || '',
                houseFlat: row.houseFlat || row.house_flat || '',
                buildingRoad: row.buildingRoad || row.building_road || '',
                landmark: row.landmark || undefined,
                area: row.area || row.area_data || {
                  name: row.area_name || 'Kasba',
                  pincode: row.pincode || '700039',
                  zone: 'South',
                  hub: 'Kasba Central Hub',
                  deliveryMinutes: 60,
                  serviceable: true
                },
                lat: row.lat,
                lng: row.lng,
                formattedExactAddress: row.formattedExactAddress || row.formatted_exact_address,
                receiverName: row.receiverName || row.receiver_name,
                receiverPhone: row.receiverPhone || row.receiver_phone,
                createdAt: row.createdAt || row.created_at || new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (serverErr) {
      console.warn('Server address fetch notice:', serverErr);
    }

    // 2. Fetch from Supabase `saved_addresses` table if user is logged in
    if (authUser?.id) {
      try {
        const { data, error } = await supabase
          .from('saved_addresses')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && Array.isArray(data)) {
          for (const row of data) {
            if (row && row.id) {
              collectedMap.set(row.id, {
                id: row.id,
                tag: row.tag || 'home',
                tagLabel: row.tag_label || undefined,
                houseName: row.house_name || '',
                houseFlat: row.house_flat || '',
                buildingRoad: row.building_road || '',
                landmark: row.landmark || undefined,
                area: row.area_data || {
                  name: row.area_name || 'Kasba',
                  pincode: row.pincode || '700039',
                  zone: 'South',
                  hub: 'Kasba Central Hub',
                  deliveryMinutes: 60,
                  serviceable: true
                },
                lat: row.lat,
                lng: row.lng,
                formattedExactAddress: row.formatted_exact_address,
                receiverName: row.receiver_name,
                receiverPhone: row.receiver_phone,
                createdAt: row.created_at
              });
            }
          }
        }
      } catch (sbErr) {
        console.warn('Supabase address fetch notice:', sbErr);
      }
    }

    const list = Array.from(collectedMap.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (list.length > 0) {
      if (scope) {
        safeSetItem(`giriraj_addrs_${scope}`, JSON.stringify(list));
      }
      safeSetItem('giriraj_saved_addresses', JSON.stringify(list));
      
      const activeRaw = safeGetItem(ACTIVE_SAVED_ADDRESS_KEY);
      if (!activeRaw && list.length > 0) {
        safeSetItem(ACTIVE_SAVED_ADDRESS_KEY, JSON.stringify(list[0]));
      }
    }

    notifyAddressListeners(list);
    return list;
  } catch (e) {
    console.warn('Addresses fetch notice:', e);
  }
  return [];
}

function notifyAddressListeners(addresses: SavedAddress[]) {
  addressListeners.forEach((l) => {
    try {
      l(addresses);
    } catch (e) {
      console.warn('Address listener notice:', e);
    }
  });
}

export function subscribeToAddresses(listener: AddressListener): () => void {
  addressListeners.add(listener);
  const stored = getStoredAddresses();
  listener(stored);

  fetchUserAddresses();

  if (!addressesChannel) {
    addressesChannel = supabase
      .channel('addresses_realtime_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'saved_addresses' },
        () => fetchUserAddresses()
      )
      .subscribe();
  }

  return () => {
    addressListeners.delete(listener);
    if (addressListeners.size === 0 && addressesChannel) {
      supabase.removeChannel(addressesChannel);
      addressesChannel = null;
    }
  };
}

export async function saveAddressToFirestore(address: SavedAddress): Promise<{ success: boolean; error?: string }> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;
  const scope = getUserScopeKeyFromUser(authData?.user) || activeUserScope;
  const savedProf = scope ? getSavedUserProfile(scope) : getSavedUserProfile();

  const current = getStoredAddresses(scope || undefined).filter((a) => a.id !== address.id);
  const updated = [address, ...current];

  if (scope) {
    safeSetItem(`giriraj_addrs_${scope}`, JSON.stringify(updated));
    safeSetItem(`giriraj_active_addr_${scope}`, JSON.stringify(address));
  }
  safeSetItem('giriraj_saved_addresses', JSON.stringify(updated));
  safeSetItem(ACTIVE_SAVED_ADDRESS_KEY, JSON.stringify(address));
  notifyAddressListeners(updated);

  const rowPayload = {
    id: address.id,
    user_id: userId,
    userId: userId,
    userScope: scope,
    tag: address.tag,
    tag_label: address.tagLabel || null,
    tagLabel: address.tagLabel || null,
    house_name: address.houseName,
    houseName: address.houseName,
    house_flat: address.houseFlat,
    houseFlat: address.houseFlat,
    building_road: address.buildingRoad,
    buildingRoad: address.buildingRoad,
    landmark: address.landmark || null,
    area_name: address.area?.name || 'Kolkata',
    pincode: address.area?.pincode || '700001',
    area_data: address.area,
    area: address.area,
    lat: address.lat || null,
    lng: address.lng || null,
    formatted_exact_address: address.formattedExactAddress || null,
    formattedExactAddress: address.formattedExactAddress || null,
    receiver_name: address.receiverName || savedProf?.name || null,
    receiverName: address.receiverName || savedProf?.name || null,
    receiver_phone: address.receiverPhone || savedProf?.phone || null,
    receiverPhone: address.receiverPhone || savedProf?.phone || null,
    receiverEmail: savedProf?.email || null,
    created_at: address.createdAt || new Date().toISOString(),
    createdAt: address.createdAt || new Date().toISOString()
  };

  // 1. Server API persistent storage call (Server-side storage survives cache clears)
  let serverSuccess = false;
  try {
    const res = await fetch('/api/saved-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowPayload)
    });
    if (res.ok) {
      serverSuccess = true;
    }
  } catch (err) {
    console.warn('Server address save notice:', err);
  }

  // 2. Direct Supabase Upsert
  try {
    const { error } = await supabase.from('saved_addresses').upsert({
      id: rowPayload.id,
      user_id: rowPayload.user_id,
      tag: rowPayload.tag,
      tag_label: rowPayload.tag_label,
      house_name: rowPayload.house_name,
      house_flat: rowPayload.house_flat,
      building_road: rowPayload.building_road,
      landmark: rowPayload.landmark,
      area_name: rowPayload.area_name,
      pincode: rowPayload.pincode,
      area_data: rowPayload.area_data,
      lat: rowPayload.lat,
      lng: rowPayload.lng,
      formatted_exact_address: rowPayload.formatted_exact_address,
      receiver_name: rowPayload.receiver_name,
      receiver_phone: rowPayload.receiver_phone,
      created_at: rowPayload.created_at
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save address notice:', error.message);
      enqueuePendingSync({
        type: 'address',
        payload: rowPayload
      });
      return { success: serverSuccess, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn('Supabase save address error:', msg);
    enqueuePendingSync({
      type: 'address',
      payload: rowPayload
    });
    return { success: serverSuccess || true, error: msg };
  }
}

export async function deleteAddressFromFirestore(id: string): Promise<{ success: boolean; error?: string }> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;
  const scope = getUserScopeKeyFromUser(authData?.user) || activeUserScope;

  const current = getStoredAddresses(scope || undefined);
  const updated = current.filter((a) => a.id !== id);
  if (scope) {
    safeSetItem(`giriraj_addrs_${scope}`, JSON.stringify(updated));
  }
  safeSetItem('giriraj_saved_addresses', JSON.stringify(updated));

  const activeRaw = safeGetItem(ACTIVE_SAVED_ADDRESS_KEY);
  if (activeRaw) {
    try {
      const activeObj = JSON.parse(activeRaw);
      if (activeObj?.id === id) {
        if (updated.length > 0) {
          safeSetItem(ACTIVE_SAVED_ADDRESS_KEY, JSON.stringify(updated[0]));
        } else {
          localStorage.removeItem(ACTIVE_SAVED_ADDRESS_KEY);
        }
      }
    } catch {}
  }

  notifyAddressListeners(updated);

  // 1. Call Server Delete API
  try {
    fetch(`/api/saved-addresses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Cache-Control': 'no-cache' }
    }).catch(() => {
      fetch('/api/saved-addresses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(console.warn);
    });
  } catch (apiErr) {
    console.warn('Server delete address notice:', apiErr);
  }

  // 2. Delete from Supabase client
  try {
    let query = supabase.from('saved_addresses').delete().eq('id', id);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      enqueuePendingSync({
        type: 'delete_address',
        payload: { id, userId }
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn('Supabase delete address error:', msg);
    enqueuePendingSync({
      type: 'delete_address',
      payload: { id, userId }
    });
    return { success: true };
  }
}

// ============================================================================
// SAVED UPI IDS (Supabase `saved_upi_ids` table with RLS)
// ============================================================================

type UpiListener = (upis: string[]) => void;
const upiListeners = new Set<UpiListener>();

export function getStoredUpiIds(userScopeOverride?: string): string[] {
  try {
    const scope = userScopeOverride || activeUserScope;
    if (!scope) return [];
    const raw = localStorage.getItem(`giriraj_upi_${scope}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function notifyUpiListeners(upis: string[]) {
  upiListeners.forEach((l) => {
    try {
      l(upis);
    } catch (e) {
      // ignore
    }
  });
}

export function subscribeToUpiIds(listener: UpiListener): () => void {
  upiListeners.add(listener);
  listener(getStoredUpiIds());

  async function fetchUpiIds() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        notifyUpiListeners([]);
        return;
      }
      const scope = getUserScopeKeyFromUser(authData.user);
      const { data, error } = await supabase
        .from('saved_upi_ids')
        .select('upi_id')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (!error && data) {
        const list = data.map((r) => r.upi_id).filter(Boolean);
        if (scope) {
          safeSetItem(`giriraj_upi_${scope}`, JSON.stringify(list));
        }
        notifyUpiListeners(list);
      }
    } catch (e) {
      console.warn('UPI fetch note:', e);
    }
  }

  fetchUpiIds();

  return () => {
    upiListeners.delete(listener);
  };
}

export async function saveUpiToFirestore(upiId: string): Promise<{ success: boolean; error?: string }> {
  const cleanUpi = upiId.trim().toLowerCase();
  if (!cleanUpi) return { success: false, error: 'Empty UPI ID' };
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;
  const scope = getUserScopeKeyFromUser(authData?.user) || activeUserScope;

  if (scope) {
    const current = getStoredUpiIds(scope).filter((u) => u.toLowerCase() !== cleanUpi);
    const updated = [cleanUpi, ...current];
    safeSetItem(`giriraj_upi_${scope}`, JSON.stringify(updated));
    notifyUpiListeners(updated);
  }

  try {
    const { error } = await supabase.from('saved_upi_ids').upsert({
      upi_id: cleanUpi,
      user_id: userId,
      created_at: new Date().toISOString()
    }, { onConflict: 'upi_id,user_id' });

    if (error) {
      enqueuePendingSync({
        type: 'upi',
        payload: { upiId: cleanUpi, userId }
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn('Supabase save upi error:', msg);
    enqueuePendingSync({
      type: 'upi',
      payload: { upiId: cleanUpi, userId }
    });
    return { success: false, error: msg };
  }
}

export async function deleteUpiFromFirestore(upiId: string): Promise<{ success: boolean; error?: string }> {
  const cleanUpi = upiId.trim().toLowerCase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id || null;
  const scope = getUserScopeKeyFromUser(authData?.user) || activeUserScope;

  if (scope) {
    const current = getStoredUpiIds(scope);
    const updated = current.filter((u) => u.toLowerCase() !== cleanUpi);
    safeSetItem(`giriraj_upi_${scope}`, JSON.stringify(updated));
    notifyUpiListeners(updated);
  }

  try {
    let query = supabase.from('saved_upi_ids').delete().eq('upi_id', cleanUpi);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      enqueuePendingSync({
        type: 'delete_upi',
        payload: { upiId: cleanUpi, userId }
      });
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn('Supabase delete upi error:', msg);
    enqueuePendingSync({
      type: 'delete_upi',
      payload: { upiId: cleanUpi, userId }
    });
    return { success: false, error: msg };
  }
}

// ============================================================================
// TASK: SUPABASE PRODUCTS CATALOG SYNC & MANAGEMENT
// ============================================================================

/**
 * Saves/syncs all catalog products into Supabase `products` table
 */
export async function syncAllProductsToSupabase(
  customProducts?: Product[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const productsToSync = customProducts || INITIAL_PRODUCTS;
    const rows = productsToSync.map((p) => {
      const price = Number(p.price || 0);
      const mrp = Number(p.originalPrice || price);
      const discount = Number(p.discountPercentage || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0));
      return {
        id: String(p.id),
        name: p.name,
        brand: p.brand,
        category: p.category || 'electrical',
        subcategory: p.subCategory || 'General',
        sub_category: p.subCategory || 'General',
        price,
        mrp,
        original_price: mrp,
        discount_percent: discount,
        discount_percentage: discount,
        unit: p.unit || '1 pc',
        rating_avg: p.rating || 4.8,
        rating: p.rating || 4.8,
        rating_count: p.reviewsCount || 50,
        reviews_count: p.reviewsCount || 50,
        delivery_minutes: p.deliveryMinutes || 30,
        image: p.image,
        image_urls: [p.image || 'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=800&auto=format&fit=crop'],
        in_stock: p.inStock ?? true,
        stock_quantity: p.stockCount || 50,
        stock_count: p.stockCount || 50,
        tags: p.tags || [],
        is_emergency: !!p.isEmergency,
        is_best_seller: !!p.isBestSeller,
        specs: p.specs || {},
        specifications: p.specs || {},
        description: p.description || '',
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('products')
      .upsert(rows, { onConflict: 'id' });

    // Also run targeted update for Dalda pipe
    await updateOrMigrateDaldaPipeInSupabase();

    if (error) {
      console.warn('Supabase products upsert notice:', error.message);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: rows.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Error syncing products to Supabase:', msg);
    return { success: false, count: 0, error: msg };
  }
}

/**
 * Dedicated database migration function that updates any 'Dada pipe' row in Supabase
 * to '3/4" Dalda PVC Conduit Pipe' and replaces its old photo with https://i.imgur.com/G9LIx1R.jpeg
 */
export async function updateOrMigrateDaldaPipeInSupabase(): Promise<{ success: boolean; updatedCount: number }> {
  try {
    const newImage = 'https://i.imgur.com/G9LIx1R.jpeg';
    const newName = '3/4" Dalda PVC Conduit Pipe (10 Ft Length, Heavy Duty)';
    const newSpecs = {
      Size: '3/4 Inch (20mm)',
      Brand: 'Dalda',
      Length: '10 Feet (3 Metres)',
      Material: 'Heavy Virgin Rigid PVC',
      Standard: 'IS 9537 Part 3',
      'Available Colors': 'Ivory/White, Black, Grey, Blue, Red, Yellow',
      Application: 'Concealed RCC Slab Casting & Wall Chasing Wiring'
    };

    // 1. Search for any existing products in Supabase matching "dada" (case-insensitive)
    const { data: dadaProducts } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', '%dada%');

    let updatedCount = 0;

    if (dadaProducts && dadaProducts.length > 0) {
      for (const p of dadaProducts) {
        await supabase
          .from('products')
          .update({
            name: newName,
            brand: 'Dalda',
            image: newImage,
            image_urls: [newImage],
            sub_category: 'Pipes',
            subcategory: 'Pipes',
            specs: newSpecs,
            specifications: newSpecs,
            updated_at: new Date().toISOString()
          })
          .eq('id', p.id);
        updatedCount++;
      }
    }

    // 2. Also ensure standard 'p-dalda-pipe-3-4' exists in Supabase
    await supabase.from('products').upsert({
      id: 'p-dalda-pipe-3-4',
      name: newName,
      brand: 'Dalda',
      category: 'electrical',
      sub_category: 'Pipes',
      subcategory: 'Pipes',
      price: 65,
      mrp: 80,
      original_price: 80,
      discount_percent: 19,
      discount_percentage: 19,
      unit: '1 Piece (10ft)',
      rating_avg: 4.9,
      rating: 4.9,
      rating_count: 118,
      reviews_count: 118,
      delivery_minutes: 30,
      image: newImage,
      image_urls: [newImage],
      in_stock: true,
      stock_quantity: 350,
      stock_count: 350,
      tags: ['pipe', 'dalda', 'pvc', 'conduit', '3/4 pipe', 'dalda pipe', 'electrical'],
      is_best_seller: true,
      specs: newSpecs,
      specifications: newSpecs,
      description: 'High-durability 3/4" Dalda rigid PVC conduit pipe with high impact strength, shock protection, and flame-retardant formulation for residential and commercial building electrical conduit routing.',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    return { success: true, updatedCount };
  } catch (err) {
    console.warn('Notice updating Dalda pipe in Supabase:', err);
    return { success: false, updatedCount: 0 };
  }
}

// Auto-run migration once on client initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    updateOrMigrateDaldaPipeInSupabase().catch(() => {});
  }, 1000);
}

/**
 * Fetches live products strictly from Supabase `products` table (Strict Database Mode)
 */
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  try {
    // Run migration guarantee
    updateOrMigrateDaldaPipeInSupabase().catch(() => {});

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) {
      return data.map((row) => {
        const rawImageUrls: string[] = Array.isArray(row.image_urls)
          ? row.image_urls.filter((u: any) => typeof u === 'string' && u.trim().length > 0)
          : typeof row.image_urls === 'string' && row.image_urls.startsWith('http')
          ? [row.image_urls]
          : [];

        if (row.image && typeof row.image === 'string' && row.image.trim() && !rawImageUrls.includes(row.image.trim())) {
          rawImageUrls.unshift(row.image.trim());
        }

        const primaryImage =
          rawImageUrls[0] ||
          row.image ||
          'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=800&auto=format&fit=crop';
        const finalImages = rawImageUrls.length > 0 ? rawImageUrls : [primaryImage];

        return {
          id: String(row.id),
          name: row.name || 'Product',
          brand: row.brand || 'Giriraj Genuine',
          category: row.category || 'electrical',
          subCategory: row.sub_category || row.subcategory || row.subCategory || 'General',
          price: Number(row.price || 0),
          originalPrice: Number(row.original_price || row.originalPrice || row.mrp || (row.price ? row.price * 1.15 : 0)),
          discountPercentage: Number(row.discount_percentage || row.discountPercentage || 0),
          unit: row.unit || '1 pc',
          rating: Number(row.rating || row.rating_avg || 4.8),
          reviewsCount: Number(row.reviews_count || row.rating_count || 50),
          deliveryMinutes: Number(row.delivery_minutes || row.deliveryMinutes || 30),
          image: primaryImage,
          images: finalImages,
          image_urls: finalImages,
          inStock: row.in_stock ?? row.inStock ?? true,
          stockCount: Number(row.stock_count || row.stock_quantity || 50),
          tags: row.tags || [],
          isEmergency: !!(row.is_emergency ?? row.isEmergency),
          isBestSeller: !!(row.is_best_seller ?? row.isBestSeller),
          specs: row.specs || (typeof row.specifications === 'object' ? row.specifications : {}),
          description: row.description || ''
        };
      });
    }
  } catch (err) {
    console.warn('Supabase products fetch error:', err);
  }

  return [];
}

