import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.girirajpower.buildnow',
  appName: 'BuildNow',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'www.girirajpower.in',
      'girirajpower.in',
      '*.run.app',
      '*.supabase.co',
      '*.googleapis.com',
      '*.gstatic.com',
      '*.googletagmanager.com',
      'unpkg.com',
      'images.unsplash.com',
      'i.imgur.com'
    ],
  },
  plugins: {
    App: {
      // Custom URL scheme deep link handling (buildnow://product/:id)
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#153d43',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#153d43',
    },
  },
};

export default config;

