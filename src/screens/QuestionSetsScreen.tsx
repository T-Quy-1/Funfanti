import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import { BottomNav, BOTTOM_NAV_CONTENT_PADDING } from '../components';
import type {
  QuestionSetCard,
  QuestionSetFilters,
  QuestionSetSort,
} from '../data/funfantiContent';
import type { AppTab } from './screenTypes';

const palette = {
  primary: '#269D54',
  primaryLight: '#38DE90',
  navy: '#081245',
  white: '#FFFFFF',
  offWhite: '#F9F9F9',
  muted: '#8D8D8D',
  sheet: '#EAFBFC',
  border: '#081245',
};

const questionRanges = [
  { label: '<10 questions', minQuestions: 1, maxQuestions: 9 },
  { label: '10-25 questions', minQuestions: 10, maxQuestions: 25 },
  { label: '25-50 questions', minQuestions: 25, maxQuestions: 50 },
  { label: 'Over 50', minQuestions: 51, maxQuestions: undefined },
];

const sortOptions: Array<{ label: string; value: QuestionSetSort }> = [
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Latest', value: 'latest' },
];

type RatingFilterKey = 'minRating' | 'maxRating';

type QuestionSetsScreenProps = {
  activeTab: AppTab;
  questionSets: QuestionSetCard[];
  questionSetTags: string[];
  questionSetsLoading: boolean;
  questionSetsError: string | null;
  searchQuery: string;
  submittedSearchQuery: string;
  filters: QuestionSetFilters;
  bookmarkedQuestionSetIds: string[];
  bookmarkActionLoadingId: string | null;
  questionSetActionLoadingId: string | null;
  onSelectTab: (tab: AppTab) => void;
  onChangeSearchQuery: (value: string) => void;
  onApplyFilters: (filters: QuestionSetFilters) => void;
  onPlayQuestionSet: (questionSet: QuestionSetCard) => void;
  onToggleBookmark: (questionSet: QuestionSetCard) => void;
};

const matchesQuestionRange = (filters: QuestionSetFilters, range: (typeof questionRanges)[number]) =>
  filters.minQuestions === range.minQuestions && filters.maxQuestions === range.maxQuestions;

const clampRating = (value: number) => Math.min(5, Math.max(0, Math.round(value * 10) / 10));

const formatRatingInputValue = (value?: number) => (value === undefined ? '' : value.toFixed(1));

const normalizeRatingText = (value: string) => value.replace(',', '.').trim();

const isDraftRatingText = (value: string) => value === '' || /^\d?(\.\d?)?$/.test(value);

const parseRatingText = (value: string) => {
  if (value === '') {
    return undefined;
  }

  const rating = Number(value);
  if (!Number.isFinite(rating)) {
    return undefined;
  }

  return clampRating(rating);
};

const defaultRatingForKey = (key: RatingFilterKey) => (key === 'minRating' ? 0 : 5);

const hasRatingFilter = (filters: QuestionSetFilters) =>
  (filters.minRating !== undefined && filters.minRating > 0) ||
  (filters.maxRating !== undefined && filters.maxRating < 5);

const hasActiveQuestionSetFilters = (filters: QuestionSetFilters) =>
  Boolean(
    filters.tags?.length ||
      filters.minQuestions !== undefined ||
      filters.maxQuestions !== undefined ||
      hasRatingFilter(filters) ||
      filters.sort,
  );

const splitTagsIntoRows = (tags: string[]) => {
  const rowBreak = Math.ceil(tags.length / 2);
  return [tags.slice(0, rowBreak), tags.slice(rowBreak)];
};

const withoutQuestionRange = (filters: QuestionSetFilters): QuestionSetFilters => {
  const { minQuestions, maxQuestions, ...rest } = filters;
  return rest;
};

const withoutSort = (filters: QuestionSetFilters): QuestionSetFilters => {
  const { sort, ...rest } = filters;
  return rest;
};

const normalizeRatingRange = (filters: QuestionSetFilters): QuestionSetFilters => {
  let normalizedFilters = filters;

  if (
    filters.minRating !== undefined &&
    filters.maxRating !== undefined &&
    filters.minRating > filters.maxRating
  ) {
    normalizedFilters = {
      ...filters,
      minRating: filters.maxRating,
      maxRating: filters.minRating,
    };
  }

  const { minRating, maxRating, ...rest } = normalizedFilters;
  return {
    ...rest,
    ...(minRating !== undefined && minRating > 0 ? { minRating } : {}),
    ...(maxRating !== undefined && maxRating < 5 ? { maxRating } : {}),
  };
};

const resolveImageSource = (questionSet: QuestionSetCard): ImageSourcePropType | undefined => {
  if (questionSet.imageSource) {
    return questionSet.imageSource;
  }

  if (questionSet.imageUrl) {
    return { uri: questionSet.imageUrl };
  }

  return undefined;
};

function QuestionSetCardView({
  bookmarked,
  bookmarkLoading,
  loading,
  questionSet,
  onPlay,
  onToggleBookmark,
}: {
  bookmarked: boolean;
  bookmarkLoading: boolean;
  loading: boolean;
  questionSet: QuestionSetCard;
  onPlay: () => void;
  onToggleBookmark: () => void;
}) {
  const imageSource = resolveImageSource(questionSet);
  const [countInfoVisible, setCountInfoVisible] = useState(false);

  return (
    <View style={styles.questionCard}>
      <View style={[styles.questionCardImage, { backgroundColor: questionSet.artTone }]}>
        {imageSource ? <Image source={imageSource} style={styles.questionCardImageAsset} resizeMode="cover" /> : null}
        <View style={styles.imageOverlay} />
        <Text style={styles.questionCardTitle}>{questionSet.title}</Text>
      </View>

      <View style={styles.questionCardBody}>
        <View style={styles.tagRow}>
          <Text style={styles.tagsLabel}>Tags:</Text>
          {questionSet.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.cardTag}>
              <Text style={styles.cardTagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardMetaRow}>
          <Text style={styles.questionCount}>{questionSet.questionCount} questions</Text>
          <Pressable
            accessibilityLabel={`About ${questionSet.title} question count`}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.helpCircle,
              countInfoVisible && styles.helpCircleActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setCountInfoVisible((visible) => !visible)}
          >
            <Feather name="help-circle" size={16} color={palette.navy} />
          </Pressable>
          <View style={styles.ratingPill}>
            <Feather name="star" size={12} color={palette.primary} />
            <Text style={styles.ratingText}>{questionSet.avgRating.toFixed(1)}</Text>
          </View>
        </View>

        {countInfoVisible ? (
          <View style={styles.cardInfoPanel}>
            <Text style={styles.cardInfoText}>
              This set includes {questionSet.questionCount} questions. {questionSet.subtitle}
            </Text>
            <Feather name="chevrons-up" size={18} color={palette.navy} />
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <Pressable
            disabled={loading}
            style={({ pressed }) => [styles.playButton, pressed && styles.pressed, loading && styles.disabledButton]}
            onPress={onPlay}
          >
            <Text style={styles.playButtonText}>{loading ? 'Loading' : 'Play'}</Text>
          </Pressable>
          <Pressable
            disabled={bookmarkLoading}
            style={({ pressed }) => [
              styles.saveButton,
              bookmarked && styles.saveButtonActive,
              bookmarkLoading && styles.disabledButton,
              pressed && !bookmarkLoading && styles.pressed,
            ]}
            onPress={onToggleBookmark}
          >
            <Feather
              name={bookmarked ? 'check-circle' : 'bookmark'}
              size={16}
              color={bookmarked ? palette.white : palette.navy}
            />
            <Text style={[styles.saveButtonText, bookmarked && styles.saveButtonTextActive]}>
              {bookmarkLoading ? 'Saving' : bookmarked ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ChoiceChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.choiceChip, active && styles.choiceChipActive, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
      {active ? <Feather name="check-circle" size={14} color={palette.navy} /> : null}
    </Pressable>
  );
}

export function QuestionSetsScreen({
  activeTab,
  questionSets,
  questionSetTags,
  questionSetsLoading,
  questionSetsError,
  searchQuery,
  submittedSearchQuery,
  filters,
  bookmarkedQuestionSetIds,
  bookmarkActionLoadingId,
  questionSetActionLoadingId,
  onSelectTab,
  onChangeSearchQuery,
  onApplyFilters,
  onPlayQuestionSet,
  onToggleBookmark,
}: QuestionSetsScreenProps) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftFilters, setDraftFilters] = useState<QuestionSetFilters>(filters);
  const [draftMinRatingText, setDraftMinRatingText] = useState(formatRatingInputValue(filters.minRating));
  const [draftMaxRatingText, setDraftMaxRatingText] = useState(formatRatingInputValue(filters.maxRating));
  const [questionCountHelpVisible, setQuestionCountHelpVisible] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  const searchActive = submittedSearchQuery.trim().length > 0;
  const hasActiveFilters = hasActiveQuestionSetFilters(filters);
  const showFeatured = !searchActive && !hasActiveFilters;

  const availableTags = useMemo(
    () => Array.from(new Set(questionSetTags.map((tag) => tag.trim()).filter(Boolean))),
    [questionSetTags],
  );
  const tagRows = useMemo(() => splitTagsIntoRows(availableTags), [availableTags]);

  const activeFilterCount = useMemo(() => {
    const tagCount = filters.tags?.length ?? 0;
    const rangeCount = filters.minQuestions !== undefined || filters.maxQuestions !== undefined ? 1 : 0;
    const ratingCount = hasRatingFilter(filters) ? 1 : 0;
    const sortCount = filters.sort ? 1 : 0;
    return tagCount + rangeCount + ratingCount + sortCount;
  }, [filters]);

  const dismissFilterSheet = useCallback(() => {
    Animated.timing(sheetTranslateY, {
      toValue: 520,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setFilterVisible(false);
      sheetTranslateY.setValue(0);
    });
  }, [sheetTranslateY]);

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_event, gestureState) => {
          sheetTranslateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (gestureState.dy > 90 || gestureState.vy > 0.9) {
            dismissFilterSheet();
            return;
          }

          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 90,
            friction: 12,
          }).start();
        },
      }),
    [dismissFilterSheet, sheetTranslateY],
  );

  const openFilters = () => {
    sheetTranslateY.setValue(0);
    setDraftFilters(filters);
    setDraftMinRatingText(formatRatingInputValue(filters.minRating));
    setDraftMaxRatingText(formatRatingInputValue(filters.maxRating));
    setQuestionCountHelpVisible(false);
    setFilterVisible(true);
  };

  const toggleDraftTag = (tag: string) => {
    setDraftFilters((current) => {
      const tags = current.tags ?? [];
      const nextTags = tags.includes(tag)
        ? tags.filter((currentTag) => currentTag !== tag)
        : [...tags, tag];
      return { ...current, tags: nextTags };
    });
  };

  const toggleDraftQuestionRange = (range: (typeof questionRanges)[number]) => {
    setDraftFilters((current) =>
      matchesQuestionRange(current, range)
        ? withoutQuestionRange(current)
        : {
            ...current,
            minQuestions: range.minQuestions,
            maxQuestions: range.maxQuestions,
          },
    );
  };

  const updateDraftRating = (key: RatingFilterKey, value: string) => {
    const nextText = normalizeRatingText(value);

    if (!isDraftRatingText(nextText)) {
      return;
    }

    const nextRating = parseRatingText(nextText);
    const displayText =
      nextRating !== undefined && Number(nextText) !== nextRating ? formatRatingInputValue(nextRating) : nextText;

    if (key === 'minRating') {
      setDraftMinRatingText(displayText);
    } else {
      setDraftMaxRatingText(displayText);
    }

    setDraftFilters((current) => ({
      ...current,
      [key]: nextRating,
    }));
  };

  const stepDraftRating = (key: RatingFilterKey, direction: -1 | 1) => {
    const currentText = key === 'minRating' ? draftMinRatingText : draftMaxRatingText;
    const currentValue = parseRatingText(currentText) ?? draftFilters[key] ?? defaultRatingForKey(key);
    const nextRating = clampRating(currentValue + direction * 0.1);

    if (key === 'minRating') {
      setDraftMinRatingText(formatRatingInputValue(nextRating));
    } else {
      setDraftMaxRatingText(formatRatingInputValue(nextRating));
    }

    setDraftFilters((current) => {
      return {
        ...current,
        [key]: nextRating,
      };
    });
  };

  const toggleDraftSort = (sort: QuestionSetSort) => {
    setDraftFilters((current) => (current.sort === sort ? withoutSort(current) : { ...current, sort }));
  };

  const applyDraftFilters = () => {
    const normalizedFilters = normalizeRatingRange(draftFilters);
    onApplyFilters(normalizedFilters);
    dismissFilterSheet();
  };

  const resetDraftFilters = () => {
    setDraftFilters({});
    setDraftMinRatingText('');
    setDraftMaxRatingText('');
    setQuestionCountHelpVisible(false);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <SafeAreaView style={styles.headerSafeArea}>
          <Text style={styles.headerTitle}>Question Sets</Text>
        </SafeAreaView>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <TextInput
            returnKeyType="search"
            style={styles.searchInput}
            placeholder="Discover something new..."
            placeholderTextColor={palette.muted}
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            onSubmitEditing={() => onApplyFilters({ ...filters, search: searchQuery })}
          />
          <Feather name="search" size={25} color={palette.navy} />
        </View>
        <Pressable style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]} onPress={openFilters}>
          <Feather name="sliders" size={23} color={palette.white} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.resultsTitle, !showFeatured && styles.resultsTitleSearch]}>
          {showFeatured ? (
            'Featured'
          ) : (
            <>
              Found <Text style={styles.resultsCount}>{questionSets.length}</Text>{' '}
              {questionSets.length === 1 ? 'result' : 'results'} ...
            </>
          )}
        </Text>

        {questionSetsError ? <Text style={styles.errorText}>{questionSetsError}</Text> : null}
        {questionSetsLoading ? <Text style={styles.loadingText}>Refreshing question sets...</Text> : null}

        {questionSets.length === 0 && !questionSetsLoading ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={26} color={palette.primary} />
            <Text style={styles.emptyTitle}>No matching sets</Text>
            <Text style={styles.emptyText}>Try a broader search or clear one of the filters.</Text>
          </View>
        ) : null}

        {questionSets.map((questionSet) => (
          <QuestionSetCardView
            key={questionSet.id}
            questionSet={questionSet}
            bookmarked={bookmarkedQuestionSetIds.includes(questionSet.id)}
            bookmarkLoading={bookmarkActionLoadingId === questionSet.id}
            loading={questionSetActionLoadingId === questionSet.id}
            onPlay={() => onPlayQuestionSet(questionSet)}
            onToggleBookmark={() => onToggleBookmark(questionSet)}
          />
        ))}
      </ScrollView>

      <BottomNav activeTab={activeTab} onSelect={onSelectTab} />

      <Modal visible={filterVisible} transparent animationType="none" onRequestClose={dismissFilterSheet}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={dismissFilterSheet} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}
            pointerEvents="box-none"
            style={styles.modalKeyboardAvoiding}
          >
            <Animated.View
              style={[styles.filterSheet, { transform: [{ translateY: sheetTranslateY }] }]}
              {...sheetPanResponder.panHandlers}
            >
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleRow}>
                  <Text style={styles.sheetTitle}>Filters</Text>
                  <Feather name="sliders" size={20} color={palette.primary} />
                </View>
                <Pressable style={styles.sheetCloseButton} onPress={dismissFilterSheet}>
                  <Feather name="x" size={18} color={palette.navy} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEnabled
              >
              <View style={styles.filterSection}>
                <View style={styles.filterTitleRow}>
                  <Text style={styles.filterSectionTitle}>Number of Questions</Text>
                  <Pressable
                    accessibilityLabel="About question counts"
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.filterHelpButton,
                      questionCountHelpVisible && styles.filterHelpButtonActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setQuestionCountHelpVisible((visible) => !visible)}
                  >
                    <Feather name="help-circle" size={17} color={palette.navy} />
                  </Pressable>
                </View>
                {questionCountHelpVisible ? (
                  <View style={styles.tooltipBubble}>
                    <Text style={styles.tooltipText}>
                      Question count is the total number of playable questions in a set. These ranges filter whole
                      sets, not individual quiz attempts.
                    </Text>
                  </View>
                ) : null}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                  {questionRanges.map((range) => (
                    <ChoiceChip
                      key={range.label}
                      active={matchesQuestionRange(draftFilters, range)}
                      label={range.label}
                      onPress={() => toggleDraftQuestionRange(range)}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Tags</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagGridScroller}
                >
                  <View style={styles.tagRows}>
                    {tagRows.map((row, rowIndex) => (
                      <View key={`tag-row-${rowIndex}`} style={styles.tagFilterRow}>
                        {row.map((tag) => (
                          <ChoiceChip
                            key={tag}
                            active={(draftFilters.tags ?? []).includes(tag)}
                            label={tag}
                            onPress={() => toggleDraftTag(tag)}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Ratings</Text>
                <View style={styles.ratingInputsRow}>
                  <Text style={styles.ratingCopy}>Between</Text>
                  <View style={styles.ratingInputGroup}>
                    <Pressable
                      accessibilityLabel="Decrease minimum rating"
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.ratingStepperButton, pressed && styles.pressed]}
                      onPress={() => stepDraftRating('minRating', -1)}
                    >
                      <Feather name="minus" size={14} color={palette.navy} />
                    </Pressable>
                    <TextInput
                      keyboardType="decimal-pad"
                      maxLength={3}
                      placeholder="0.0"
                      placeholderTextColor={palette.muted}
                      style={styles.ratingInput}
                      value={draftMinRatingText}
                      onChangeText={(value) => updateDraftRating('minRating', value)}
                    />
                    <Pressable
                      accessibilityLabel="Increase minimum rating"
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.ratingStepperButton, pressed && styles.pressed]}
                      onPress={() => stepDraftRating('minRating', 1)}
                    >
                      <Feather name="plus" size={14} color={palette.navy} />
                    </Pressable>
                  </View>
                  <Text style={styles.ratingCopy}>and</Text>
                  <View style={styles.ratingInputGroup}>
                    <Pressable
                      accessibilityLabel="Decrease maximum rating"
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.ratingStepperButton, pressed && styles.pressed]}
                      onPress={() => stepDraftRating('maxRating', -1)}
                    >
                      <Feather name="minus" size={14} color={palette.navy} />
                    </Pressable>
                    <TextInput
                      keyboardType="decimal-pad"
                      maxLength={3}
                      placeholder="5.0"
                      placeholderTextColor={palette.muted}
                      style={styles.ratingInput}
                      value={draftMaxRatingText}
                      onChangeText={(value) => updateDraftRating('maxRating', value)}
                    />
                    <Pressable
                      accessibilityLabel="Increase maximum rating"
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.ratingStepperButton, pressed && styles.pressed]}
                      onPress={() => stepDraftRating('maxRating', 1)}
                    >
                      <Feather name="plus" size={14} color={palette.navy} />
                    </Pressable>
                  </View>
                  <Text style={styles.ratingCopy}>stars</Text>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort</Text>
                <View style={styles.wrapRow}>
                  {sortOptions.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      active={draftFilters.sort === option.value}
                      label={option.label}
                      onPress={() => toggleDraftSort(option.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.sheetActions}>
                <Pressable style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]} onPress={resetDraftFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]} onPress={applyDraftFilters}>
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </Pressable>
              </View>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    minHeight: 118,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  headerSafeArea: {
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    paddingBottom: 20,
  },
  headerTitle: {
    color: palette.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 13,
    marginTop: 14,
    marginBottom: 12,
  },
  searchField: {
    flex: 1,
    height: 48,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: palette.navy,
    backgroundColor: palette.offWhite,
    paddingLeft: 20,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: palette.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 23,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  resultsTitle: {
    color: palette.primary,
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultsTitleSearch: {
    color: palette.navy,
    fontSize: 18,
    lineHeight: 27,
    marginBottom: 13,
  },
  resultsCount: {
    color: palette.primary,
  },
  errorText: {
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  loadingText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  questionCard: {
    backgroundColor: palette.sheet,
    borderWidth: 1,
    borderColor: palette.navy,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 22,
  },
  questionCardImage: {
    height: 187,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  questionCardImageAsset: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  questionCardTitle: {
    color: palette.white,
    fontSize: 22,
    lineHeight: 33,
    fontWeight: '700',
    paddingHorizontal: 21,
    paddingTop: 17,
  },
  questionCardBody: {
    paddingHorizontal: 23,
    paddingTop: 9,
    paddingBottom: 17,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
  },
  tagsLabel: {
    color: '#020202',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  cardTag: {
    minHeight: 16,
    borderRadius: 327,
    backgroundColor: palette.navy,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTagText: {
    color: palette.white,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  questionCount: {
    color: palette.navy,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  helpCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCircleActive: {
    backgroundColor: 'rgba(56,222,144,0.22)',
  },
  ratingPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: palette.primary,
    paddingHorizontal: 8,
    minHeight: 22,
    backgroundColor: 'rgba(56,222,144,0.18)',
  },
  ratingText: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  cardInfoPanel: {
    marginTop: 7,
    alignItems: 'center',
    gap: 5,
  },
  cardInfoText: {
    color: '#020202',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  playButton: {
    flex: 1,
    height: 44,
    borderRadius: 28,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: palette.offWhite,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  saveButtonActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  saveButtonText: {
    color: palette.navy,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  saveButtonTextActive: {
    color: palette.white,
  },
  disabledButton: {
    opacity: 0.72,
  },
  emptyState: {
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(8,18,69,0.14)',
    backgroundColor: palette.sheet,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 12,
  },
  emptyTitle: {
    color: palette.navy,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },
  modalRoot: {
    position: Platform.OS === 'web' ? ('fixed' as 'absolute') : 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalKeyboardAvoiding: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8,18,69,0.28)',
  },
  filterSheet: {
    maxHeight: '84%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: palette.sheet,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(8,18,69,0.2)',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    color: palette.primary,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  sheetCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  sheetContent: {
    paddingBottom: 18,
    gap: 18,
  },
  filterSection: {
    gap: 9,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  filterSectionTitle: {
    color: palette.navy,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  filterHelpButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: 'rgba(8,18,69,0.16)',
  },
  filterHelpButtonActive: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(56,222,144,0.18)',
  },
  tooltipBubble: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(8,18,69,0.12)',
    backgroundColor: palette.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tooltipText: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  choiceRow: {
    gap: 10,
    paddingRight: 20,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagGridScroller: {
    paddingRight: 20,
  },
  tagRows: {
    gap: 10,
  },
  tagFilterRow: {
    flexDirection: 'row',
    gap: 10,
    minHeight: 29,
  },
  choiceChip: {
    minHeight: 29,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: palette.primary,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  choiceChipActive: {
    backgroundColor: palette.primaryLight,
  },
  choiceChipText: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  choiceChipTextActive: {
    fontWeight: '600',
  },
  ratingInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingInputGroup: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ratingStepperButton: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56,222,144,0.14)',
  },
  ratingInput: {
    width: 46,
    height: 38,
    color: palette.navy,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  ratingCopy: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  resetButtonText: {
    color: palette.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 360,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: palette.offWhite,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.72,
  },
});
