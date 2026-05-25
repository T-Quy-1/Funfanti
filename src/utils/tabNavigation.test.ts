import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyQuizReturnTarget,
  createInitialTabStacks,
  createQuizReturnTarget,
  getTabStackTop,
  popTabStack,
  pushTabStack,
  replaceTabStackTop,
} from './tabNavigation';

test('keeps each tab navigation stack independent', () => {
  let stacks = createInitialTabStacks();

  stacks = pushTabStack(stacks, 'discover', 'question-detail');

  assert.equal(getTabStackTop(stacks, 'home'), 'home');
  assert.equal(getTabStackTop(stacks, 'discover'), 'question-detail');
  assert.equal(getTabStackTop(stacks, 'quiz'), 'my-quizzes');
});

test('pops through an in-progress detail to quiz chain inside the active tab', () => {
  let stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'discover', 'question-detail');
  stacks = pushTabStack(stacks, 'discover', 'quiz');

  let popped = popTabStack(stacks, 'discover');
  assert.equal(popped.screen, 'question-detail');

  popped = popTabStack(popped.stacks, 'discover');
  assert.equal(popped.screen, 'discover');
});

test('replace updates the current screen without duplicating retry history', () => {
  let stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'discover', 'question-detail');
  stacks = pushTabStack(stacks, 'discover', 'quiz');
  stacks = pushTabStack(stacks, 'discover', 'result');
  stacks = replaceTabStackTop(stacks, 'discover', 'quiz');

  assert.deepEqual(stacks.discover, ['discover', 'question-detail', 'quiz']);
});

test('does not pop beyond a tab root', () => {
  const popped = popTabStack(createInitialTabStacks(), 'home');

  assert.equal(popped.screen, 'home');
  assert.deepEqual(popped.stacks.home, ['home']);
});

test('replaces quiz with result so completed question screens are not behind summary', () => {
  let stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'discover', 'question-detail');
  stacks = pushTabStack(stacks, 'discover', 'quiz');
  stacks = replaceTabStackTop(stacks, 'discover', 'result');

  assert.deepEqual(stacks.discover, ['discover', 'question-detail', 'result']);
});

test('returns completed home and saved quizzes to their tab roots', () => {
  let stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'home', 'question-detail');
  const homeTarget = createQuizReturnTarget(stacks, 'home');
  stacks = pushTabStack(stacks, 'home', 'quiz');
  stacks = replaceTabStackTop(stacks, 'home', 'result');

  let returned = applyQuizReturnTarget(stacks, homeTarget);
  assert.equal(returned.tab, 'home');
  assert.equal(returned.screen, 'home');
  assert.deepEqual(returned.stacks.home, ['home']);

  stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'quiz', 'question-detail');
  const savedTarget = createQuizReturnTarget(stacks, 'quiz');
  stacks = pushTabStack(stacks, 'quiz', 'quiz');
  stacks = replaceTabStackTop(stacks, 'quiz', 'result');

  returned = applyQuizReturnTarget(stacks, savedTarget);
  assert.equal(returned.tab, 'quiz');
  assert.equal(returned.screen, 'my-quizzes');
  assert.deepEqual(returned.stacks.quiz, ['my-quizzes']);
});

test('returns completed discover quizzes to the question set detail origin', () => {
  let stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'discover', 'question-detail');
  const target = createQuizReturnTarget(stacks, 'discover');
  stacks = pushTabStack(stacks, 'discover', 'quiz');
  stacks = replaceTabStackTop(stacks, 'discover', 'result');

  const returned = applyQuizReturnTarget(stacks, target);

  assert.equal(returned.tab, 'discover');
  assert.equal(returned.screen, 'question-detail');
  assert.deepEqual(returned.stacks.discover, ['discover', 'question-detail']);
});
