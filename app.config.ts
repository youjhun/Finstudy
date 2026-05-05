import './scripts/load-env.js';
import type { ExpoConfig } from 'expo/config';

const rawBundleId = '{{bundle_id}}';
const bundleId = rawBundleId
  .replace(/[-_]/g, '.')
  .replace(/[^a-zA-Z0-9._]/g, '')
  .replace(/\.+/g, '.')
  .replace(/^\.|\.$/, '')
  .toLowerCase()
  .split('.')
  .map((segment) => {
    if (!segment) return 'x';
    if (!/^[a-zA-Z]/.test(segment)) {
      return 'x' + segment;
    }
    return segment;
  })
  .join('.') || 'space.manus.app';

const timestamp = bundleId.split('.').pop()?.replace(/^t/, '') ?? '';
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  appName: 'FinStudy',
  appSlug: 'finstudy-mobile',
  logoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663563732008/JkzLboXHdMKtSvnv.png',
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: env.scheme,
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: ['POST_NOTIFICATIONS'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: '*',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-audio',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone.',
      },
    ],
    [
      'expo-video',
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: {
          backgroundColor: '#FFFFFF',
        },
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          buildArchs: ['armeabi-v7a', 'arm64-v8a'],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: env,
};

export default config;
