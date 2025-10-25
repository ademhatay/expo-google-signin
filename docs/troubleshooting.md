# Troubleshooting Guide

This guide helps you resolve common issues with `@ademhatay/expo-google-signin`.

## Authentication Errors

### `NO_CREDENTIAL`
**Meaning**: No saved credentials available for sign-in.

**Common causes:**
- User has never signed in before
- `filterByAuthorizedAccounts: true` but no authorized accounts exist
- Credential cache was cleared

**Solutions:**
1. For first-time users, use `filterByAuthorizedAccounts: false`
2. Implement fallback flow (authorized → all accounts → button flow)
3. Check if Google account is added to device

### `USER_CANCELED`
**Meaning**: User closed the sign-in sheet or canceled the flow.

**This is normal behavior** - don't show error messages for this.

### `GET_CREDENTIAL_ERROR`
**Meaning**: Configuration or setup issue.

**Most common causes:**
1. **SHA-1 fingerprint mismatch** (90% of cases)
2. Wrong `serverClientId` (using Android Client ID instead of Web)
3. Package name mismatch between app and Google Console

## Setup Issues

### No UI Appears

**Check these in order:**

1. **Google Play Services updated?**
   ```bash
   # Check version
   adb shell dumpsys package com.google.android.gms | grep versionName
   ```

2. **Google account added to device?**
   - Settings → Accounts → Add Google account

3. **SHA-1 fingerprints correct?**
   ```bash
   cd android && ./gradlew signingReport
   ```
   Copy the SHA1 value and verify it's in Google Console.

4. **Using Web Client ID?**
   - `serverClientId` must be the **Web** OAuth Client ID
   - NOT the Android OAuth Client ID

5. **Package name matches?**
   - `android/app/build.gradle` → `applicationId`
   - Must match Google Console Android OAuth client

### "Sign-in failed" Immediately

This usually indicates **SHA-1 fingerprint mismatch**.

**Debug steps:**
1. Get current SHA-1:
   ```bash
   cd android && ./gradlew signingReport
   ```

2. Compare with Google Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Find your Android OAuth client
   - Check SHA-1 fingerprints match exactly

3. **Common mistakes:**
   - Using SHA256 instead of SHA1
   - Missing debug SHA-1 for development
   - Missing release SHA-1 for production builds

### Works in Development but Not Production

**Cause**: Missing release SHA-1 fingerprint.

**Solution:**
1. Get release SHA-1:
   ```bash
   # If using custom keystore
   keytool -list -v -keystore path/to/release.keystore
   
   # If using Google Play App Signing
   # Get it from Play Console → App Signing
   ```

2. Add release SHA-1 to Google Console Android OAuth client.

## Debug Commands

### Check SHA-1 Fingerprints
```bash
# All variants (recommended)
cd android && ./gradlew signingReport

# Debug keystore only
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Custom keystore
keytool -list -v -keystore path/to/your.keystore -alias your-alias
```

### View Detailed Logs
```bash
# Filter for our module
adb logcat | grep ExpoGoogleSignIn

# All credential manager logs
adb logcat | grep -i credential

# Google Play Services logs
adb logcat | grep -i "gms\|play"
```

### Reset App Credentials
```bash
# Clear all app data (including credentials)
adb shell pm clear com.yourapp.package

# Or uninstall/reinstall
adb uninstall com.yourapp.package
```

## Quick Troubleshooting Checklist

**If sign-in doesn't work, check these in order:**

- [ ] **SHA-1 fingerprints added to Google Console**
  ```bash
  cd android && ./gradlew signingReport
  ```

- [ ] **Package name matches**
  - `android/app/build.gradle` → `applicationId`
  - Google Console Android OAuth client

- [ ] **Using Web Client ID**
  - `serverClientId` = Web OAuth Client ID (not Android)

- [ ] **Google account on device**
  - Settings → Accounts → Google

- [ ] **Google Play Services updated**
  - Play Store → Google Play Services → Update

- [ ] **OAuth Consent Screen configured**
  - [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)

- [ ] **Test users added (if in Testing mode)**

## Advanced Debugging

### Enable Verbose Logging

Add to your `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        debug {
            buildConfigField "boolean", "CREDENTIAL_MANAGER_DEBUG", "true"
        }
    }
}
```

### Test Different Flows

```tsx
// Test 1: Authorized accounts only
await signIn({
  serverClientId: CLIENT_ID,
  filterByAuthorizedAccounts: true,
  signInButtonFlow: false,
});

// Test 2: All accounts
await signIn({
  serverClientId: CLIENT_ID,
  filterByAuthorizedAccounts: false,
  signInButtonFlow: false,
});

// Test 3: Google button flow
await signIn({
  serverClientId: CLIENT_ID,
  signInButtonFlow: true,
});

// Test 4: Silent sign-in
await signIn({
  serverClientId: CLIENT_ID,
  preferImmediatelyAvailableCredentials: true,
  filterByAuthorizedAccounts: true,
});
```

### Verify Google Console Setup

1. **Web OAuth Client ID**:
   - Type: Web application
   - No redirect URIs needed
   - Copy Client ID for `serverClientId`

2. **Android OAuth Client ID**:
   - Type: Android
   - Package name: matches `applicationId`
   - SHA-1: from `./gradlew signingReport`

3. **OAuth Consent Screen**:
   - Status: In production OR test users added
   - Scopes: `../auth/userinfo.email`, `../auth/userinfo.profile`

## Still Having Issues?

1. **Check example app**: The example in this repo should work out of the box.

2. **Compare configurations**: Ensure your setup matches the working example.

3. **Create minimal reproduction**: Strip down to basic sign-in code.

4. **Check Google Play Console**: If using Play Store, verify App Signing certificates.

5. **Open an issue**: Include logs, configuration, and steps to reproduce.

## Common Gotchas

- **Don't use Android Client ID as `serverClientId`** - always use Web Client ID
- **SHA-1 vs SHA256** - Google Console needs SHA-1 (not SHA256)
- **Debug vs Release** - Different keystores = different SHA-1 fingerprints
- **Package name case sensitivity** - Must match exactly
- **Google Play App Signing** - Changes your SHA-1 fingerprint
- **Multiple Google accounts** - May show account picker even with auto-select
- **Emulator vs Device** - Some features work differently on emulators