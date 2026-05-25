import test from 'node:test';
import assert from 'node:assert/strict';
import type { QuestionSetCard } from '../data/funfantiContent';
import { filterQuestionSets } from './questionSetFilters';

const makeQuestionSet = (
  overrides: Partial<QuestionSetCard> & Pick<QuestionSetCard, 'id' | 'title'>,
): QuestionSetCard => ({
  id: overrides.id,
  title: overrides.title,
  topic: overrides.topic ?? 'General',
  subtitle: overrides.subtitle ?? 'A useful question set.',
  description: overrides.description ?? 'A useful question set.',
  progress: overrides.progress ?? 0,
  accent: overrides.accent ?? '#FFFFFF',
  artTone: overrides.artTone ?? '#FFFFFF',
  tags: overrides.tags ?? [],
  questionCount: overrides.questionCount ?? 10,
  avgRating: overrides.avgRating ?? 4,
  reviewCount: overrides.reviewCount ?? 0,
  sessionCount: overrides.sessionCount ?? 0,
  isFeatured: overrides.isFeatured ?? false,
  createdAt: overrides.createdAt,
});

const questionSets = [
  makeQuestionSet({
    id: 'featured-math',
    title: 'Featured Math',
    topic: 'Math',
    tags: ['math'],
    isFeatured: true,
    avgRating: 4.8,
    sessionCount: 20,
  }),
  makeQuestionSet({
    id: 'biology',
    title: 'Cell Biology',
    topic: 'Science',
    tags: ['science'],
    isFeatured: false,
    avgRating: 4.5,
    sessionCount: 10,
  }),
  makeQuestionSet({
    id: 'featured-history',
    title: 'Featured History',
    topic: 'History',
    tags: ['history'],
    isFeatured: true,
    avgRating: 3.9,
    sessionCount: 5,
  }),
];

test('search derives local results without mutating the canonical list', () => {
  const originalIds = questionSets.map((questionSet) => questionSet.id);
  const searchResults = filterQuestionSets(questionSets, { search: 'biology' });

  assert.deepEqual(searchResults.map((questionSet) => questionSet.id), ['biology']);
  assert.deepEqual(questionSets.map((questionSet) => questionSet.id), originalIds);
});

test('featured question sets remain based on full canonical data after searching', () => {
  const featuredBeforeSearch = filterQuestionSets(questionSets, { isFeatured: true });
  const searchResults = filterQuestionSets(questionSets, { search: 'biology' });
  const featuredAfterSearch = filterQuestionSets(questionSets, { isFeatured: true });

  assert.deepEqual(searchResults.map((questionSet) => questionSet.id), ['biology']);
  assert.deepEqual(
    featuredBeforeSearch.map((questionSet) => questionSet.id),
    ['featured-math', 'featured-history'],
  );
  assert.deepEqual(
    featuredAfterSearch.map((questionSet) => questionSet.id),
    ['featured-math', 'featured-history'],
  );
});

test('filters by tags, rating, question count, and sort locally', () => {
  const filtered = filterQuestionSets(questionSets, {
    tags: ['math'],
    minRating: 4,
    minQuestions: 5,
    sort: 'popular',
  });

  assert.deepEqual(filtered.map((questionSet) => questionSet.id), ['featured-math']);
});
