import type { ScreenKey } from '../data/funfantiContent';
import type { AppTab } from '../screens/screenTypes';

export type MainScreenKey = Extract<
  ScreenKey,
  'home' | 'my-quizzes' | 'discover' | 'question-detail' | 'quiz' | 'result' | 'profile'
>;

export type MainTabStacks = Record<AppTab, MainScreenKey[]>;

export const tabRootScreens: Record<AppTab, MainScreenKey> = {
  home: 'home',
  discover: 'discover',
  quiz: 'my-quizzes',
  profile: 'profile',
};

const mainScreenKeys: readonly MainScreenKey[] = [
  'home',
  'my-quizzes',
  'discover',
  'question-detail',
  'quiz',
  'result',
  'profile',
];

export const createInitialTabStacks = (): MainTabStacks => ({
  home: ['home'],
  discover: ['discover'],
  quiz: ['my-quizzes'],
  profile: ['profile'],
});

export const isMainScreenKey = (value: ScreenKey): value is MainScreenKey =>
  mainScreenKeys.includes(value as MainScreenKey);

export const getTabStackTop = (stacks: MainTabStacks, tab: AppTab) => {
  const stack = stacks[tab];
  return stack[stack.length - 1] ?? tabRootScreens[tab];
};

export const pushTabStack = (
  stacks: MainTabStacks,
  tab: AppTab,
  nextScreen: MainScreenKey,
): MainTabStacks => {
  const currentStack = stacks[tab] ?? [tabRootScreens[tab]];
  const currentTop = currentStack[currentStack.length - 1];

  if (currentTop === nextScreen) {
    return stacks;
  }

  return {
    ...stacks,
    [tab]: [...currentStack, nextScreen],
  };
};

export const replaceTabStackTop = (
  stacks: MainTabStacks,
  tab: AppTab,
  nextScreen: MainScreenKey,
): MainTabStacks => {
  const currentStack = stacks[tab] ?? [tabRootScreens[tab]];
  const parentStack = currentStack.slice(0, -1);
  const nextStack =
    parentStack[parentStack.length - 1] === nextScreen
      ? parentStack
      : [...parentStack, nextScreen];

  return {
    ...stacks,
    [tab]: nextStack.length > 0 ? nextStack : [nextScreen],
  };
};

export const popTabStack = (stacks: MainTabStacks, tab: AppTab) => {
  const currentStack = stacks[tab] ?? [tabRootScreens[tab]];
  const nextStack = currentStack.length > 1 ? currentStack.slice(0, -1) : currentStack;
  const nextScreen = nextStack[nextStack.length - 1] ?? tabRootScreens[tab];

  return {
    stacks: {
      ...stacks,
      [tab]: nextStack,
    },
    screen: nextScreen,
  };
};
