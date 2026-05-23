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
  correct?: boolean;
};

export type QuizQuestion = {
  id: string;
  topic: string;
  prompt: string;
  explanation: string;
  artTone: string;
  imageUrl?: string;
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
  imageUrl: string;
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
    title: 'Starter Quiz',
    topic: 'Featured',
    subtitle: 'Build momentum with a short mixed-difficulty quiz.',
    progress: 0.68,
    accent: '#d7f2c8',
    artTone: '#cdecc4',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'qs-2',
    title: 'Ocean Facts',
    topic: 'Science & Tech',
    subtitle: 'Explore oceans, habitats, and marine life.',
    progress: 0.46,
    accent: '#d4f1ff',
    artTone: '#c7e7ff',
    imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'qs-3',
    title: 'Myths & Culture',
    topic: 'Art & Culture',
    subtitle: 'Quick prompts about stories, symbols, and traditions.',
    progress: 0.24,
    accent: '#f8e7c1',
    artTone: '#f6ddb2',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
  },
];

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
