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
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import { configure, signIn, signOut } from '@ademhatay/expo-google-signin';

interface GoogleUser {
  id: string;
  idToken: string;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    configure({
      serverClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      filterByAuthorizedAccounts: true,
      useSignInWithGoogleOption: true,
    });
    console.log('WEB_CLIENT_ID=', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  }, []);

  const onLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await signIn();
      console.log('Google Sign-In Success - User Data:', JSON.stringify(userData, null, 2));
      setUser(userData);
      Alert.alert('Welcome!', `Hello ${userData.displayName || userData.givenName || 'User'}!`);
    } catch (e: any) {
      console.warn('Google sign-in failed', e?.message, e);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onLogout = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      Alert.alert('Signed Out', 'You have been successfully signed out.');
    } catch (e: any) {
      console.warn('Sign out failed', e?.message, e);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Google Credential Manager</Text>
        <Text style={styles.subtitle}>Expo Google Sign-In Example</Text>

        {user ? (
          <View style={styles.userCard}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            
            {user.profilePictureUrl && (
              <Image 
                source={{ uri: user.profilePictureUrl }} 
                style={styles.profileImage}
              />
            )}
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName || 'Anonymous User'}</Text>
              {user.givenName && (
                <Text style={styles.userDetail}>First Name: {user.givenName}</Text>
              )}
              {user.familyName && (
                <Text style={styles.userDetail}>Last Name: {user.familyName}</Text>
              )}
              <Text style={styles.userDetail}>ID: {user.id}</Text>
              {user.phoneNumber && (
                <Text style={styles.userDetail}>Phone: {user.phoneNumber}</Text>
              )}
            </View>

            <Pressable onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>
              Sign in with your Google account
            </Text>
            
            <Pressable 
              onPress={onLogin} 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285f4',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#ea4335',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
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
