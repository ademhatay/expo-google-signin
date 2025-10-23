import Native from './ExpoGoogleSigninModule';

export type SignInOptions = {
    nonce?: string;
    requestVerifiedPhoneNumber?: boolean;
    preferImmediatelyAvailableCredentials?: boolean;
};

export type SignInResult = {
    id: string;
    idToken: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    profilePictureUrl?: string;
    phoneNumber?: string;
};

export function configure(config: {
    serverClientId: string;
    filterByAuthorizedAccounts?: boolean;
    useSignInWithGoogleOption?: boolean;
}): Promise<void> {
    return Native.configure(config);
}

export function signIn(options?: SignInOptions): Promise<SignInResult> {
    return Native.signIn(options ?? {});
}

export function signOut(): Promise<void> {
    return Native.signOut();
}

const GoogleSignIn = { configure, signIn, signOut };
export default GoogleSignIn;