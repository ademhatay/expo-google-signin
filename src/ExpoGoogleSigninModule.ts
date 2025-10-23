import { NativeModule, requireNativeModule } from 'expo';

type Events = {};

declare class ExpoGoogleSignInModule extends NativeModule<Events> {
  configure(config: {
    serverClientId: string;
    filterByAuthorizedAccounts?: boolean;
    useSignInWithGoogleOption?: boolean;
  }): Promise<void>;

  signIn(options?: {
    nonce?: string;
    requestVerifiedPhoneNumber?: boolean;
    preferImmediatelyAvailableCredentials?: boolean;
  }): Promise<{
    id: string;
    idToken: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    profilePictureUrl?: string;
    phoneNumber?: string;
  }>;

  signOut(): Promise<void>;
}

export default requireNativeModule<ExpoGoogleSignInModule>('ExpoGoogleSignIn');