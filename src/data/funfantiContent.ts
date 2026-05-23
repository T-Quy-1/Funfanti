import type { ImageSourcePropType } from 'react-native';

export type ScreenKey =
  | 'splash'
  | 'onboarding-1'
  | 'onboarding-2'
  | 'onboarding-3'
  | 'auth-select'
  | 'login-method'
  | 'register'
  | 'login'
  | 'auth-success'
  | 'home'
  | 'my-quizzes'
  | 'discover'
  | 'question-detail'
  | 'quiz'
  | 'result'
  | 'profile';

export type QuizChoice = {
  id: string;
  label: string;
  letter?: string;
  correct?: boolean;
};

export type QuizQuestion = {
  id: string;
  topic: string;
  prompt: string;
  explanation: string;
  artTone: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  choices: QuizChoice[];
};

export type QuestionSetCard = {
  id: string;
  title: string;
  topic: string;
  subtitle: string;
  description: string;
  summary?: string;
  creatorName?: string;
  creatorAvatarUrl?: string | null;
  progress: number;
  accent: string;
  artTone: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  tags: string[];
  questionCount: number;
  avgRating: number;
  reviewCount: number;
  sessionCount: number;
  isFeatured: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
};

export type QuestionSetSort = 'popular' | 'latest' | 'rating';

export type QuestionSetFilters = {
  search?: string;
  tags?: string[];
  minQuestions?: number;
  maxQuestions?: number;
  minRating?: number;
  maxRating?: number;
  sort?: QuestionSetSort;
  isFeatured?: boolean;
};

export const onboardingSlides = [
  {
    key: 'onboarding-1' as const,
    title: 'Welcome to Funfanti',
    description:
      'Transform short smartphone moments into quick, meaningful learning. Answer bite-sized questions in just 10 to 15 seconds.',
  },
  {
    key: 'onboarding-2' as const,
    title: 'Learn without the effort',
    description:
      'Funfanti pops up briefly during your day. Answer a quick question, reinforce your memory, and get right back to what you were doing.',
  },
  {
    key: 'onboarding-3' as const,
    title: 'Start from real question sets',
    description:
      'Create an account, explore available sets, save the ones you like, and track completed quiz attempts from your profile.',
  },
];

export const questionSets: QuestionSetCard[] = [];

export const questionSetTags = Array.from(
  new Set(questionSets.flatMap((questionSet) => questionSet.tags)),
);

export const quizQuestions: QuizQuestion[] = [];

export const navItems = [
  { key: 'home', label: 'Home' },
  { key: 'discover', label: 'Explore' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'profile', label: 'Profile' },
] as const;
