import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Constants for Google OAuth
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENDPOINT || 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: process.env.EXPO_PUBLIC_GOOGLE_TOKEN_ENDPOINT || 'https://oauth2.googleapis.com/token',
  revocationEndpoint: process.env.EXPO_PUBLIC_GOOGLE_REVOCATION_ENDPOINT || 'https://oauth2.googleapis.com/revoke',
};

const SCOPES = ['https://www.googleapis.com/auth/drive.appdata', 'openid', 'profile', 'email'];

const CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
const CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
const CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;

const SESSION_KEY = 'sparkles_google_session';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthState {
  accessToken: string | null;
  user: GoogleUser | null;
}

let authState: AuthState = {
  accessToken: null,
  user: null,
};

// Persistence helper
const persistence = {
  async save(state: AuthState) {
    const data = JSON.stringify(state);
    if (Platform.OS === 'web') {
      localStorage.setItem(SESSION_KEY, data);
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, data);
    }
  },
  async load(): Promise<AuthState | null> {
    const data = Platform.OS === 'web' 
      ? localStorage.getItem(SESSION_KEY) 
      : await SecureStore.getItemAsync(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  async clear() {
    if (Platform.OS === 'web') {
      localStorage.removeItem(SESSION_KEY);
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
  }
};

export const googleAuthService = {
  /**
   * Initialize the service by loading any persisted session.
   */
  async init(): Promise<void> {
    const saved = await persistence.load();
    if (saved) {
      authState = saved;
    }
  },

  async login(): Promise<AuthState> {
    const clientId = Platform.select({
      ios: CLIENT_ID_IOS,
      android: CLIENT_ID_ANDROID,
      default: CLIENT_ID_WEB,
    });

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'sparkles'
    });

    const request = new AuthSession.AuthRequest({
      clientId: clientId ?? "",
      scopes: SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false, // Google's Implicit flow doesn't support PKCE parameters
    });

    const result = await request.promptAsync(GOOGLE_DISCOVERY);

    if (result.type === 'success' && result.authentication) {
      authState.accessToken = result.authentication.accessToken;

      // Optionally fetch user info
      try {
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${authState.accessToken}` },
        });
        authState.user = await response.json();
      } catch (error) {
        console.error('Failed to fetch user info', error);
      }

      // Persist the session
      await persistence.save(authState);

      return authState;
    } else if (result.type === 'error' || result.type === 'cancel') {
      throw new Error(result.type === 'cancel' ? 'Login cancelled' : 'Login failed');
    }

    return authState;
  },

  getAccessToken(): string | null {
    return authState.accessToken;
  },

  getUser(): GoogleUser | null {
    return authState.user;
  },

  async logout() {
    authState = { accessToken: null, user: null };
    await persistence.clear();
  },

  isAuthenticated(): boolean {
    return !!authState.accessToken;
  }
};
