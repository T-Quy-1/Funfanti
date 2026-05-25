import type { ScreenKey } from "../data/funfantiContent";
import type { AuthUser } from "../services/funfantiApi";

export type PersistedAuthSession = {
  accessToken: string;
  user?: AuthUser;
  savedAt: string;
};

export const serializeAuthSession = (
  accessToken: string,
  user?: AuthUser | null,
): string =>
  JSON.stringify({
    accessToken,
    ...(user ? { user } : {}),
    savedAt: new Date().toISOString(),
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseAuthUser = (value: unknown): AuthUser | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = typeof value.id === "string" ? value.id.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";

  if (!id || !email) {
    return undefined;
  }

  return {
    id,
    email,
    displayName:
      typeof value.displayName === "string" ? value.displayName : undefined,
    avatarUrl:
      typeof value.avatarUrl === "string" || value.avatarUrl === null
        ? value.avatarUrl
        : undefined,
  };
};

export const parseAuthSession = (
  rawValue: string | null,
): PersistedAuthSession | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    const accessToken =
      typeof parsed.accessToken === "string" ? parsed.accessToken.trim() : "";

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      user: parseAuthUser(parsed.user),
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
};

export const parseOnboardingCompleted = (rawValue: string | null) => {
  if (rawValue === "true") {
    return true;
  }

  if (rawValue === null || rawValue === "false") {
    return false;
  }

  return null;
};

export const resolveStartupScreen = ({
  hasCompletedOnboarding,
  hasValidSession,
}: {
  hasCompletedOnboarding: boolean;
  hasValidSession: boolean;
}): ScreenKey => {
  if (!hasCompletedOnboarding) {
    return "onboarding-1";
  }

  return hasValidSession ? "home" : "auth-select";
};
