import {
  interests,
  onboardingSlides,
  questionSets,
  quizQuestions,
  stats,
  QuestionSetCard,
  QuestionSetFilters,
  QuizQuestion,
} from '../data/funfantiContent';

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

type BootstrapPayload = {
  questionSets: typeof questionSets;
  quizQuestions: typeof quizQuestions;
  stats: typeof stats;
  interests: typeof interests;
  onboardingSlides: typeof onboardingSlides;
  profile: {
    displayName: string;
    email: string;
  };
};

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

type RemoteQuestionSet = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  topic?: unknown;
  mediaUrl?: unknown;
  isFeatured?: unknown;
  avgRating?: unknown;
  tags?: unknown;
  questionCount?: unknown;
  sessionCount?: unknown;
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

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const errorPayload = (await response.json()) as { message?: string | string[] };
        if (Array.isArray(errorPayload.message)) {
          message = errorPayload.message.join('\n');
        } else if (errorPayload.message) {
          message = errorPayload.message;
        }
      } catch {
        // Keep the status-based fallback when the server does not return JSON.
      }

      throw new Error(message);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

function withFallback<T>(fallback: T, loader: () => Promise<T>): Promise<T> {
  return loader().catch(() => fallback);
}

const normalize = (value: unknown) => String(value ?? '').trim();

const normalizeNumber = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeTags = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const tags = value.map((item) => normalize(item)).filter(Boolean);
  return tags.length > 0 ? tags : fallback;
};

const fallbackForRemoteSet = (remote: RemoteQuestionSet, index: number) => {
  const remoteTitle = normalize(remote.title).toLowerCase();
  const byTitle = questionSets.find((set) => remoteTitle && remoteTitle.includes(set.title.toLowerCase()));
  return byTitle ?? questionSets[index % questionSets.length] ?? questionSets[0];
};

const mapRemoteQuestionSet = (remote: RemoteQuestionSet, index: number): QuestionSetCard => {
  const fallback = fallbackForRemoteSet(remote, index);
  const mediaUrl = normalize(remote.mediaUrl);

  return {
    ...fallback,
    id: normalize(remote.id) || fallback.id,
    title: normalize(remote.title) || fallback.title,
    topic: normalize(remote.topic) || fallback.topic,
    subtitle: normalize(remote.description) || fallback.subtitle,
    imageUrl: mediaUrl || fallback.imageUrl,
    imageSource: mediaUrl ? undefined : fallback.imageSource,
    isFeatured:
      typeof remote.isFeatured === 'boolean' ? remote.isFeatured : fallback.isFeatured,
    avgRating: normalizeNumber(remote.avgRating, fallback.avgRating),
    questionCount: normalizeNumber(remote.questionCount, fallback.questionCount),
    sessionCount: normalizeNumber(remote.sessionCount, fallback.sessionCount),
    tags: normalizeTags(remote.tags, fallback.tags),
  };
};

const applyLocalQuestionSetFilters = (
  items: QuestionSetCard[],
  filters: QuestionSetFilters = {},
) => {
  const searchTokens =
    filters.search
      ?.trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2) ?? [];
  const requestedTags = filters.tags?.map((tag) => tag.toLowerCase()) ?? [];

  const filtered = items.filter((item) => {
    const searchable = [item.title, item.subtitle, item.topic, ...item.tags]
      .join(' ')
      .toLowerCase();
    const matchesSearch =
      searchTokens.length === 0 || searchTokens.some((token) => searchable.includes(token));
    const matchesTags =
      requestedTags.length === 0 ||
      requestedTags.some((tag) => item.tags.some((itemTag) => itemTag.toLowerCase() === tag));
    const matchesQuestions =
      (filters.minQuestions === undefined || item.questionCount >= filters.minQuestions) &&
      (filters.maxQuestions === undefined || item.questionCount <= filters.maxQuestions);
    const matchesRating =
      (filters.minRating === undefined || item.avgRating >= filters.minRating) &&
      (filters.maxRating === undefined || item.avgRating <= filters.maxRating);
    const matchesFeatured =
      filters.isFeatured === undefined || item.isFeatured === filters.isFeatured;

    return matchesSearch && matchesTags && matchesQuestions && matchesRating && matchesFeatured;
  });

  if (filters.sort === 'latest') {
    return filtered;
  }

  if (filters.sort === 'rating') {
    return [...filtered].sort((a, b) => b.avgRating - a.avgRating);
  }

  if (filters.sort === 'popular') {
    return [...filtered].sort((a, b) => b.sessionCount - a.sessionCount);
  }

  return [...filtered].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
};

const buildQuestionSetQuery = (filters: QuestionSetFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  filters.tags?.forEach((tag) => {
    if (tag.trim()) {
      params.append('tags', tag.trim());
    }
  });

  if (filters.minQuestions !== undefined) {
    params.set('minQuestions', String(filters.minQuestions));
  }

  if (filters.maxQuestions !== undefined) {
    params.set('maxQuestions', String(filters.maxQuestions));
  }

  if (filters.minRating !== undefined) {
    params.set('minRating', String(filters.minRating));
  }

  if (filters.maxRating !== undefined) {
    params.set('maxRating', String(filters.maxRating));
  }

  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  if (filters.isFeatured !== undefined) {
    params.set('isFeatured', String(filters.isFeatured));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

const fetchQuestionSets = async (filters: QuestionSetFilters = {}) => {
  const loadRemoteQuestionSets = (nextFilters: QuestionSetFilters) =>
    requestJson<RemoteQuestionSet[]>(`/question-sets${buildQuestionSetQuery(nextFilters)}`);

  let remoteQuestionSets = await loadRemoteQuestionSets(filters);
  const searchTokens =
    filters.search
      ?.trim()
      .split(/\s+/)
      .filter((token) => token.length > 2) ?? [];

  if (remoteQuestionSets.length === 0 && searchTokens.length > 1) {
    for (const token of searchTokens) {
      remoteQuestionSets = await loadRemoteQuestionSets({ ...filters, search: token });
      if (remoteQuestionSets.length > 0) {
        break;
      }
    }
  }

  return remoteQuestionSets.map(mapRemoteQuestionSet);
};

const mapRemoteQuestions = (
  payload: RemoteQuestionSetPayload,
  fallbackSet?: QuestionSetCard,
): QuizQuestion[] => {
  const remoteQuestions = Array.isArray(payload.questions) ? payload.questions : [];
  const topic = normalize(payload.title) || fallbackSet?.title || 'Question Set';
  const artTone = fallbackSet?.artTone ?? '#DDF7FA';
  const setMediaUrl = normalize(payload.mediaUrl) || fallbackSet?.imageUrl;
  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];

  return remoteQuestions.map((question, questionIndex) => ({
    id: normalize(question.id) || `question-${questionIndex + 1}`,
    topic,
    prompt: normalize(question.text) || `Question ${questionIndex + 1}`,
    explanation: normalize(question.explanationText) || 'Nice work. Keep going.',
    artTone,
    imageUrl: normalize(question.mediaUrl) || setMediaUrl,
    imageSource: setMediaUrl ? undefined : fallbackSet?.imageSource,
    choices: (Array.isArray(question.choices) ? question.choices : []).map((choice, choiceIndex) => ({
      id: normalize(choice.id) || letters[choiceIndex] || `choice-${choiceIndex + 1}`,
      label: normalize(choice.text) || `Choice ${choiceIndex + 1}`,
      letter: letters[choiceIndex] ?? String(choiceIndex + 1),
      correct: Boolean(choice.isCorrect),
    })),
  }));
};

export const funfantiApi = {
  bootstrap: (): Promise<BootstrapPayload> => {
    return withFallback(
      {
        questionSets,
        quizQuestions,
        stats,
        interests,
        onboardingSlides,
        profile: {
          displayName: 'John Doe',
          email: 'john.doe@gmail.com',
        },
      },
      async () => {
        const remoteQuestionSets = await fetchQuestionSets();

        return {
          questionSets: remoteQuestionSets.length > 0 ? remoteQuestionSets : questionSets,
          quizQuestions,
          stats,
          interests,
          onboardingSlides,
          profile: {
            displayName: 'John Doe',
            email: 'john.doe@gmail.com',
          },
        };
      },
    );
  },
  login: (email: string, password: string) =>
    requestJson<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: { email: string; password: string; displayName: string }) =>
    requestJson<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getQuestionSets: (filters: QuestionSetFilters = {}) =>
    withFallback(applyLocalQuestionSetFilters(questionSets, filters), () => fetchQuestionSets(filters)),
  getQuestionSetQuestions: (questionSetId: string) =>
    withFallback(quizQuestions, async () => {
      const payload = await requestJson<RemoteQuestionSetPayload>(
        `/question-sets/${questionSetId}/questions`,
      );
      const fallbackSet = questionSets.find((set) => set.id === questionSetId);
      const mappedQuestions = mapRemoteQuestions(payload, fallbackSet);
      return mappedQuestions.length > 0 ? mappedQuestions : quizQuestions;
    }),
  submitQuizSession: (
    questionSetId: string,
    payload: JsonRecord,
    accessToken?: string | null,
  ) =>
    withFallback(
      { score: 3, status: 'COMPLETED' },
      () =>
        requestJson<JsonRecord>(`/question-sets/${questionSetId}/sessions`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }),
    ),
  bookmarkQuestionSet: (questionSetId: string, accessToken?: string | null) =>
    withFallback(
      { ok: true },
      () =>
        requestJson<JsonRecord>(`/question-sets/${questionSetId}/bookmark`, {
          method: 'POST',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }),
    ),
  removeQuestionSetBookmark: (questionSetId: string, accessToken?: string | null) =>
    withFallback(
      { ok: true },
      () =>
        requestJson<JsonRecord>(`/question-sets/${questionSetId}/bookmark`, {
          method: 'DELETE',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }),
    ),
  updatePreferences: (payload: JsonRecord, accessToken?: string | null) =>
    withFallback(
      { ok: true },
      () =>
        requestJson<JsonRecord>('/users/me/preferences', {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }),
    ),
};
