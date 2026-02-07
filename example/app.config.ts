import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const pluginEntry: [string, { iosClientId?: string }] = [
    '../app.plugin.js',
    iosClientId ? { iosClientId } : {},
  ];

  return {
    ...config,
    plugins: [...(config.plugins ?? []), pluginEntry],
  };
};
