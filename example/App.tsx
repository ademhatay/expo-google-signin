import React, { useState } from 'react';
import { View, Text, Button, Alert, ScrollView, Image } from 'react-native';
import { signIn, signOut, GoogleUser } from '@ademhatay/expo-google-signin';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);

  // Google branded button flow (classic "Sign in with Google")
  const handleGoogleButtonSignIn = async () => {
    try {
      const userData = await signIn({
        serverClientId: GOOGLE_WEB_CLIENT_ID,
        filterByAuthorizedAccounts: false,
        signInButtonFlow: true, // Use Google branded button
      });
      setUser(userData);
    } catch (e: any) {
      if (e.code !== 'USER_CANCELED' && e.code !== 'NO_CREDENTIAL') {
        Alert.alert('Error', e.message || 'Sign-in failed');
      }
    }
  };

  // One-Tap bottom sheet (shows accounts directly)
  const handleOneTapSignIn = async () => {
    try {
      const userData = await signIn({
        serverClientId: GOOGLE_WEB_CLIENT_ID,
        filterByAuthorizedAccounts: false,
        signInButtonFlow: false, // Use One-Tap flow
      });
      setUser(userData);
    } catch (e: any) {
      if (e.code !== 'USER_CANCELED' && e.code !== 'NO_CREDENTIAL') {
        Alert.alert('Error', e.message || 'Sign-in failed');
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, paddingTop: 100 }}>
      {user ? (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Signed in as {user.displayName || user.id}
          </Text>

          {user.profilePictureUrl && (
            <Image
              source={{ uri: user.profilePictureUrl }}
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }}
            />
          )}

          <Text>ID: {user.id}</Text>
          <Text>ID Token: {user.idToken.slice(0, 20)}...</Text>
          {user.givenName && <Text>First Name: {user.givenName}</Text>}
          {user.familyName && <Text>Last Name: {user.familyName}</Text>}
          {user.phoneNumber && <Text>Phone: {user.phoneNumber}</Text>}

          <View style={{ marginTop: 20 }}>
            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </ScrollView>
      ) : (
        <View style={{ gap: 12, width: 250 }}>
          <Button title="Sign In with Google (Button Flow)" onPress={handleGoogleButtonSignIn} />
          <Button title="Sign In with One-Tap (Bottom Sheet)" onPress={handleOneTapSignIn} />
        </View>
      )}
    </View>
  );
}