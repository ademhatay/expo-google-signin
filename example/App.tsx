import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

function AppContent() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
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