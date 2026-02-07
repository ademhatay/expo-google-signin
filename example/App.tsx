import React, { useState } from 'react';
import { View, Text, Button, Alert, ScrollView, Image, Platform, Pressable } from 'react-native';
import { signIn, signOut, GoogleUser } from '@ademhatay/expo-google-signin';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

function getRequiredClientId() {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Add it to example/.env as your Web OAuth client ID.'
    );
  }
  return GOOGLE_WEB_CLIENT_ID;
}

function getIosClientIdIfNeeded() {
  if (Platform.OS !== 'ios') {
    return undefined;
  }
  return GOOGLE_IOS_CLIENT_ID;
}

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);

  const handleSignIn = async (signInButtonFlow: boolean) => {
    try {
      const userData = await signIn({
        serverClientId: getRequiredClientId(),
        iosClientId: getIosClientIdIfNeeded(),
        filterByAuthorizedAccounts: false,
        signInButtonFlow,
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
        <View style={{ gap: 12, width: 320 }}>
          {Platform.OS === 'ios' ? (
            <Pressable
              onPress={() => handleSignIn(false)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#0f5fd6' : '#1a73e8',
                borderRadius: 10,
                paddingVertical: 14,
                paddingHorizontal: 16,
                alignItems: 'center',
              })}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Sign In with Google
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => handleSignIn(true)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#0f5fd6' : '#1a73e8',
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  Sign In with Google
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSignIn(false)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#f2f4f8' : '#fff',
                  borderColor: '#1a73e8',
                  borderWidth: 1.5,
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#1a73e8', fontSize: 16, fontWeight: '600' }}>
                  Sign In with One-Tap
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}
