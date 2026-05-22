import { ScreenKey, QuizQuestion, QuestionSetCard, QuestionSetFilters } from '../data/funfantiContent';

export type AppTab = 'home' | 'discover' | 'quiz' | 'profile';

export type BootstrapState = {
  screen: ScreenKey;
  activeSlide: number;
  selectedInterest: string;
  selectedInterests: string[];
  activeTab: AppTab;
  loginEmail: string;
  loginPassword: string;
  registerEmail: string;
  registerPassword: string;
  registerName: string;
  onboardingSlides: ReadonlyArray<{ key: ScreenKey; title: string; description: string }>;
  interests: string[];
  filterChips: string[];
  questionSets: QuestionSetCard[];
  questionSetsLoading: boolean;
  questionSetsError: string | null;
  questionSetSearchQuery: string;
  questionSetFilters: QuestionSetFilters;
  bookmarkedQuestionSetIds: string[];
  activeQuestionSetId: string;
  quizQuestions: QuizQuestion[];
  stats: ReadonlyArray<{ label: string; value: string }>;
  quizIndex: number;
  selectedChoice: string | null;
  answers: Record<string, string>;
  score: number;
  themeEnabled: boolean;
  hapticsEnabled: boolean;
  notificationOverlay: boolean;
};
