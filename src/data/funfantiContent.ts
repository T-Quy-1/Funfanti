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
  | 'discover'
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

const questionSetImages = {
  ussr: require('../../assets/question-sets/ussr-101.png'),
  starterSea: require('../../assets/question-sets/starter-sea-quiz.png'),
  aquatic: require('../../assets/question-sets/aquatic-ecosystems.png'),
  napoleon: require('../../assets/question-sets/napoleonic-wars.png'),
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

export const questionSets: QuestionSetCard[] = [
  {
    id: 'qs-1',
    title: 'USSR 101',
    topic: 'History',
    subtitle: 'A focused sprint through early Soviet history, symbols, and major turning points.',
    progress: 0.68,
    accent: '#E9FBFD',
    artTone: '#E6F9FB',
    imageSource: questionSetImages.ussr,
    tags: ['History', 'Russia', 'Modern History'],
    questionCount: 30,
    avgRating: 4.8,
    sessionCount: 128,
    isFeatured: true,
  },
  {
    id: 'qs-2',
    title: 'Starter Sea Quiz',
    topic: 'Ocean',
    subtitle: 'Quick ocean facts about waves, habitats, and marine life.',
    progress: 0.46,
    accent: '#E9FBFD',
    artTone: '#DDF7FA',
    imageSource: questionSetImages.starterSea,
    tags: ['Ocean', 'Nature', 'Fun Facts'],
    questionCount: 2,
    avgRating: 4.7,
    sessionCount: 94,
    isFeatured: true,
  },
  {
    id: 'qs-3',
    title: 'Aquatic Ecosystems',
    topic: 'Science',
    subtitle: 'Explore reefs, ocean zones, and how aquatic habitats stay balanced.',
    progress: 0.24,
    accent: '#E9FBFD',
    artTone: '#DDF7FA',
    imageSource: questionSetImages.aquatic,
    tags: ['Ocean', 'Nature', 'Science'],
    questionCount: 30,
    avgRating: 4.4,
    sessionCount: 52,
    isFeatured: false,
  },
  {
    id: 'qs-4',
    title: 'The Napoleonic Wars',
    topic: 'History',
    subtitle: 'A compact timeline of campaigns, coalitions, and consequences.',
    progress: 0.18,
    accent: '#E9FBFD',
    artTone: '#E6F9FB',
    imageSource: questionSetImages.napoleon,
    tags: ['History', 'France', 'Modern History'],
    questionCount: 40,
    avgRating: 4.5,
    sessionCount: 76,
    isFeatured: false,
  },
];

export const questionSetTags = Array.from(
  new Set(questionSets.flatMap((questionSet) => questionSet.tags)),
);

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Quiz Question 1',
    prompt: 'How many main oceans are there on Earth?',
    artTone: '#d4f1ff',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    choices: [
      { id: 'a', label: '4 oceans' },
      { id: 'b', label: '5 oceans', correct: true },
      { id: 'c', label: '6 oceans' },
      { id: 'd', label: '7 oceans' },
    ],
    explanation:
      'The five oceans are the Pacific, Atlantic, Indian, Southern, and Arctic.',
  },
  {
    id: 'q2',
    topic: 'Quiz Question 2',
    prompt: 'Which of these sea creatures is NOT actually a fish?',
    artTone: '#dff2d7',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    choices: [
      { id: 'a', label: 'Sea horse', correct: true },
      { id: 'b', label: 'Blue tang' },
      { id: 'c', label: 'Angelfish' },
      { id: 'd', label: 'Clownfish' },
    ],
    explanation:
      'A seahorse is a fish-like animal, but it is not classified as a fish in the way the others are.',
  },
  {
    id: 'q3',
    topic: 'Quiz Question 3',
    prompt: 'Which statement best describes the Moon?',
    artTone: '#f7f0c8',
    imageUrl: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80',
    choices: [
      { id: 'a', label: 'It produces its own light' },
      { id: 'b', label: 'It reflects sunlight', correct: true },
      { id: 'c', label: 'It is made of gas' },
      { id: 'd', label: 'It orbits Mars' },
    ],
    explanation:
      'The Moon shines because it reflects the Sun’s light back to Earth.',
  },
];

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
