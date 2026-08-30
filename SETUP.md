# BuildNow — Native Mobile Compilation & Store Submission Guide

This project is configured with **Capacitor 8** to build native mobile apps for **Android** (targeting Android 12+ / API 31 minimum) and **iOS** (targeting iOS 14+), ready for Google Play Store and Apple App Store submission.

---

## 1. Prerequisites

### Universal
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Android Development
- **Android Studio**: Ladybug / Hedgehog or newer
- **Android SDK**: API 31 (Android 12) through API 36 (Android 15)
- **JDK**: Java 17 or higher
- **Android SDK Build-Tools**: 34.0.0+ / 35.0.0+

### iOS Development (macOS only)
- **macOS**: Sonoma 14+ or Sequoia 15+
- **Xcode**: 15.0 or newer
- **Command Line Tools**: `xcode-select --install`
- **CocoaPods** / Swift Package Manager (Capacitor 8 utilizes native Swift Package integration)

---

## 2. Project Architecture & Configuration

### Capacitor Configuration (`capacitor.config.ts`)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.girirajpower.buildnow', // Change to your reverse-domain identifier before publishing
  appName: 'BuildNow',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#020617',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
    },
  },
};

export default config;
```

### Backend API Resolution (`src/lib/apiBase.ts`)
Native mobile applications run inside local device WebViews (`capacitor://` or `http://localhost`). Because there is no local Express backend running inside the mobile device, all API requests (`/api/order`, `/api/gemini/...`, etc.) are routed through `API_BASE_URL`:
- In **Native Apps**, requests automatically target the live production server (`https://www.girirajpower.in` or custom `VITE_API_BASE_URL`).
- In **Web Browsers**, requests use relative paths (`/api/...`) or your specified environment variable.

To configure a custom backend endpoint, create a `.env.production` or `.env.local` file:
```env
VITE_API_BASE_URL=https://your-production-domain.com
```

---

## 3. Quick Build & Sync Workflow

Every time you modify frontend React components or assets, re-build and sync the native directories:

```bash
# 1. Build the production web bundle into dist/
npm run build

# 2. Sync web assets and plugins to Android & iOS projects
npm run cap:sync

# Or use the combined shortcut:
npm run cap:build
```

---

## 4. Android Build & Play Store Deployment

### Opening in Android Studio
```bash
npm run android:open
```
*Alternatively, open the `./android` folder directly from Android Studio.*

### Android Configuration Verified
- **Minimum SDK (`minSdkVersion`)**: `31` (Android 12+)
- **Target SDK (`targetSdkVersion`)**: `36` (Android 15)
- **Compile SDK (`compileSdkVersion`)**: `36`
- **Location & Network Permissions**: Configured in `android/app/src/main/AndroidManifest.xml`

### Generating Release Android App Bundle (.aab) for Google Play
1. In Android Studio, select **Build** > **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Select your Keystore path (or create a new upload keystore), enter credentials.
4. Select build variant: **release**.
5. Click **Create**. The generated `.aab` file will be in `android/app/release/app-release.aab`.
6. Upload `app-release.aab` to your **Google Play Console** under **Production** or **Internal Testing**.

---

## 5. iOS Build & Apple App Store Deployment

### Opening in Xcode (macOS only)
```bash
npm run ios:open
```
*Alternatively, open `./ios/App/App.xcworkspace` in Xcode.*

### iOS Configuration Verified
- **Bundle Identifier**: `com.girirajpower.buildnow` (configured to match `capacitor.config.ts`)
- **Deployment Target**: iOS 14.0+
- **Privacy Permissions**: `NSLocationWhenInUseUsageDescription` configured in `ios/App/App/Info.plist`

### Archiving & Publishing to App Store Connect
1. In Xcode, select the **App** target and navigate to **Signing & Capabilities**.
2. Select your **Apple Developer Team** and ensure automatic signing is enabled.
3. Select **Any iOS Device (arm64)** from the device target dropdown.
4. Go to **Product** > **Archive**.
5. When the Organizer window opens, click **Distribute App** > **App Store Connect** > **Upload**.
6. Follow the prompts to sign and upload your build.
7. Manage your release and submit for review in [App Store Connect](https://appstoreconnect.apple.com).

---

## 6. Deep Linking & Custom URL Scheme Support

The application is configured to handle the custom URL scheme `buildnow://` as well as universal domain links.

### Supported Deep Link Formats:
- **Product Details**: `buildnow://product/:id` or `buildnow://product/wire-01`
- **Electrical Department**: `buildnow://electrical`
- **Construction Materials**: `buildnow://construction`
- **Electrician Services**: `buildnow://services`
- **Shopping Cart**: `buildnow://cart`
- **Order History**: `buildnow://orders`
- **User Profile**: `buildnow://profile`

### Testing Deep Links Locally:

**Android (via adb command line):**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "buildnow://product/1" com.girirajpower.buildnow
```

**iOS (via Xcode simulator):**
```bash
xcrun simctl openurl booted "buildnow://product/1"
```

---

## 7. Push Notifications Configuration (`@capacitor/push-notifications`)

BuildNow uses `@capacitor/push-notifications` to deliver real-time order status updates (Order Placed, Packing in Progress, Out for Delivery, Delivered) even when the app is in the background or completely closed.

### Android Push Setup (Firebase Cloud Messaging - FCM)
1. In the [Firebase Console](https://console.firebase.google.com), select your project and navigate to **Project Settings** > **General**.
2. Under **Your apps**, select your Android app (`com.girirajpower.buildnow`).
3. Download `google-services.json`.
4. Place `google-services.json` inside the `./android/app/` directory:
   ```
   android/app/google-services.json
   ```
5. Notification channel `order_updates` is configured automatically with High Priority, heads-up banner alerts, sound, and vibration.

### iOS Push Setup (Apple Push Notification service - APNs)
1. Open the project in Xcode (`npm run ios:open`).
2. Select the **App** target and navigate to **Signing & Capabilities**.
3. Click **+ Capability** and add:
   - **Push Notifications**
   - **Background Modes** (check *Remote notifications*)
4. In your [Apple Developer Account](https://developer.apple.com/account), create an **APNs Key** (.p8) or upload your APNs Certificate to your Firebase Console under **Project Settings** > **Cloud Messaging** > **Apple app configuration**.

### How Background Order Updates Work:
- **Foreground**: Notifications trigger in-app toast alerts with custom sound/vibration and refresh active order views in real-time.
- **Background / Killed**: The operating system displays a native notification banner in the notification drawer/lockscreen.
- **Notification Tap / Action**: Tapping the notification automatically wakes the app and deep-links directly to the order tracking timeline (`/orders?orderId=...`).

---

## 8. Installed Capacitor Plugins

- `@capacitor/core` & `@capacitor/cli`
- `@capacitor/android` & `@capacitor/ios`
- `@capacitor/push-notifications` (remote push notifications & order status updates)
- `@capacitor/splash-screen` (custom dark launch splash)
- `@capacitor/status-bar` (dark-mode status bar styling)
- `@capacitor/app` (hardware back button & deep links)
- `@capacitor/preferences` (native persistent key-value storage)
