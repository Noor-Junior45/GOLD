import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
  RegistrationError
} from '@capacitor/push-notifications';
import { apiUrl } from '../lib/apiBase';

export interface PushNotificationPayload {
  orderId?: string;
  status?: string;
  url?: string;
  type?: 'order_update' | 'delivery_alert' | 'promo';
  [key: string]: any;
}

export interface PushServiceState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permissionStatus: string;
}

const PUSH_TOKEN_KEY = 'giriraj_push_token_v1';
const PUSH_CHANNEL_ID = 'order_updates';

type NavigationHandler = (targetPath: string, orderId?: string) => void;
let globalNavigationHandler: NavigationHandler | null = null;
let isInitialized = false;

/**
 * Register the device token with the backend server
 */
export async function syncPushTokenWithServer(token: string, userId?: string, userEmail?: string) {
  try {
    const platform = Capacitor.getPlatform();
    const endpoint = apiUrl('/api/push/register-token');
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform,
        userId: userId || localStorage.getItem('giriraj_active_user_scope') || 'guest',
        userEmail: userEmail || localStorage.getItem('giriraj_user_email') || null,
        registeredAt: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.warn('Server push token registration notice:', err);
    });
  } catch (err) {
    console.warn('Could not sync push token with server:', err);
  }
}

/**
 * Configure Android notification channels for High-Priority Order Alerts
 */
async function configureAndroidNotificationChannels() {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    await PushNotifications.createChannel({
      id: PUSH_CHANNEL_ID,
      name: 'Order Status & Delivery Updates',
      description: 'Instant updates regarding your Kolkata building & electrical orders and 60-minute deliveries',
      importance: 5, // High importance (heads-up popups and sound)
      visibility: 1, // Public on lockscreen
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#00B050',
    });
  } catch (err) {
    console.warn('Error creating Android notification channel:', err);
  }
}

/**
 * Initialize Push Notifications listener and registration lifecycle
 */
export async function initPushNotifications(onNavigate?: NavigationHandler): Promise<PushServiceState> {
  if (onNavigate) {
    globalNavigationHandler = onNavigate;
  }

  const isNative = Capacitor.isNativePlatform();
  if (!isNative) {
    // For desktop / web fallback
    const savedToken = localStorage.getItem(PUSH_TOKEN_KEY);
    return {
      isSupported: false,
      isRegistered: !!savedToken,
      token: savedToken,
      permissionStatus: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    };
  }

  if (isInitialized) {
    const currentToken = localStorage.getItem(PUSH_TOKEN_KEY);
    return {
      isSupported: true,
      isRegistered: !!currentToken,
      token: currentToken,
      permissionStatus: 'granted'
    };
  }

  try {
    // 1. Create Android Notification Channel safely
    await configureAndroidNotificationChannels().catch((e) => console.warn('Channel config notice:', e));

    // 2. Remove any previous listeners to avoid duplicates
    await PushNotifications.removeAllListeners().catch(() => {});

    // 3. Registration Success Listener
    await PushNotifications.addListener('registration', async (token: Token) => {
      try {
        const pushToken = token.value;
        localStorage.setItem(PUSH_TOKEN_KEY, pushToken);
        await syncPushTokenWithServer(pushToken);
      } catch (e) {
        console.warn('Push token registration storage notice:', e);
      }
    }).catch(() => {});

    // 4. Registration Error Listener
    await PushNotifications.addListener('registrationError', (error: RegistrationError) => {
      console.warn('Capacitor push registration error:', error);
    }).catch(() => {});

    // 5. Push Notification Received in Foreground
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        try {
          const event = new CustomEvent('giriraj:order-push-received', {
            detail: {
              title: notification.title,
              body: notification.body,
              data: notification.data,
            }
          });
          window.dispatchEvent(event);
        } catch {}
      }
    ).catch(() => {});

    // 6. Action Performed (User tapped on notification banner)
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        try {
          const data = (action.notification.data || {}) as PushNotificationPayload;
          const orderId = data.orderId || data.order_id || (data as any).id;
          const url = data.url || data.targetPath;

          const navigateSafely = (targetPath: string, idParam?: string) => {
            if (globalNavigationHandler) {
              globalNavigationHandler(targetPath, idParam);
            } else if (typeof window !== 'undefined') {
              window.history.pushState({}, '', targetPath);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          };

          if (orderId) {
            navigateSafely(`/orders?orderId=${encodeURIComponent(orderId)}`, orderId);
          } else if (url) {
            const path = url.replace(/^buildnow:\/\//, '/');
            navigateSafely(path);
          } else {
            navigateSafely('/orders');
          }
        } catch (e) {
          console.warn('Notification action handling notice:', e);
        }
      }
    ).catch(() => {});

    // 7. Check current permission and register if already permitted
    let permStatus = await PushNotifications.checkPermissions().catch(() => ({ receive: 'prompt' as const }));
    if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
      permStatus = await PushNotifications.requestPermissions().catch(() => ({ receive: 'denied' as const }));
    }

    if (permStatus.receive === 'granted') {
      await PushNotifications.register().catch((err) => {
        console.warn('Push notification register skipped/notice (e.g. emulator without GMS):', err);
      });
    }

    isInitialized = true;
    const token = localStorage.getItem(PUSH_TOKEN_KEY);

    return {
      isSupported: true,
      isRegistered: !!token,
      token,
      permissionStatus: permStatus.receive,
    };
  } catch (err) {
    console.warn('Error during Push Notification initialization:', err);
    return {
      isSupported: true,
      isRegistered: false,
      token: null,
      permissionStatus: 'error',
    };
  }
}

/**
 * Manually request Push Notification permission & register (e.g. from Settings toggle)
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window) {
      const res = await Notification.requestPermission().catch(() => 'denied');
      return res === 'granted';
    }
    return false;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to request push notification permission:', err);
    return false;
  }
}

/**
 * Get current stored push token
 */
export function getStoredPushToken(): string | null {
  return localStorage.getItem(PUSH_TOKEN_KEY);
}
