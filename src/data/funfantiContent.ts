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

const localQuestionSets: QuestionSetCard[] = [
  {
    id: 'starter-sea',
    title: 'Starter Sea',
    topic: 'General Knowledge',
    subtitle: 'A bright mixed-bag quiz to warm up your memory in under a minute.',
    creatorName: 'Funfanti Team',
    progress: 0.35,
    accent: '#D3F1D9',
    artTone: '#EEF4C2',
    imageUrl: 'splash',
    tags: ['General Knowledge', 'Science', 'Nature'],
    questionCount: 4,
    avgRating: 4.8,
    sessionCount: 1280,
    isFeatured: true,
    isBookmarked: true,
  },
  {
    id: 'napoleon',
    title: 'Napoleon in 5 Minutes',
    topic: 'World History',
    subtitle: 'A compact history set about major events, dates, and turning points.',
    creatorName: 'Funfanti Team',
    progress: 0.2,
    accent: '#FED19C',
    artTone: '#FDE7C9',
    imageUrl: 'adaptive',
    tags: ['History', 'Culture', 'Europe'],
    questionCount: 4,
    avgRating: 4.7,
    sessionCount: 980,
    isFeatured: true,
  },
  {
    id: 'science-lab',
    title: 'Tiny Science Lab',
    topic: 'Science & Tech',
    subtitle: 'Short questions about atoms, oceans, and the sky for quick daily practice.',
    creatorName: 'Funfanti Team',
    progress: 0.5,
    accent: '#CFF4F5',
    artTone: '#DDF7FA',
    imageUrl: 'icon',
    tags: ['Science', 'Nature', 'Tech'],
    questionCount: 4,
    avgRating: 4.9,
    sessionCount: 1430,
    isFeatured: false,
  },
];

const localQuizQuestions: QuizQuestion[] = [
  {
    id: 'starter-sea-q1',
    topic: 'General Knowledge',
    prompt: 'Which planet is known as the Red Planet?',
    explanation: 'Mars appears red because of iron oxide on its surface.',
    artTone: '#EEF4C2',
    imageUrl: 'splash',
    choices: [
      { id: 'a', label: 'Mars', correct: true },
      { id: 'b', label: 'Venus' },
      { id: 'c', label: 'Jupiter' },
      { id: 'd', label: 'Mercury' },
    ],
  },
  {
    id: 'starter-sea-q2',
    topic: 'General Knowledge',
    prompt: 'What do bees collect from flowers?',
    explanation: 'Bees gather nectar and pollen to make honey and feed their hive.',
    artTone: '#DDF7FA',
    imageUrl: 'icon',
    choices: [
      { id: 'a', label: 'Nectar', correct: true },
      { id: 'b', label: 'Sand' },
      { id: 'c', label: 'Rainwater' },
      { id: 'd', label: 'Clay' },
    ],
  },
  {
    id: 'starter-sea-q3',
    topic: 'General Knowledge',
    prompt: 'Which ocean is the largest on Earth?',
    explanation: 'The Pacific Ocean is the biggest ocean by area.',
    artTone: '#CFF4F5',
    imageUrl: 'adaptive',
    choices: [
      { id: 'a', label: 'Pacific Ocean', correct: true },
      { id: 'b', label: 'Atlantic Ocean' },
      { id: 'c', label: 'Indian Ocean' },
      { id: 'd', label: 'Arctic Ocean' },
    ],
  },
  {
    id: 'starter-sea-q4',
    topic: 'General Knowledge',
    prompt: 'What is the main gas in the air we breathe?',
    explanation: 'Nitrogen makes up the majority of Earth’s atmosphere.',
    artTone: '#FDE7C9',
    imageUrl: 'splash',
    choices: [
      { id: 'a', label: 'Nitrogen', correct: true },
      { id: 'b', label: 'Oxygen' },
      { id: 'c', label: 'Carbon dioxide' },
      { id: 'd', label: 'Hydrogen' },
    ],
  },
];

export const localQuestionSetQuestions: Record<string, QuizQuestion[]> = {
  'starter-sea': localQuizQuestions,
  napoleon: [
    {
      id: 'napoleon-q1',
      topic: 'World History',
      prompt: 'Napoleon was most closely associated with which country?',
      explanation: 'Napoleon Bonaparte rose to power in France.',
      artTone: '#FDE7C9',
      imageUrl: 'adaptive',
      choices: [
        { id: 'a', label: 'France', correct: true },
        { id: 'b', label: 'Spain' },
        { id: 'c', label: 'Italy' },
        { id: 'd', label: 'England' },
      ],
    },
    {
      id: 'napoleon-q2',
      topic: 'World History',
      prompt: 'What was Napoleon’s role?',
      explanation: 'He became Emperor of the French and led a major European empire.',
      artTone: '#FED19C',
      imageUrl: 'icon',
      choices: [
        { id: 'a', label: 'Emperor', correct: true },
        { id: 'b', label: 'Explorers' },
        { id: 'c', label: 'Inventor' },
        { id: 'd', label: 'Scientist' },
      ],
    },
    {
      id: 'napoleon-q3',
      topic: 'World History',
      prompt: 'Which famous battle ended Napoleon’s return to power?',
      explanation: 'The Battle of Waterloo marked Napoleon’s final defeat.',
      artTone: '#EEF4C2',
      imageUrl: 'splash',
      choices: [
        { id: 'a', label: 'Waterloo', correct: true },
        { id: 'b', label: 'Trafalgar' },
        { id: 'c', label: 'Hastings' },
        { id: 'd', label: 'Stalingrad' },
      ],
    },
    {
      id: 'napoleon-q4',
      topic: 'World History',
      prompt: 'What was one of Napoleon’s major legacies?',
      explanation: 'The Napoleonic Code influenced many legal systems.',
      artTone: '#DDF7FA',
      imageUrl: 'adaptive',
      choices: [
        { id: 'a', label: 'The Napoleonic Code', correct: true },
        { id: 'b', label: 'The Silk Road' },
        { id: 'c', label: 'The Magna Carta' },
        { id: 'd', label: 'The Berlin Wall' },
      ],
    },
  ],
  'science-lab': [
    {
      id: 'science-lab-q1',
      topic: 'Science & Tech',
      prompt: 'What is the smallest unit of a chemical element?',
      explanation: 'Atoms are the building blocks of matter.',
      artTone: '#DDF7FA',
      imageUrl: 'icon',
      choices: [
        { id: 'a', label: 'Atom', correct: true },
        { id: 'b', label: 'Cell' },
        { id: 'c', label: 'Molecule' },
        { id: 'd', label: 'Cellulose' },
      ],
    },
    {
      id: 'science-lab-q2',
      topic: 'Science & Tech',
      prompt: 'Which body of water is the deepest known ocean trench in?',
      explanation: 'The Mariana Trench lies in the Pacific Ocean.',
      artTone: '#CFF4F5',
      imageUrl: 'adaptive',
      choices: [
        { id: 'a', label: 'Pacific Ocean', correct: true },
        { id: 'b', label: 'Atlantic Ocean' },
        { id: 'c', label: 'Indian Ocean' },
        { id: 'd', label: 'Arctic Ocean' },
      ],
    },
    {
      id: 'science-lab-q3',
      topic: 'Science & Tech',
      prompt: 'What do plants absorb from the air for photosynthesis?',
      explanation: 'Plants take in carbon dioxide to make food with sunlight.',
      artTone: '#EEF4C2',
      imageUrl: 'splash',
      choices: [
        { id: 'a', label: 'Carbon dioxide', correct: true },
        { id: 'b', label: 'Nitrogen' },
        { id: 'c', label: 'Helium' },
        { id: 'd', label: 'Oxygen' },
      ],
    },
    {
      id: 'science-lab-q4',
      topic: 'Science & Tech',
      prompt: 'Which device is most associated with converting motion into electricity?',
      explanation: 'A generator converts mechanical energy into electrical energy.',
      artTone: '#FDE7C9',
      imageUrl: 'icon',
      choices: [
        { id: 'a', label: 'Generator', correct: true },
        { id: 'b', label: 'Thermometer' },
        { id: 'c', label: 'Periscope' },
        { id: 'd', label: 'Microscope' },
      ],
    },
  ],
};

export const questionSets = localQuestionSets;

export const questionSetTags = Array.from(
  new Set(localQuestionSets.flatMap((questionSet) => questionSet.tags)),
);

export const quizQuestions = localQuizQuestions;

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
