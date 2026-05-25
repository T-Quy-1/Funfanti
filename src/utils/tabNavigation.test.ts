import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createInitialTabStacks,
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

test('pops through a detail to quiz to result chain inside the active tab', () => {
  let stacks = createInitialTabStacks();
  stacks = pushTabStack(stacks, 'discover', 'question-detail');
  stacks = pushTabStack(stacks, 'discover', 'quiz');
  stacks = pushTabStack(stacks, 'discover', 'result');

  let popped = popTabStack(stacks, 'discover');
  assert.equal(popped.screen, 'quiz');

  popped = popTabStack(popped.stacks, 'discover');
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
