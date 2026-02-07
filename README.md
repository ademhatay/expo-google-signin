<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <h3 align="center">@ademhatay/expo-google-signin</h3>

  <p align="center">
    Native Google Sign-In for Expo / React Native on Android and iOS.
    <br />
    Android: Credential Manager (One Tap + Google button flow)
    <br />
    iOS: GoogleSignIn native SDK
    <br />
    <a href="https://github.com/ademhatay/expo-google-signin"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ademhatay/expo-google-signin/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/ademhatay/expo-google-signin/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#google-cloud-setup-required">Google Cloud Setup (Required)</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#api-reference">API Reference</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About The Project

`@ademhatay/expo-google-signin` provides a single JS API (`signIn`, `signOut`) and native implementations for both platforms:

- Android: modern Credential Manager flow (`One Tap` and explicit `Google button flow`)
- iOS: official `GoogleSignIn` native SDK

This lets you keep one auth integration across platforms while still using platform-native UX.

### Built With

- [Expo Modules](https://docs.expo.dev/modules/overview/)
- [React Native](https://reactnative.dev/)
- [AndroidX Credential Manager](https://developer.android.com/identity/sign-in/credential-manager)
- [Google Identity Services for Android](https://developers.google.com/identity/android-credential-manager)
- [GoogleSignIn iOS SDK](https://developers.google.com/identity/sign-in/ios)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- Node.js LTS (`20` or `22` recommended)
- Expo SDK / React Native project
- Google Cloud project

### Installation

Expo managed or prebuild:

```bash
npx expo install @ademhatay/expo-google-signin
```

Bare React Native / Expo bare:

```bash
npm install @ademhatay/expo-google-signin
# or
bun add @ademhatay/expo-google-signin
```

Rebuild native apps after install:

```bash
npx expo run:android
npx expo run:ios
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Google Cloud Setup (Required)

You must create OAuth clients in the same Google Cloud project.

### 1) Create Web OAuth Client (Required for all platforms)

Create `OAuth client ID` with type `Web application`.

Use this value as:

- `serverClientId` in `signIn(options)`

Important: `serverClientId` must be **Web Client ID**, not Android/iOS client ID.

### 2) Create Android OAuth Client

Create `OAuth client ID` with type `Android` and enter:

- Package name (exactly your Android app package)
- SHA-1 certificate fingerprint(s)

Get SHA-1:

```bash
cd android
./gradlew signingReport
```

Add all relevant SHA-1 values (debug/release/play signing if applicable).

### 3) Create iOS OAuth Client

Create `OAuth client ID` with type `iOS` and enter:

- Bundle identifier (must match your iOS app bundle ID)

### 4) Configure OAuth Consent Screen

If app is in `Testing`, add test user emails.

### 5) Configure Expo plugin for iOS

In your app config (`app.json` or `app.config.ts`), add plugin with iOS client ID:

```json
{
  "expo": {
    "plugins": [
      [
        "@ademhatay/expo-google-signin",
        {
          "iosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
        }
      ]
    ]
  }
}
```

This writes `GIDClientID` and required URL scheme into Info.plist during prebuild.

Then rebuild iOS native project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

```ts
import { signIn, signOut } from '@ademhatay/expo-google-signin';

const user = await signIn({
  serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  // Optional on iOS if plugin already set GIDClientID
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',

  // Android options (ignored on iOS):
  signInButtonFlow: false,
  filterByAuthorizedAccounts: false,
  preferImmediatelyAvailableCredentials: false,
});

console.log(user.idToken);

await signOut();
```

### Example env variables

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## API Reference

### `signIn(options: GoogleSignInOptions): Promise<GoogleUser>`

#### `GoogleSignInOptions`

- `serverClientId: string` (required)
  - Web OAuth client ID from Google Cloud.
- `iosClientId?: string`
  - iOS OAuth client ID. Optional if plugin sets `GIDClientID` in Info.plist.
- `nonce?: string`
  - Optional nonce.
- `filterByAuthorizedAccounts?: boolean` (Android)
- `preferImmediatelyAvailableCredentials?: boolean` (Android)
- `signInButtonFlow?: boolean` (Android)

#### Returns `GoogleUser`

- `id: string`
- `idToken: string`
- `displayName?: string`
- `givenName?: string`
- `familyName?: string`
- `profilePictureUrl?: string`
- `phoneNumber?: string`

### `signOut(): Promise<void>`

- Android: clears credential manager state.
- iOS: signs out current Google user.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Troubleshooting

### `serverClientId is required`

- Ensure Web client ID is passed.
- Ensure env is loaded correctly.

### `Developer console is not set up correctly` / `DEVELOPER_ERROR`

- Android package name mismatch.
- SHA-1 missing or wrong.
- Wrong client ID type used in `serverClientId`.

### `iosClientId is required for iOS`

- Add iOS client ID via plugin config or pass `iosClientId` in `signIn` options.

### iOS build fails with Expo config/plugin errors

- Use Node LTS (`20` or `22`), avoid Node `25`.
- Reinstall pods and rebuild:

```bash
cd ios
pod install
```

### iOS build succeeds but sign-in fails

- Verify bundle identifier exactly matches iOS OAuth client.
- Verify OAuth consent screen test users.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

PRs and issues are welcome.

1. Fork the project
2. Create branch
3. Commit changes
4. Push branch
5. Open PR

## License

MIT © Adem Hatay

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/ademhatay/expo-google-signin.svg?style=for-the-badge
[contributors-url]: https://github.com/ademhatay/expo-google-signin/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ademhatay/expo-google-signin.svg?style=for-the-badge
[forks-url]: https://github.com/ademhatay/expo-google-signin/network/members
[stars-shield]: https://img.shields.io/github/stars/ademhatay/expo-google-signin.svg?style=for-the-badge
[stars-url]: https://github.com/ademhatay/expo-google-signin/stargazers
[issues-shield]: https://img.shields.io/github/issues/ademhatay/expo-google-signin.svg?style=for-the-badge
[issues-url]: https://github.com/ademhatay/expo-google-signin/issues
[license-shield]: https://img.shields.io/github/license/ademhatay/expo-google-signin.svg?style=for-the-badge
[license-url]: https://github.com/ademhatay/expo-google-signin/blob/main/LICENSE
