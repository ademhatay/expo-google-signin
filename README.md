# @ademhatay/expo-google-signin

A modern Expo module for **Google Sign-In on Android**, built on top of Google's new **Credential Manager API**. This library unifies Google Sign-In, Password Manager, and Passkeys into a single native Android bottom sheet (One Tap).

⚠️ **Note:** Currently **Android-only**. iOS support is planned.

---

## Why this library?

This package is built for the modern Android ecosystem, using Google's latest and recommended authentication APIs. Unlike older solutions that rely on deprecated methods, this library embraces the future of Android authentication.

- **🚀 Modern & Fast**: Built on Google's latest `androidx.credentials` API - the current standard for Android 14+ and beyond.
    
- **🆓 Free & Open Source**: Completely free to use with MIT license. No hidden costs or premium features.
    
- **⚡ Simple & Lightweight**: Just one `signIn()` call handles everything. No complex setup or heavy dependencies.
    
- **🎯 Native Experience**: Uses Android's built-in "One Tap" bottom sheet for the smoothest user experience.
    
- **🔄 Future-Proof**: Built on Google's recommended authentication path, ensuring long-term compatibility.

This library is a clean, efficient wrapper around Android's `androidx.credentials.CredentialManager` and Google's `GetGoogleIdOption` / `GetSignInWithGoogleOption` APIs - giving you the power of Google's latest tech with the simplicity you need.

---

## Installation

This package can be used in any React Native project (Expo or bare).

### Expo (Managed Projects)

This is the simplest way.

Bash

```
npx expo install @ademhatay/expo-google-signin
```

After installing, you must create a new development build to include the native code:

Bash

```
npx expo run:android
# or
eas build -p android --profile development
```

### Bare React Native / Expo (Bare Projects)

You can use npm or yarn to install the package.

Bash

```
# using npm
npm install @ademhatay/expo-google-signin

# using yarn
yarn add @ademhatay/expo-google-signin
```

This package depends on `expo-modules-core`. If you're in a bare React Native project and don't have Expo modules set up, you'll need to install and configure it first. [Follow the Expo guide for installing in bare projects](https://docs.expo.dev/bare/installing-expo-modules/).

After installation, rebuild your app to link the new native code:

Bash

```
npx react-native run-android
```

### Required Android Dependencies

This package automatically adds the following native dependencies to your Android build:

- `androidx.credentials:credentials`
    
- `androidx.credentials:credentials-play-services-auth`
    
- `com.google.android.libraries.identity.googleid`
    

---

## Google Cloud Setup (Required)

You must configure Google Cloud correctly for this module to work.

### Step 1. Create Web Client ID

This is the **most important** part. You need a **Web application** Client ID, even for Android. This will be your `serverClientId`.

1. Go to [Google Cloud Console – Credentials](https://console.cloud.google.com/apis/credentials?authuser=1).
    
2. Select your project.
    
3. Click **Create Credentials** → **OAuth client ID**.
    
4. Select **Web application** as the type.
    
5. Name it (e.g., "My App Web Client").
    
6. You do **not** need to fill in "Authorized JavaScript origins" or "Authorized redirect URIs".
    
7. Click **Create**.
    
8. Copy the generated **Client ID**. This is the `serverClientId` you will use in the `signIn()` function.
    

### Step 2. Create Android Client ID

This client ID is used to verify your app's identity with Google.

1. In the same [Credentials Console](https://console.cloud.google.com/apis/credentials?authuser=1), click **Create Credentials** → **OAuth client ID** again.
    
2. Select **Android** as the type.
    
3. Enter your app's **Package name** (must match `applicationId` in your `app/build.gradle` or `app.json`).
    
4. Enter your **SHA-1 certificate fingerprints**. This is critical and a common source of errors. You must add SHA-1 keys for all your build variants (debug, release, Google Play).
    

#### Getting Your SHA-1 Fingerprints

**Method 1: Using Gradle (Recommended)** Run this command in your project's `/android` directory. It shows all build variants.

Bash

```
cd android && ./gradlew signingReport
```

**Method 2: Using keytool (Debug key)**

Bash

```
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Method 3: Using Expo CLI (Debug & Release)**

Bash

```
npx expo credentials:manager -p android
```

You will get an output like `SHA1: A1:B2:C3:...`. Copy the **SHA1** value (not SHA256) and paste it into the Google Cloud Android Client ID form. Add multiple fingerprints as needed.

5. Click **Create**. You don't need this Client ID in your code, but it _must_ exist in your project.
    

### Step 3. Configure Consent Screen

Ensure your [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?authuser=1) is set up. If it's in "Testing" mode, you must add your Google account email to the "Test users" list, or sign-in will fail.

---

## Usage

The Credential Manager API supports two main UI flows, both initiated by the `signIn()` function:

1. **One Tap (Bottom Sheet)**: (`signInButtonFlow: false`) This is the default. It slides up a bottom sheet showing all available credentials (Google, Passkeys, Passwords). It's best for general sign-in/sign-up pages.
    
2. **Google Button Flow**: (`signInButtonFlow: true`) This flow is _only_ for Google Accounts and shows a traditional modal. It should _only_ be called directly from a "Sign in with Google" button press, as per Google's guidelines.
    

### Example App

This example shows how to trigger both flows.

```TypeScript
import React, { useState } from 'react';
import { View, Text, Button, Alert, ScrollView, Image, StyleSheet } from 'react-native';
import { signIn, signOut, GoogleUser } from '@ademhatay/expo-google-signin';

// Your WEB Client ID from Google Cloud (Step 1)
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;

if (!GOOGLE_WEB_CLIENT_ID) {
  Alert.alert("Error", "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in environment.");
}

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);

  const handleSignIn = async (flow: 'oneTap' | 'googleButton') => {
    try {
      const userData = await signIn({
        serverClientId: GOOGLE_WEB_CLIENT_ID,
        filterByAuthorizedAccounts: false,
        // Use 'true' for the classic Google button modal
        // Use 'false' for the new One Tap bottom sheet
        signInButtonFlow: flow === 'googleButton',
      });
      setUser(userData);
      Alert.alert('Sign-In Successful', `Welcome ${userData.displayName || 'User'}`);
    } catch (e: any) {
      // Handle known errors
      if (e.code === 'USER_CANCELED') {
        console.log('User canceled the sign-in flow');
      } else if (e.code === 'NO_CREDENTIAL') {
        console.log('No credentials found');
        Alert.alert('No Credentials', 'No saved accounts found.');
      } else {
        // Handle other errors
        console.error(e);
        Alert.alert('Error', e.message || 'An unknown sign-in error occurred');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      Alert.alert('Signed Out', 'You have been signed out');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Sign-out failed');
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <ScrollView contentContainerStyle={styles.userInfoContainer}>
          <Text style={styles.title}>
            Signed in as {user.displayName || user.id}
          </Text>

          {user.profilePictureUrl && (
            <Image
              source={{ uri: user.profilePictureUrl }}
              style={styles.profilePic}
            />
          )}

          <Text style={styles.infoText}>ID: {user.id}</Text>
          <Text style={styles.infoText}>ID Token: {user.idToken.slice(0, 30)}...</Text>
          {user.givenName && <Text style={styles.infoText}>First Name: {user.givenName}</Text>}
          {user.familyName && <Text style={styles.infoText}>Last Name: {user.familyName}</Text>}
          {user.phoneNumber && <Text style={styles.infoText}>Phone: {user.phoneNumber}</Text>}

          <View style={styles.buttonContainer}>
            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.signInContainer}>
          <Button 
            title="Sign In with Google (Button Flow)" 
            onPress={() => handleSignIn('googleButton')} 
          />
          <View style={{ height: 12 }} />
          <Button 
            title="Sign In with One-Tap (Bottom Sheet)" 
            onPress={() => handleSignIn('oneTap')} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 100,
  },
  signInContainer: {
    width: 280,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    maxWidth: '100%',
  },
  buttonContainer: {
    marginTop: 20,
  },
});
```

---

## API Reference

### `signIn(options: GoogleSignInOptions)`

Initiates a Google sign-in flow. Returns a `Promise` that resolves to a `GoogleUser` object.

#### GoogleSignInOptions

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`serverClientId`** | `string` | - | **Required.** Your server's **Web** OAuth 2.0 Client ID from Google Cloud Console. |
| `nonce` | `string?` | `undefined` | Optional random string used to prevent replay attacks. |
| `filterByAuthorizedAccounts` | `boolean` | `true` | If `true`, shows only accounts that have previously signed in to your app. |
| `preferImmediatelyAvailableCredentials` | `boolean` | `false` | If `true`, attempts silent sign-in without UI. Fails with `NO_CREDENTIAL` if unavailable. |
| `signInButtonFlow` | `boolean` | `false` | If `false`, uses One Tap bottom sheet. If `true`, uses Google Button modal flow. |

**Example:**
```tsx
const userData = await signIn({
  serverClientId: 'your-web-client-id.googleusercontent.com',
  filterByAuthorizedAccounts: false,
  signInButtonFlow: true,
});
```

---

### `signOut()`

Clears the current credential state from Android Credential Manager. Returns a `Promise<void>`.

**Example:**
```tsx
await signOut();
```

---

### `GoogleUser` Interface

The user object returned by a successful `signIn()` call.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique Google account identifier. |
| `idToken` | `string` | JWT token to send to your backend for verification. |
| `displayName` | `string?` | User's full display name. |
| `givenName` | `string?` | User's first name. |
| `familyName` | `string?` | User's last name. |
| `profilePictureUrl` | `string?` | URL of the user's profile picture. |
| `phoneNumber` | `string?` | User's verified phone number (if requested and available). |

**Example:**
```tsx
const user: GoogleUser = {
  id: "123456789",
  idToken: "eyJhbGciOiJSUzI1NiIs...",
  displayName: "John Doe",
  givenName: "John",
  familyName: "Doe",
  profilePictureUrl: "https://lh3.googleusercontent.com/...",
  phoneNumber: "+1234567890"
};
```
---

## Troubleshooting

Having issues? Check our comprehensive troubleshooting guide:

**📖 [Troubleshooting Guide](https://github.com/ademhatay/expo-google-signin/blob/main/docs/troubleshooting.md)**

**Common Quick Fixes:**

1. **Check SHA-1 Fingerprints:** This is the #1 cause of errors. Run `cd android && ./gradlew signingReport` and ensure **every** SHA-1 (debug, release, etc.) is in your Google Cloud Android Client ID (Step 2).
    
2. **Use WEB Client ID:** Make sure `serverClientId` in your code is the **Web** Client ID (Step 1), _not_ the Android Client ID.
    
3. **Check Consent Screen:** If your app is in "Testing" mode, is your Google account added to the "Test users" list?
    
4. **Google Account on Device:** The device or emulator must have a Google account added in Android settings.
    
5. **Rebuild the App:** After `npm install`, you must rebuild your native app (`npx expo run:android` or `npx react-native run-android`).
    

---

## License

MIT © Adem Hatay

---

## Contributing

PRs and issues are welcome. Please ensure commits are clear and follow the project's coding style.