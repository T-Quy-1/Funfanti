import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomNav, BOTTOM_NAV_CONTENT_PADDING } from '../components';
import type { AppTab } from './screenTypes';
import { QuestionSetsScreen } from './QuestionSetsScreen';
import {
  QuestionSetDetailScreen,
  QuestionSetQuizScreen,
  QuestionSetSummaryScreen,
} from './QuestionSetPlayFlow';
import type { QuestionSetCard, QuizQuestion, QuestionSetFilters } from '../data/funfantiContent';
import type {
  NotificationSchedule,
  QuizSessionResult,
  UserActivity,
  UserBookmark,
  UserProfile,
} from '../services/funfantiApi';
import {
  POPUP_CHECK_INTERVAL_MINUTES,
  areNotificationIntervalsEqual,
  buildLockScreenTimingPreference,
  createEditableNotificationInterval,
  formatIntervalLabel,
  normalizeLockScreenTiming,
  sanitizeTimeInput,
  serializeNotificationIntervals,
  toEditableNotificationIntervals,
  validateNotificationIntervals,
  type EditableNotificationInterval,
  type LockScreenTimingPreference,
} from '../utils/notificationPreferences';

type MainFlowProps = {
  screen: 'home' | 'my-quizzes' | 'discover' | 'question-detail' | 'quiz' | 'result' | 'profile';
  profile: UserProfile | null;
  profileSaving: boolean;
  profileError: string | null;
  userSpaceLoading: boolean;
  userSpaceError: string | null;
  bookmarks: UserBookmark[];
  activity: UserActivity[];
  schedules: NotificationSchedule[];
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenDiscover: () => void;
  onBack: () => void;
  activeQuestionSet: QuestionSetCard | null;
  questionSets: QuestionSetCard[];
  questionSetTags: string[];
  questionSetsLoading: boolean;
  questionSetsError: string | null;
  bookmarkedQuestionSetIds: string[];
  bookmarkActionLoadingId: string | null;
  questionSetActionLoadingId: string | null;
  questionSetActionError: string | null;
  quizQuestions: QuizQuestion[];
  quizIndex: number;
  selectedChoice: string | null;
  scoreSummary: { answered: number; correct: number; total: number; accuracy: number };
  currentQuestion: QuizQuestion | null;
  questionStartedAtMs: number;
  questionDurations: Record<string, number>;
  quizTotalTimeMs: number;
  quizSessionResult: QuizSessionResult | null;
  quizSubmissionLoading: boolean;
  quizSubmissionError: string | null;
  notificationOverlay: boolean;
  onSelectChoice: (choiceId: string) => void;
  onAdvanceQuiz: () => void;
  onSeeQuizSummary: () => void;
  onTakeQuestionSetQuiz: () => void;
  onStartQuestionSet: (questionSet: QuestionSetCard) => void;
  onToggleQuestionSetBookmark: (questionSet: QuestionSetCard) => void;
  onRetryQuiz: () => void;
  onContinueHome: () => void;
  onUpdateProfile: (payload: { displayName?: string; avatarUrl?: string }) => void;
  onRefreshUserSpace: () => void;
  onUpdateNotificationOverlay: (value: boolean) => void;
  onUpdateLockScreenTiming: (payload: LockScreenTimingPreference) => void;
  onUpdateDiscoverFilters: (filters: QuestionSetFilters) => void;
};

const palette = {
  primary: '#269D54',
  navy: '#081245',
  black: '#161616',
  ink: '#24252C',
  white: '#FFFFFF',
  peach: '#FED19C',
  mint: '#D3F1D9',
  lime: '#EEF4C2',
  aqua: 'rgba(43,217,222,0.5)',
  coral: '#FF8080',
  page: '#FFFFFF',
  muted: '#5F6672',
  line: '#E8EDF0',
  danger: '#B42318',
};

const courseCardColors = [palette.peach, palette.mint, palette.lime, palette.aqua, palette.coral];

const truncateText = (value: string, maxLength = 34) =>
  value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));

const formatTime = (value: number | null) => {
  if (value === null) {
    return 'Not recorded';
  }
  return `${Math.max(1, Math.round(value / 1000))}s`;
};

const createCardFromBookmark = (bookmark: UserBookmark, questionSets: QuestionSetCard[]): QuestionSetCard => {
  const matched = questionSets.find((questionSet) => questionSet.id === bookmark.questionSet.id);
  if (matched) {
    return matched;
  }

  return {
    id: bookmark.questionSet.id,
    title: bookmark.questionSet.title,
    topic: bookmark.questionSet.topic,
    subtitle: bookmark.questionSet.description,
    description: bookmark.questionSet.description,
    progress: 0,
    accent: '#E9FBFD',
    artTone: '#DDF7FA',
    imageUrl: bookmark.questionSet.mediaUrl ?? undefined,
    imageSource: undefined,
    tags: [],
    questionCount: 0,
    avgRating: 0,
    reviewCount: 0,
    sessionCount: 0,
    isFeatured: bookmark.questionSet.isFeatured,
    isBookmarked: true,
  };
};

const createCardFromActivity = (
  item: UserActivity,
  questionSets: QuestionSetCard[],
  bookmarkedQuestionSetIds: string[],
): QuestionSetCard => {
  const matched = questionSets.find((questionSet) => questionSet.id === item.questionSet.id);
  if (matched) {
    return matched;
  }

  return {
    id: item.questionSet.id,
    title: item.questionSet.title,
    topic: item.questionSet.topic,
    subtitle: `${item.status} - ${formatDate(item.createdAt)} - ${formatTime(item.totalTimeMs)}`,
    description: `${item.questionSet.title} activity from ${formatDate(item.createdAt)}.`,
    progress: item.status.toLowerCase() === 'completed' ? 1 : 0,
    accent: '#E9FBFD',
    artTone: '#DDF7FA',
    imageUrl: undefined,
    imageSource: undefined,
    tags: [],
    questionCount: 0,
    avgRating: 0,
    reviewCount: 0,
    sessionCount: 0,
    isFeatured: false,
    isBookmarked: bookmarkedQuestionSetIds.includes(item.questionSet.id),
  };
};

export function MainFlow(props: MainFlowProps) {
  const {
    screen,
    profile,
    profileSaving,
    profileError,
    userSpaceLoading,
    userSpaceError,
    bookmarks,
    activity,
    schedules,
    activeTab,
    onSelectTab,
    onOpenDiscover,
    onBack,
    activeQuestionSet,
    questionSets,
    questionSetTags,
    questionSetsLoading,
    questionSetsError,
    bookmarkedQuestionSetIds,
    bookmarkActionLoadingId,
    questionSetActionLoadingId,
    questionSetActionError,
    quizQuestions,
    quizIndex,
    selectedChoice,
    scoreSummary,
    currentQuestion,
    questionStartedAtMs,
    questionDurations,
    quizTotalTimeMs,
    quizSessionResult,
    quizSubmissionLoading,
    quizSubmissionError,
    notificationOverlay,
    onSelectChoice,
    onAdvanceQuiz,
    onSeeQuizSummary,
    onTakeQuestionSetQuiz,
    onStartQuestionSet,
    onToggleQuestionSetBookmark,
    onRetryQuiz,
    onContinueHome,
    onUpdateProfile,
    onRefreshUserSpace,
    onUpdateNotificationOverlay,
    onUpdateLockScreenTiming,
    onUpdateDiscoverFilters,
  } = props;

  const displayName = profile?.displayName?.trim() || 'Funfanti Learner';
  const displayEmail = profile?.email?.trim() || 'No email available';
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const [displayNameDraft, setDisplayNameDraft] = useState(displayName);
  const [avatarUrlDraft, setAvatarUrlDraft] = useState(profile?.avatarUrl ?? '');
  const [lockScreenIntervalDrafts, setLockScreenIntervalDrafts] = useState<EditableNotificationInterval[]>([]);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [visibleActivityCount, setVisibleActivityCount] = useState(10);

  useEffect(() => {
    setDisplayNameDraft(displayName);
    setAvatarUrlDraft(profile?.avatarUrl ?? '');
  }, [displayName, profile?.avatarUrl]);

  useEffect(() => {
    setLockScreenIntervalDrafts(toEditableNotificationIntervals(profile?.preference?.lockScreenTiming));
  }, [profile?.preference?.lockScreenTiming]);


  useEffect(() => {
    if (activityModalVisible) {
      setVisibleActivityCount(10);
    }
  }, [activityModalVisible]);

  const featuredQuestionSets = useMemo(() => {
    return questionSets.filter((questionSet) => questionSet.isFeatured).slice(0, 5);
  }, [questionSets]);

  const recentDistinctQuestionSets = useMemo(() => {
    const seenQuestionSetIds = new Set<string>();
    const distinctItems: QuestionSetCard[] = [];

    for (const item of activity) {
      if (seenQuestionSetIds.has(item.questionSet.id)) {
        continue;
      }

      seenQuestionSetIds.add(item.questionSet.id);
      distinctItems.push(createCardFromActivity(item, questionSets, bookmarkedQuestionSetIds));

      if (distinctItems.length === 2) {
        break;
      }
    }

    return distinctItems;
  }, [activity, bookmarkedQuestionSetIds, questionSets]);

  const savedQuestionSets = useMemo(
    () => bookmarks.map((bookmark) => createCardFromBookmark(bookmark, questionSets)),
    [bookmarks, questionSets],
  );

  const visibleActivity = useMemo(
    () => activity.slice(0, visibleActivityCount),
    [activity, visibleActivityCount],
  );

  const profileChanged =
    displayNameDraft.trim() !== (profile?.displayName ?? '').trim() ||
    avatarUrlDraft.trim() !== (profile?.avatarUrl ?? '').trim();

  const currentLockScreenTiming = normalizeLockScreenTiming(profile?.preference?.lockScreenTiming);
  const lockScreenIntervalValidation = validateNotificationIntervals(lockScreenIntervalDrafts);
  const lockScreenTimingChanged = !areNotificationIntervalsEqual(
    lockScreenIntervalDrafts,
    currentLockScreenTiming.intervals,
  );
  const canSaveLockScreenTiming = lockScreenTimingChanged && lockScreenIntervalValidation.isValid;
  const serializedLockScreenIntervals = serializeNotificationIntervals(lockScreenIntervalDrafts);

  const lockScreenTimingSummary = serializedLockScreenIntervals.length
    ? serializedLockScreenIntervals.map(formatIntervalLabel).join(' | ')
    : 'No active windows';

  const renderBottomNav = () => <BottomNav activeTab={activeTab} onSelect={onSelectTab} />;

  const renderAppHeader = (title: string) => (
    <SafeAreaView style={styles.headerSafeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </SafeAreaView>
  );

  const renderError = (message: string | null) =>
    message ? <Text style={styles.errorText}>{message}</Text> : null;

  const addLockScreenInterval = () => {
    setLockScreenIntervalDrafts((current) => [
      ...current,
      createEditableNotificationInterval('08:00', '12:00'),
    ]);
  };

  const updateLockScreenInterval = (
    intervalId: string,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    const nextValue = sanitizeTimeInput(value);

    setLockScreenIntervalDrafts((current) =>
      current.map((interval) =>
        interval.id === intervalId ? { ...interval, [field]: nextValue } : interval,
      ),
    );
  };

  const removeLockScreenInterval = (intervalId: string) => {
    setLockScreenIntervalDrafts((current) => current.filter((interval) => interval.id !== intervalId));
  };

  const renderCourseCard = (
    questionSet: QuestionSetCard,
    index: number,
    variant: 'horizontal' | 'full',
  ) => {
    const cardColor = courseCardColors[index % courseCardColors.length];
    const status = questionSet.progress >= 1 ? 'Completed' : questionSet.isBookmarked ? 'Saved' : 'Available';
    const widthStyle = variant === 'horizontal' ? styles.homeCourseCard : styles.quizCourseCard;

    return (
      <Pressable
        key={questionSet.id}
        style={({ pressed }) => [widthStyle, { backgroundColor: cardColor }, pressed && styles.pressed]}
        onPress={() => onStartQuestionSet(questionSet)}
      >
        <Text style={styles.courseTitle}>{truncateText(questionSet.title, 42)}</Text>
        <Text style={styles.courseAuthor}>
          {truncateText(questionSet.creatorName ?? questionSet.topic, 36)}
        </Text>
        <Text style={styles.courseSummary} numberOfLines={3}>
          {questionSet.subtitle}
        </Text>
        <View style={styles.courseMetaRow}>
          {questionSet.questionCount > 0 ? (
            <View style={styles.courseMetaItem}>
              <Feather name="book-open" size={15} color={palette.black} />
              <Text style={styles.courseMetaText}>
                {questionSet.questionCount} {questionSet.questionCount === 1 ? 'Question' : 'Questions'}
              </Text>
            </View>
          ) : (
            <Text style={styles.courseMetaText}>{questionSet.topic}</Text>
          )}
          {questionSet.avgRating > 0 ? (
            <View style={styles.courseMetaItem}>
              <Feather name="star" size={14} color={palette.black} />
              <Text style={styles.courseMetaText}>{questionSet.avgRating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.statusPill}>
          <Text style={[styles.statusText, { color: cardColor }]}>{status}</Text>
        </View>
      </Pressable>
    );
  };

  const renderActivityRow = (item: UserActivity, compact = false, onPress?: () => void) => {
    const rowContent = (
      <>
        <View style={styles.activityCopy}>
          <Text style={styles.listText}>{item.questionSet.title}</Text>
          <Text style={styles.mutedText}>
            {item.status} - {formatDate(item.createdAt)} - {formatTime(item.totalTimeMs)}
          </Text>
        </View>
        <Text style={styles.activityScore}>
          {item.score === null ? '--' : `${item.score}%`}
        </Text>
      </>
    );

    if (onPress) {
      return (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`Open full activity history from ${item.questionSet.title}`}
          style={({ pressed }) => [
            styles.activityRow,
            compact && styles.activityRowCompact,
            pressed && styles.pressed,
          ]}
          onPress={onPress}
        >
          {rowContent}
        </Pressable>
      );
    }

    return (
      <View key={item.id} style={[styles.activityRow, compact && styles.activityRowCompact]}>
        {rowContent}
      </View>
    );
  };

  const openActivityHistory = () => {
    setVisibleActivityCount(10);
    setActivityModalVisible(true);
  };

  const closeActivityHistory = () => {
    setActivityModalVisible(false);
  };

  const maybeLoadMoreActivity = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: {
    layoutMeasurement: { height: number };
    contentOffset: { y: number };
    contentSize: { height: number };
  }) => {
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
    if (nearBottom && visibleActivityCount < activity.length) {
      setVisibleActivityCount((current) => Math.min(current + 10, activity.length));
    }
  };

  const renderActivityHistoryModal = () =>
    activityModalVisible ? (
      <View style={styles.historyModalRoot}>
        <Pressable
          accessibilityLabel="Dismiss activity history overlay"
          accessibilityRole="button"
          style={styles.historyModalBackdrop}
          onPress={closeActivityHistory}
        />
        <View style={styles.historySheet}>
          <View style={styles.historySheetHeader}>
            <View>
              <Text style={styles.historySheetTitle}>Activity History</Text>
              <Text style={styles.mutedText}>{activity.length} recorded play sessions</Text>
            </View>
            <Pressable
              accessibilityLabel="Close activity history"
              accessibilityRole="button"
              style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}
              onPress={closeActivityHistory}
            >
              <Feather name="x" size={18} color={palette.navy} />
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
            onScroll={({ nativeEvent }) => maybeLoadMoreActivity(nativeEvent)}
            scrollEventThrottle={80}
          >
            {visibleActivity.length > 0 ? (
              visibleActivity.map((item) => renderActivityRow(item))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="clock" size={22} color={palette.primary} />
                <Text style={styles.emptyText}>Completed quiz attempts will appear here.</Text>
              </View>
            )}
            {visibleActivityCount < activity.length ? (
              <Text style={styles.historyMoreText}>Scroll to load more</Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    ) : null;

  const renderHome = () => (
    <View style={styles.page}>
      {renderAppHeader('Home')}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeContent}>
        <View style={styles.greetingRow}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.smallAvatarImage} />
          ) : (
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.greetingText}>
            <Text style={styles.hello}>Hello</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          {userSpaceLoading ? <ActivityIndicator color={palette.primary} /> : null}
        </View>

        {renderError(userSpaceError)}
        {renderError(questionSetsError)}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Question Sets</Text>
          <Pressable style={styles.seeMore} onPress={onOpenDiscover}>
            <Text style={styles.seeMoreText}>See more</Text>
            <Feather name="chevron-right" size={22} color={palette.black} />
          </Pressable>
        </View>

        {questionSetsLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.inlineLoadingText}>Loading question sets</Text>
          </View>
        ) : null}

        {featuredQuestionSets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.homeCourseRail}
          >
            {featuredQuestionSets.map((set, index) => renderCourseCard(set, index, 'horizontal'))}
          </ScrollView>
        ) : !questionSetsLoading ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={22} color={palette.primary} />
            <Text style={styles.emptyText}>No question sets are available yet.</Text>
          </View>
        ) : null}

        <View style={[styles.sectionHeader, styles.recentSectionHeader]}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <Pressable style={styles.seeMore} onPress={openActivityHistory}>
            <Text style={styles.seeMoreText}>See all</Text>
            <Feather name="chevron-right" size={22} color={palette.black} />
          </Pressable>
        </View>

        {recentDistinctQuestionSets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.homeCourseRail}
          >
            {recentDistinctQuestionSets.map((set, index) => renderCourseCard(set, index, 'horizontal'))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="clock" size={22} color={palette.primary} />
            <Text style={styles.emptyText}>Your two most recent distinct quizzes will appear here.</Text>
          </View>
        )}
      </ScrollView>
      {renderBottomNav()}
      {renderActivityHistoryModal()}
    </View>
  );

  const renderDiscover = () => (
    <QuestionSetsScreen
      activeTab={activeTab}
      questionSets={questionSets}
      questionSetTags={questionSetTags}
      questionSetsLoading={questionSetsLoading}
      questionSetsError={questionSetsError}
      bookmarkedQuestionSetIds={bookmarkedQuestionSetIds}
      bookmarkActionLoadingId={bookmarkActionLoadingId}
      questionSetActionLoadingId={questionSetActionLoadingId}
      onFiltersChange={onUpdateDiscoverFilters}
      onSelectTab={onSelectTab}
      onPlayQuestionSet={onStartQuestionSet}
      onToggleBookmark={onToggleQuestionSetBookmark}
    />
  );

  const renderQuestionDetail = () => (
    <QuestionSetDetailScreen
      activeTab={activeTab}
      error={questionSetActionError}
      loading={questionSetActionLoadingId === activeQuestionSet?.id}
      questionSet={activeQuestionSet}
      onBack={onBack}
      onSelectTab={onSelectTab}
      onTakeQuiz={onTakeQuestionSetQuiz}
    />
  );

  const renderMyQuizzes = () => (
    <View style={styles.page}>
      {renderAppHeader('Saved Question Sets')}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.savedContent}>
        {renderError(userSpaceError)}
        {userSpaceLoading ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.inlineLoadingText}>Refreshing saved sets</Text>
          </View>
        ) : null}
        {savedQuestionSets.length > 0 ? (
          <View style={styles.savedList}>
            {savedQuestionSets.map((set, index) => renderCourseCard(set, index + 1, 'full'))}
          </View>
        ) : !userSpaceLoading ? (
          <View style={styles.emptyState}>
            <Feather name="bookmark" size={22} color={palette.primary} />
            <Text style={styles.emptyText}>Saved question sets will appear here.</Text>
            <Pressable style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]} onPress={onOpenDiscover}>
              <Text style={styles.secondaryActionText}>Browse sets</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      {renderBottomNav()}
    </View>
  );

  const renderQuiz = () => (
    <QuestionSetQuizScreen
      question={currentQuestion}
      questionIndex={quizIndex}
      questionStartedAtMs={questionStartedAtMs}
      selectedChoice={selectedChoice}
      totalQuestions={quizQuestions.length}
      submitting={quizSubmissionLoading}
      submissionError={quizSubmissionError}
      onAdvance={onAdvanceQuiz}
      onBack={onBack}
      onSeeSummary={onSeeQuizSummary}
      onSelectChoice={onSelectChoice}
      questionDurationMs={currentQuestion ? questionDurations[currentQuestion.id] : undefined}
    />
  );

  const renderResult = () => (
    <QuestionSetSummaryScreen
      questionSet={activeQuestionSet}
      quizSessionResult={quizSessionResult}
      scoreSummary={scoreSummary}
      totalTimeMs={quizTotalTimeMs}
      onBack={onBack}
      onContinue={onContinueHome}
      onRetry={onRetryQuiz}
    />
  );

  const renderProfile = () => (
    <View style={styles.page}>
      {renderAppHeader('Profile')}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.profileContent}>
        <View style={styles.profileHero}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.profileAvatarImage} />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>
          {userSpaceLoading ? <ActivityIndicator color={palette.primary} style={styles.profileLoader} /> : null}
        </View>

        {renderError(profileError)}
        {renderError(userSpaceError)}

        <View style={styles.panel}>
          <View style={styles.panelHeaderRow}>
            <Text style={styles.panelTitle}>Account</Text>
            <Pressable style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]} onPress={onRefreshUserSpace}>
              <Feather name="refresh-cw" size={16} color={palette.navy} />
            </Pressable>
          </View>
          <Text style={styles.inputLabel}>Display name</Text>
          <TextInput
            style={styles.profileInput}
            value={displayNameDraft}
            onChangeText={setDisplayNameDraft}
            placeholder="Display name"
            placeholderTextColor={palette.muted}
          />
          <Text style={styles.inputLabel}>Avatar URL</Text>
          <TextInput
            style={styles.profileInput}
            value={avatarUrlDraft}
            onChangeText={setAvatarUrlDraft}
            placeholder="https://res.cloudinary.com/..."
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
          />
          <Pressable
            disabled={!profileChanged || profileSaving}
            style={({ pressed }) => [
              styles.primaryAction,
              (!profileChanged || profileSaving) && styles.disabled,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              onUpdateProfile({
                displayName: displayNameDraft.trim(),
                ...(avatarUrlDraft.trim() ? { avatarUrl: avatarUrlDraft.trim() } : {}),
              })
            }
          >
            {profileSaving ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryActionText}>Save profile</Text>}
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Settings</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.menuText}>Notifications</Text>
            <Switch
              value={notificationOverlay}
              onValueChange={onUpdateNotificationOverlay}
              trackColor={{ false: '#D8DEE5', true: '#97D8AF' }}
              thumbColor={notificationOverlay ? palette.primary : palette.white}
            />
          </View>
          {notificationOverlay ? (
            <View style={styles.timingSection}>
            <View style={styles.timingHeader}>
              <Text style={styles.timingHeaderTitle}>Lock-screen pop-ups</Text>
              <Text style={styles.timingHeaderText}>
                Lockscreen questions may appear during these time windows.
              </Text>
              <Text style={styles.timingHeaderText}>
                The app checks every {POPUP_CHECK_INTERVAL_MINUTES} minutes during active intervals.
              </Text>
            </View>
            <View style={styles.timingPreviewRow}>
              {serializedLockScreenIntervals.length > 0 ? (
                serializedLockScreenIntervals.map((interval) => (
                  <View key={`${interval.startTime}-${interval.endTime}`} style={styles.timingPreviewPill}>
                    <Text style={styles.timingPreviewText}>{formatIntervalLabel(interval)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.mutedText}>No lockscreen question windows are active.</Text>
              )}
            </View>
            <View style={styles.intervalList}>
              {lockScreenIntervalDrafts.map((interval, index) => {
                const intervalErrors = lockScreenIntervalValidation.errorsById[interval.id] ?? [];

                return (
                  <View key={interval.id} style={styles.intervalRow}>
                    <View style={styles.intervalRowHeader}>
                      <Text style={styles.inputLabel}>Window {index + 1}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove window ${index + 1}`}
                        style={({ pressed }) => [styles.intervalIconButton, pressed && styles.pressed]}
                        onPress={() => removeLockScreenInterval(interval.id)}
                      >
                        <Feather name="trash-2" size={16} color={palette.danger} />
                      </Pressable>
                    </View>
                    <View style={styles.intervalInputsRow}>
                      <View style={styles.intervalField}>
                        <Text style={styles.intervalFieldLabel}>Start</Text>
                        <TextInput
                          style={[
                            styles.timingInput,
                            intervalErrors.length > 0 && styles.timingInputInvalid,
                          ]}
                          value={interval.startTime}
                          onChangeText={(value) => updateLockScreenInterval(interval.id, 'startTime', value)}
                          placeholder="08:00"
                          placeholderTextColor={palette.muted}
                          keyboardType="numbers-and-punctuation"
                          maxLength={5}
                        />
                      </View>
                      <View style={styles.intervalField}>
                        <Text style={styles.intervalFieldLabel}>End</Text>
                        <TextInput
                          style={[
                            styles.timingInput,
                            intervalErrors.length > 0 && styles.timingInputInvalid,
                          ]}
                          value={interval.endTime}
                          onChangeText={(value) => updateLockScreenInterval(interval.id, 'endTime', value)}
                          placeholder="12:00"
                          placeholderTextColor={palette.muted}
                          keyboardType="numbers-and-punctuation"
                          maxLength={5}
                        />
                      </View>
                    </View>
                    {intervalErrors.map((error) => (
                      <Text key={error} style={styles.validationText}>
                        {error}
                      </Text>
                    ))}
                  </View>
                );
              })}
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.addIntervalButton, pressed && styles.pressed]}
                onPress={addLockScreenInterval}
              >
                <Feather name="plus" size={17} color={palette.navy} />
                <Text style={styles.addIntervalText}>Add time window</Text>
              </Pressable>
            </View>
            <Text style={styles.mutedText}>Current: {lockScreenTimingSummary}</Text>
            <Pressable
              disabled={!canSaveLockScreenTiming}
              style={({ pressed }) => [
                styles.secondaryAction,
                !canSaveLockScreenTiming && styles.disabled,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                onUpdateLockScreenTiming(buildLockScreenTimingPreference(lockScreenIntervalDrafts))
              }
            >
              <Text style={styles.secondaryActionText}>Save time windows</Text>
            </Pressable>
          </View>
          ) : null}
        </View>

        <View style={styles.panel}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open full activity history"
            style={({ pressed }) => [styles.panelHeaderRow, pressed && styles.pressed]}
            onPress={openActivityHistory}
          >
            <Text style={styles.panelTitle}>Activity History</Text>
            {activity.length > 2 ? (
              <View style={styles.textAction}>
                <Text style={styles.textActionLabel}>See All</Text>
              </View>
            ) : null}
          </Pressable>
          {activity.length > 0 ? (
            activity.slice(0, 2).map((item) => renderActivityRow(item, false, openActivityHistory))
          ) : (
            <Text style={styles.mutedText}>Completed quiz attempts will appear here.</Text>
          )}
        </View>

      </ScrollView>
      {renderBottomNav()}
      {renderActivityHistoryModal()}
    </View>
  );

  const renderRootScene = (
    rootScreen: MainFlowProps['screen'],
    content: ReactNode,
  ) => (
    <View
      key={rootScreen}
      pointerEvents={screen === rootScreen ? 'auto' : 'none'}
      style={[styles.tabScene, screen !== rootScreen && styles.tabSceneHidden]}
    >
      {content}
    </View>
  );

  const renderStackScreen = () => {
    if (screen === 'result') {
      return renderResult();
    }

    if (screen === 'question-detail') {
      return renderQuestionDetail();
    }

    if (screen === 'quiz') {
      return renderQuiz();
    }

    return null;
  };

  return (
    <View style={styles.navigatorRoot}>
      {renderRootScene('home', renderHome())}
      {renderRootScene('discover', renderDiscover())}
      {renderRootScene('my-quizzes', renderMyQuizzes())}
      {renderRootScene('profile', renderProfile())}
      {renderStackScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  navigatorRoot: {
    flex: 1,
    backgroundColor: palette.page,
  },
  tabScene: {
    flex: 1,
  },
  tabSceneHidden: {
    display: 'none',
  },
  page: {
    flex: 1,
    backgroundColor: palette.page,
  },
  headerSafeArea: {
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    minHeight: 118,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 18 : 0,
    paddingBottom: 18,
  },
  headerTitle: {
    color: palette.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: 0,
  },
  homeContent: {
    paddingHorizontal: 19,
    paddingTop: 34,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  greetingRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 34,
  },
  smallAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.lime,
  },
  smallAvatarText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
  greetingText: {
    flex: 1,
  },
  hello: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  name: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  recentSectionHeader: {
    marginTop: 28,
  },
  sectionTitle: {
    color: palette.black,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
  },
  seeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
  },
  seeMoreText: {
    color: palette.black,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  homeCourseRail: {
    gap: 12,
    paddingRight: 28,
  },
  homeCourseCard: {
    width: 301,
    minHeight: 210,
    borderRadius: 24,
    padding: 14,
    overflow: 'hidden',
  },
  quizCourseCard: {
    width: '100%',
    minHeight: 168,
    borderRadius: 24,
    padding: 14,
    overflow: 'hidden',
  },
  courseTitle: {
    color: palette.black,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  courseAuthor: {
    color: palette.black,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 2,
  },
  courseSummary: {
    color: palette.black,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 18,
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseMetaText: {
    color: palette.black,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  statusPill: {
    alignSelf: 'flex-start',
    height: 28,
    borderRadius: 360,
    backgroundColor: palette.black,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  statusText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  savedContent: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  savedList: {
    gap: 12,
  },
  profileContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  profileAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  profileAvatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: palette.lime,
    marginBottom: 11,
  },
  profileAvatarText: {
    color: palette.navy,
    fontSize: 24,
    fontWeight: '700',
  },
  profileName: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileEmail: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  profileLoader: {
    marginTop: 10,
  },
  panel: {
    borderWidth: 1.5,
    borderColor: palette.navy,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    backgroundColor: palette.white,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    color: palette.navy,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.lime,
  },
  inputLabel: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  profileInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: palette.navy,
    borderRadius: 23,
    paddingHorizontal: 16,
    color: palette.navy,
    marginBottom: 12,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryActionText: {
    color: palette.white,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  secondaryAction: {
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: palette.navy,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryActionText: {
    color: palette.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  textAction: {
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.lime,
  },
  textActionLabel: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  toggleRow: {
    minHeight: 54,
    borderRadius: 360,
    borderWidth: 1.5,
    borderColor: palette.navy,
    paddingLeft: 20,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 0,
  },
  timingSection: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE7DA',
    backgroundColor: '#F8FAF8',
    padding: 14,
  },
  timingHeader: {
    gap: 4,
    marginBottom: 12,
  },
  timingHeaderTitle: {
    color: palette.navy,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  timingHeaderText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  timingInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: palette.navy,
    borderRadius: 23,
    paddingHorizontal: 14,
    color: palette.navy,
    backgroundColor: '#FAFBFC',
  },
  timingInputInvalid: {
    borderColor: palette.danger,
    backgroundColor: '#FFF7F6',
  },
  intervalList: {
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  intervalRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#D9E5DA',
    paddingBottom: 10,
    gap: 8,
  },
  intervalRowHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  intervalIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7F6',
  },
  intervalInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  intervalField: {
    flex: 1,
    gap: 5,
  },
  intervalFieldLabel: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  validationText: {
    color: palette.danger,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  addIntervalButton: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: palette.white,
  },
  addIntervalText: {
    color: palette.navy,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  timingPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  timingPreviewPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: '#D9E5DA',
  },
  timingPreviewText: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  scheduleReveal: {
    marginTop: 12,
  },
  scheduleDisclosure: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.navy,
    backgroundColor: palette.lime,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  scheduleDisclosureCopy: {
    flex: 1,
  },
  scheduleDisclosureTitle: {
    color: palette.navy,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  scheduleDetails: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  menuText: {
    flexShrink: 1,
    color: palette.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  listText: {
    color: palette.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    marginBottom: 6,
  },
  mutedText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingBottom: 10,
    marginBottom: 10,
  },
  activityRowCompact: {
    borderBottomColor: palette.line,
    marginBottom: 8,
  },
  activityCopy: {
    flex: 1,
  },
  activityScore: {
    color: palette.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  scheduleRow: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingBottom: 10,
    marginBottom: 10,
  },
  historyModalRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 30,
    elevation: 30,
  },
  historyModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,18,69,0.34)',
  },
  historySheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: palette.white,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  historySheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  historySheetTitle: {
    color: palette.navy,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
  },
  historyList: {
    paddingBottom: 28,
  },
  historyMoreText: {
    color: palette.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  emptyState: {
    minHeight: 132,
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    textAlign: 'center',
  },
  inlineLoading: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineLoadingText: {
    color: palette.muted,
    fontSize: 13,
  },
  errorText: {
    color: palette.danger,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.62,
  },
  pressed: {
    opacity: 0.72,
  },
});
