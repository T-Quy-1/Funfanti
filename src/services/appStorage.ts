import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AuthUser } from "./funfantiApi";
import {
  parseAuthSession,
  parseOnboardingCompleted,
  serializeAuthSession,
  type PersistedAuthSession,
} from "../utils/sessionPersistence";

const ONBOARDING_COMPLETED_KEY = "funfanti.hasCompletedOnboarding";
const AUTH_SESSION_KEY = "funfanti.authSession";

const webStorage = () => {
  if (Platform.OS !== "web" || typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
};

const getStorageItem = async (key: string) => {
  const localStorage = webStorage();
  if (localStorage) {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};

const setStorageItem = async (key: string, value: string) => {
  const localStorage = webStorage();
  if (localStorage) {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const deleteStorageItem = async (key: string) => {
  const localStorage = webStorage();
  if (localStorage) {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const readHasCompletedOnboarding = async () => {
  try {
    const rawValue = await getStorageItem(ONBOARDING_COMPLETED_KEY);
    const parsedValue = parseOnboardingCompleted(rawValue);

    if (parsedValue === null) {
      await deleteStorageItem(ONBOARDING_COMPLETED_KEY);
      return false;
    }

    return parsedValue;
  } catch {
    return false;
  }
};

export const markOnboardingCompleted = async () => {
  await setStorageItem(ONBOARDING_COMPLETED_KEY, "true");
};

export const readPersistedAuthSession =
  async (): Promise<PersistedAuthSession | null> => {
    try {
      const rawValue = await getStorageItem(AUTH_SESSION_KEY);
      const session = parseAuthSession(rawValue);

      if (!session && rawValue !== null) {
        await deleteStorageItem(AUTH_SESSION_KEY);
      }

      return session;
    } catch {
      return null;
    }
  };

export const persistAuthSession = async (
  accessToken: string,
  user?: AuthUser | null,
) => {
  await setStorageItem(AUTH_SESSION_KEY, serializeAuthSession(accessToken, user));
};

export const clearPersistedAuthSession = async () => {
  await deleteStorageItem(AUTH_SESSION_KEY);
};
