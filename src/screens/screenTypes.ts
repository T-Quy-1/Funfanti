import type { ScreenKey, QuizQuestion, QuestionSetCard } from '../data/funfantiContent';

export type AppTab = 'home' | 'discover' | 'quiz' | 'profile';

export type BootstrapState = {
  screen: ScreenKey;
  activeSlide: number;
  activeTab: AppTab;
  loginEmail: string;
  loginPassword: string;
  registerEmail: string;
  registerPassword: string;
  registerName: string;
  onboardingSlides: ReadonlyArray<{ key: ScreenKey; title: string; description: string }>;
  questionSets: QuestionSetCard[];
  questionSetTags: string[];
  questionSetsLoading: boolean;
  questionSetsError: string | null;
  bookmarkedQuestionSetIds: string[];
  activeQuestionSetId: string;
  quizQuestions: QuizQuestion[];
  quizIndex: number;
  selectedChoice: string | null;
  answers: Record<string, string>;
  score: number;
  themeEnabled: boolean;
  hapticsEnabled: boolean;
  notificationOverlay: boolean;
};
