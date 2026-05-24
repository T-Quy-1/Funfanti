import type { ImageSourcePropType } from 'react-native';

export type ScreenKey =
  | 'splash'
  | 'onboarding-1'
  | 'onboarding-2'
  | 'onboarding-3'
  | 'interests'
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
  | 'profile'
  | 'quick-question';

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
  creatorName?: string;
  progress: number;
  accent: string;
  artTone: string;
  imageUrl?: string;
  imageSource?: ImageSourcePropType;
  tags: string[];
  questionCount: number;
  avgRating: number;
  sessionCount: number;
  isFeatured: boolean;
  isBookmarked?: boolean;
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
    title: 'Enable seamless experiences',
    description:
      'To deliver your quick daily knowledge boosts, Funfanti needs permission to display over other apps and send notifications.',
  },
];

export const interests = [
  'General Knowledge',
  'English Vocabulary',
  'Logical Math',
  'World History',
  'Science & Tech',
  'Art & Culture',
  'Philosophy',
  'Around the World',
];

export const questionSets: QuestionSetCard[] = [];

export const questionSetTags = Array.from(
  new Set(questionSets.flatMap((questionSet) => questionSet.tags)),
);

export const quizQuestions: QuizQuestion[] = [];

export const stats = [
  { label: 'Questions today', value: '18' },
  { label: 'Streak', value: '12 days' },
  { label: 'Saved sets', value: '24' },
];

export const filterChips = ['Popular', 'New', 'My course', 'Science', 'History'];

export const navItems = [
  { key: 'home', label: 'Home' },
  { key: 'discover', label: 'Explore' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'profile', label: 'Profile' },
] as const;
