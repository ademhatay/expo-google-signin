import { NativeModule, requireNativeModule } from 'expo-modules-core';

/**
 * Shape of the Google user object returned after a successful sign-in.
 */
export interface GoogleUser {
  /** Unique Google account identifier (usually the email). */
  id: string;

  /** The ID token (JWT) that should be sent to your backend for verification. */
  idToken: string;

  /** User's display name. */
  displayName?: string;

  /** User's first name. */
  givenName?: string;

  /** User's last name. */
  familyName?: string;

  /** URL of the user's profile picture. */
  profilePictureUrl?: string;

  /** Verified phone number (if available). */
  phoneNumber?: string;
}

/**
 * Options for the signIn function.
 */
export interface GoogleSignInOptions {
  /**
   * Your server's Web OAuth 2.0 Client ID.
   * This is REQUIRED for all sign-in requests.
   */
  serverClientId: string;

  /**
   * Optional nonce string used to prevent replay attacks.
   */
  nonce?: string;

  /**
   * If true, limits the account selector to accounts
   * that have previously signed in to your app.
   * Default: true
   */
  filterByAuthorizedAccounts?: boolean;

  /**
   * If true, attempts silent sign-in without showing UI.
   * If no credentials are available, it fails with NO_CREDENTIAL.
   * Default: false
   */
  preferImmediatelyAvailableCredentials?: boolean;

  /**
   * If true, explicitly triggers the "Sign in with Google" button flow
   * instead of the One Tap bottom sheet.
   * Default: false
   */
  signInButtonFlow?: boolean;
}

/**
 * Internal native module interface.
 */
interface ExpoGoogleSignInModule extends NativeModule {
  signIn(options: GoogleSignInOptions): Promise<GoogleUser>;
  signOut(): Promise<void>;
}

// Load the native module
const ExpoGoogleSignInNativeModule =
  requireNativeModule<ExpoGoogleSignInModule>('ExpoGoogleSignIn');

/**
 * Initiates a Google sign-in flow with the given options.
 * @param options GoogleSignInOptions
 * @returns A Promise resolving to a GoogleUser object
 */
export async function signIn(options: GoogleSignInOptions): Promise<GoogleUser> {
  if (!options || !options.serverClientId) {
    throw new Error(
      'ExpoGoogleSignIn: `serverClientId` is required in `signIn` options.'
    );
  }
  return await ExpoGoogleSignInNativeModule.signIn(options);
}

/**
 * Signs out the currently authenticated Google user.
 * Clears credential state in the Credential Manager.
 */
export async function signOut(): Promise<void> {
  return await ExpoGoogleSignInNativeModule.signOut();
}