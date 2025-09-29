import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";

export const tokenStorage = {
  async setToken(token: string) {
    if (Platform.OS === 'web') {
      sessionStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
  },

  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return sessionStorage.getItem('token');
    } else {
      return await SecureStore.getItemAsync('token');
    }
  },

  async removeToken() {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem('token');
    } else {
      await SecureStore.deleteItemAsync('token');
    }
  },
};
