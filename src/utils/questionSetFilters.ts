import type { QuestionSetCard, QuestionSetFilters } from '../data/funfantiContent';

const normalizeSearchValue = (value: string) => value.trim().toLowerCase();

const questionSetMatchesSearch = (questionSet: QuestionSetCard, search: string) => {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    questionSet.title,
    questionSet.topic,
    questionSet.subtitle,
    questionSet.description,
    questionSet.summary,
    questionSet.creatorName,
    ...questionSet.tags,
  ];

  return searchableValues.some((value) =>
    String(value ?? '').toLowerCase().includes(normalizedSearch),
  );
};

const questionSetMatchesTags = (questionSet: QuestionSetCard, tags: string[]) => {
  if (tags.length === 0) {
    return true;
  }

  const questionSetTags = new Set(questionSet.tags.map((tag) => tag.toLowerCase()));
  return tags.every((tag) => questionSetTags.has(tag.toLowerCase()));
};

export const filterQuestionSets = (
  questionSets: QuestionSetCard[],
  filters: QuestionSetFilters = {},
) => {
  const tags = filters.tags?.filter((tag) => tag.trim()) ?? [];
  const minRating = filters.minRating ?? 0;
  const maxRating = filters.maxRating ?? 5;

  const filteredQuestionSets = questionSets.filter((questionSet) => {
    if (filters.isFeatured !== undefined && questionSet.isFeatured !== filters.isFeatured) {
      return false;
    }

    if (!questionSetMatchesSearch(questionSet, filters.search ?? '')) {
      return false;
    }

    if (!questionSetMatchesTags(questionSet, tags)) {
      return false;
    }

    if (filters.minQuestions !== undefined && questionSet.questionCount < filters.minQuestions) {
      return false;
    }

    if (filters.maxQuestions !== undefined && questionSet.questionCount > filters.maxQuestions) {
      return false;
    }

    return questionSet.avgRating >= minRating && questionSet.avgRating <= maxRating;
  });

  if (!filters.sort) {
    return filteredQuestionSets;
  }

  return [...filteredQuestionSets].sort((a, b) => {
    if (filters.sort === 'rating') {
      return b.avgRating - a.avgRating || b.reviewCount - a.reviewCount;
    }

    if (filters.sort === 'popular') {
      return b.sessionCount - a.sessionCount || b.reviewCount - a.reviewCount;
    }

    const aCreatedAt = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreatedAt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreatedAt - aCreatedAt;
  });
};
