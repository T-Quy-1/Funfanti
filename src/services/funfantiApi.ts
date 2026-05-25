import {
  onboardingSlides,
  type QuestionSetCard,
  type QuestionSetFilters,
  type QuizQuestion,
} from "../data/funfantiContent";
import type { LockScreenTimingPreference } from "../utils/notificationPreferences";
import { analyticsEvents, logEvent } from "./analytics";

type JsonRecord = Record<string, unknown>;

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type UserPreference = {
  theme: "light" | "dark" | "system" | string;
  hapticsEnabled: boolean;
  notificationOverlay: boolean;
  lockScreenTiming?:
    | LockScreenTimingPreference
    | Record<string, unknown>
    | null;
};

export type UserProfile = AuthUser & {
  preference?: UserPreference;
};

export type UserBookmark = {
  id: string;
  createdAt: string;
  questionSet: {
    id: string;
    title: string;
    description: string;
    topic: string;
    mediaUrl?: string | null;
    isFeatured: boolean;
  };
};

export type UserActivity = {
  id: string;
  score: number | null;
  status: string;
  totalTimeMs: number | null;
  createdAt: string;
  questionSet: {
    id: string;
    title: string;
    topic: string;
  };
};

export type NotificationSchedule = {
  id: string;
  dailyTime: string;
  frequency: string;
  isActive: boolean;
  createdAt: string;
};

export type QuizSessionResult = {
  id: string;
  score: number;
  status: string;
  totalTimeMs: number | null;
  correctCount: number;
  totalQuestions: number;
  percentile: number;
  analyticsSummary: string;
};

const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.2.10:3000"
).replace(/\/$/, "");

type RemoteQuestionSet = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  summary?: unknown;
  topic?: unknown;
  mediaUrl?: unknown;
  isFeatured?: unknown;
  avgRating?: unknown;
  reviewCount?: unknown;
  tags?: unknown;
  questionCount?: unknown;
  sessionCount?: unknown;
  progress?: unknown;
  isBookmarked?: unknown;
  createdAt?: unknown;
  creator?: {
    displayName?: unknown;
    avatarUrl?: unknown;
  };
};

type RemoteQuestionSetPayload = RemoteQuestionSet & {
  questions?: Array<{
    id?: unknown;
    text?: unknown;
    mediaUrl?: unknown;
    explanationText?: unknown;
    choices?: Array<{
      id?: unknown;
      text?: unknown;
      isCorrect?: unknown;
    }>;
  }>;
};

const authHeader = (accessToken?: string | null) =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  const startedAtMs = Date.now();
  const method = (init?.method ?? "GET").toUpperCase();
  let statusCode: number | undefined;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });
    statusCode = response.status;

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const errorPayload = (await response.json()) as {
          message?: string | string[];
        };
        if (Array.isArray(errorPayload.message)) {
          message = errorPayload.message.join("\n");
        } else if (errorPayload.message) {
          message = errorPayload.message;
        }
      } catch {
        // Keep the status-based fallback when the server does not return JSON.
      }

      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    void logEvent(analyticsEvents.api_error, {
      endpoint: path,
      method,
      status_code: statusCode ?? 0,
      error_message: errorMessage,
    });
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The request took too long. Please try again.");
    }
    throw error;
  } finally {
    void logEvent(analyticsEvents.api_latency, {
      endpoint: path,
      method,
      status_code: statusCode ?? 0,
      duration_ms: Date.now() - startedAtMs,
    });
    clearTimeout(timeoutId);
  }
}

const normalize = (value: unknown) => String(value ?? "").trim();

const normalizeNumber = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeTags = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalize(item)).filter(Boolean);
};

const mapRemoteQuestionSet = (
  remote: RemoteQuestionSet,
  index: number,
): QuestionSetCard => {
  const description = normalize(remote.description);
  const summary = normalize(remote.summary);
  const mediaUrl = normalize(remote.mediaUrl);

  return {
    id: normalize(remote.id) || `question-set-${index + 1}`,
    title: normalize(remote.title) || "Untitled question set",
    topic: normalize(remote.topic) || "General",
    subtitle: summary || description || "No description provided.",
    description: description || summary || "No description provided.",
    summary: summary || undefined,
    creatorName: normalize(remote.creator?.displayName) || undefined,
    creatorAvatarUrl: normalize(remote.creator?.avatarUrl) || undefined,
    progress: normalizeNumber(remote.progress, 0),
    accent: "#E9FBFD",
    artTone: "#DDF7FA",
    imageUrl: mediaUrl || undefined,
    imageSource: undefined,
    tags: normalizeTags(remote.tags),
    questionCount: normalizeNumber(remote.questionCount, 0),
    avgRating: normalizeNumber(remote.avgRating, 0),
    reviewCount: normalizeNumber(remote.reviewCount, 0),
    sessionCount: normalizeNumber(remote.sessionCount, 0),
    isFeatured:
      typeof remote.isFeatured === "boolean" ? remote.isFeatured : false,
    isBookmarked: Boolean(remote.isBookmarked),
    createdAt: normalize(remote.createdAt) || undefined,
  };
};

const buildQuestionSetQuery = (filters: QuestionSetFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  filters.tags?.forEach((tag) => {
    if (tag.trim()) {
      params.append("tags", tag.trim());
    }
  });

  if (filters.minQuestions !== undefined) {
    params.set("minQuestions", String(filters.minQuestions));
  }

  if (filters.maxQuestions !== undefined) {
    params.set("maxQuestions", String(filters.maxQuestions));
  }

  if (filters.minRating !== undefined) {
    params.set("minRating", String(filters.minRating));
  }

  if (filters.maxRating !== undefined) {
    params.set("maxRating", String(filters.maxRating));
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (filters.isFeatured !== undefined) {
    params.set("isFeatured", String(filters.isFeatured));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const fetchQuestionSets = async (
  filters: QuestionSetFilters = {},
  accessToken?: string | null,
) => {
  const remoteQuestionSets = await requestJson<RemoteQuestionSet[]>(
    `/question-sets${buildQuestionSetQuery(filters)}`,
    {
      headers: authHeader(accessToken),
    },
  );

  return remoteQuestionSets.map(mapRemoteQuestionSet);
};

const mapRemoteQuestions = (
  payload: RemoteQuestionSetPayload,
  fallbackSet?: QuestionSetCard,
): QuizQuestion[] => {
  const remoteQuestions = Array.isArray(payload.questions)
    ? payload.questions
    : [];
  const topic =
    normalize(payload.title) || fallbackSet?.title || "Question Set";
  const artTone = fallbackSet?.artTone ?? "#DDF7FA";
  const letters = ["a", "b", "c", "d", "e", "f"];

  return remoteQuestions.map((question, questionIndex) => ({
    id: normalize(question.id) || `question-${questionIndex + 1}`,
    topic,
    prompt: normalize(question.text) || `Question ${questionIndex + 1}`,
    explanation:
      normalize(question.explanationText) ||
      "No explanation was provided for this question.",
    artTone,
    imageUrl: normalize(question.mediaUrl) || undefined,
    imageSource: undefined,
    choices: (Array.isArray(question.choices) ? question.choices : []).map(
      (choice, choiceIndex) => ({
        id:
          normalize(choice.id) ||
          letters[choiceIndex] ||
          `choice-${choiceIndex + 1}`,
        label: normalize(choice.text) || `Choice ${choiceIndex + 1}`,
        letter: letters[choiceIndex] ?? String(choiceIndex + 1),
        correct: Boolean(choice.isCorrect),
      }),
    ),
  }));
};

export const funfantiApi = {
  onboardingSlides,
  login: (email: string, password: string) =>
    requestJson<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    email: string;
    password: string;
    displayName: string;
  }) =>
    requestJson<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getProfile: (accessToken: string) =>
    requestJson<UserProfile>("/users/me", {
      headers: authHeader(accessToken),
    }),
  updateProfile: (
    payload: { displayName?: string; avatarUrl?: string },
    accessToken: string,
  ) =>
    requestJson<UserProfile>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: authHeader(accessToken),
    }),
  updatePreferences: (payload: JsonRecord, accessToken: string) =>
    requestJson<UserProfile>("/users/me/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: authHeader(accessToken),
    }),
  getBookmarks: (accessToken: string) =>
    requestJson<UserBookmark[]>("/users/me/bookmarks", {
      headers: authHeader(accessToken),
    }),
  getActivity: (accessToken: string) =>
    requestJson<UserActivity[]>("/users/me/activity", {
      headers: authHeader(accessToken),
    }),
  getSchedules: (accessToken: string) =>
    requestJson<NotificationSchedule[]>("/users/me/schedules", {
      headers: authHeader(accessToken),
    }),
  getQuestionSets: (
    filters: QuestionSetFilters = {},
    accessToken?: string | null,
  ) => fetchQuestionSets(filters, accessToken),
  getQuestionSet: async (
    questionSetId: string,
    accessToken?: string | null,
  ) => {
    const remote = await requestJson<RemoteQuestionSet>(
      `/question-sets/${questionSetId}`,
      {
        headers: authHeader(accessToken),
      },
    );
    return mapRemoteQuestionSet(remote, 0);
  },
  getQuestionSetTags: () => requestJson<string[]>("/question-sets/tags"),
  getQuestionSetQuestions: async (
    questionSetId: string,
    fallbackSet?: QuestionSetCard,
  ) => {
    const payload = await requestJson<RemoteQuestionSetPayload>(
      `/question-sets/${questionSetId}/questions`,
    );
    return mapRemoteQuestions(payload, fallbackSet);
  },
  submitQuizSession: (
    questionSetId: string,
    payload: JsonRecord,
    accessToken: string,
  ) =>
    requestJson<QuizSessionResult>(`/question-sets/${questionSetId}/sessions`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: authHeader(accessToken),
    }),
  bookmarkQuestionSet: (questionSetId: string, accessToken: string) =>
    requestJson<JsonRecord>(`/question-sets/${questionSetId}/bookmark`, {
      method: "POST",
      headers: authHeader(accessToken),
    }),
  removeQuestionSetBookmark: (questionSetId: string, accessToken: string) =>
    requestJson<JsonRecord>(`/question-sets/${questionSetId}/bookmark`, {
      method: "DELETE",
      headers: authHeader(accessToken),
    }),
};
