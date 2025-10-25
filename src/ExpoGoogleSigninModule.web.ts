// Web shim for Expo Google Sign-In.
// This module keeps the same API surface but explicitly fails on web,
// guiding developers to use Google Identity Services (GIS) for web.
// https://developers.google.com/identity/gsi/web

import type { GoogleSignInOptions, GoogleUser } from './index';

/** Throws a clear, actionable error for unsupported web calls. */
function notSupported(fn: string): never {
  throw new Error(
    `[expo-google-signin] ${fn} is not supported on web. ` +
      `Use Google Identity Services for Web instead. ` +
      `See: https://developers.google.com/identity/gsi/web`
  );
}

/**
 * Not supported on web.
 * Use Google Identity Services (GIS) on web applications.
 */
export async function signIn(_options: GoogleSignInOptions): Promise<GoogleUser> {
  return notSupported('signIn');
}

/**
 * Not supported on web.
 * Use Google Identity Services (GIS) on web applications.
 */
export async function signOut(): Promise<void> {
  return notSupported('signOut');
}

// Re-export types for DX/autocomplete parity on web builds.
export type { GoogleSignInOptions, GoogleUser };