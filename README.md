# @ademhatay/expo-google-signin

**Android-only Expo Module** for Google Sign-In using **Credential Manager / One Tap**.
No UI. Call functions → opens native sheet → returns **ID token + basic profile**.

> iOS support planned next.

---

## Install

```bash
# your app
npm i @ademhatay/expo-google-signin
# or: yarn add @ademhatay/expo-google-signin
```

This is a native module → if your app is managed, run:

```bash
npx expo prebuild -p android
```

---

## Android dependencies (auto)

This package brings:

```gradle
androidx.credentials:credentials:1.5.0
androidx.credentials:credentials-play-services-auth:1.0.0-alpha01
com.google.android.libraries.identity.googleid:googleid:1.1.1
```

and adds `INTERNET` permission.

---

## Google Cloud Setup (required)

1. In **the same GCP project**, create an **OAuth 2.0 Client ID (Web application)**.
   Copy the Client ID `xxxxx.apps.googleusercontent.com`.
2. (Often required) Create **OAuth Client ID (Android)**:

   * Package name = your `applicationId` (see `android/app/build.gradle`)
   * Debug SHA-1:

     ```bash
     keytool -list -v \
       -keystore ~/.android/debug.keystore \
       -alias androiddebugkey \
       -storepass android -keypass android
     ```
   * For release build, add another Android client with your **App Signing SHA-1**.
3. **OAuth consent screen**: In production (or add your Google account as Test user).
4. Put the Web Client ID in an env var:

   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```

---

## Usage

```tsx
import { useEffect, useCallback } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { configure, signIn, signOut } from '@ademhatay/expo-google-signin';

export default function Login() {
  useEffect(() => {
    configure({
      serverClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      filterByAuthorizedAccounts: true,  // returning users frictionless
      useSignInWithGoogleOption: true,   // explicit button flow
    });
  }, []);

  const onLogin = useCallback(async () => {
    try {
      const user = await signIn();
      // Send user.idToken to your backend and verify
      Alert.alert('Welcome', user.displayName ?? user.id);
      console.log('Google user', user);
    } catch (e: any) {
      console.warn('Google sign-in failed', e?.message, e);
    }
  }, []);

  const onLogout = useCallback(async () => {
    await signOut();
    Alert.alert('Signed out');
  }, []);

  return (
    <Pressable onPress={onLogin} style={{ padding: 12, borderRadius: 8, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontWeight: '600' }}>Google ile Giriş</Text>
    </Pressable>
  );
}
```

### API

```ts
configure(options: {
  serverClientId: string;                 // Web OAuth client ID
  filterByAuthorizedAccounts?: boolean;   // default true
  useSignInWithGoogleOption?: boolean;    // default true
}): Promise<void>;

signIn(options?: {
  nonce?: string;
  requestVerifiedPhoneNumber?: boolean;   // default false
  preferImmediatelyAvailableCredentials?: boolean; // opportunistic when true
}): Promise<{
  id: string;           // email
  idToken: string;      // OIDC ID token
  displayName?: string;
  givenName?: string;
  familyName?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
}>;

signOut(): Promise<void>; // also clear your app session
```

---

## Server-side verification (recommended)

Verify the **ID token** with Google libraries. Check `iss`, `aud`, `exp`, and (if used) `nonce`.

---

## Troubleshooting

* **Developer console is not set up correctly**
  Add an **Android OAuth client** with your exact `applicationId` + **debug SHA-1** (and release SHA-1 later).

* **NoCredentialException** immediately
  You probably called with `preferImmediatelyAvailableCredentials=true` and no local credentials exist.

* **No alert / no logs**
  Ensure your `signIn()` Promise resolves—use console logs. If needed, upgrade to latest Google Play Services.

---

## Roadmap

* iOS (Sign in with Google via `googleid`), events, web-fallback.

---

## License

MIT © Adem Hatay
