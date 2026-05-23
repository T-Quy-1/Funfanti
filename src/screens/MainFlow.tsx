import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { BottomNav, BOTTOM_NAV_CONTENT_PADDING } from "../components";
import { Feather } from '@expo/vector-icons';
import { colors } from "../theme/colors";
import { spacing, borderRadius, shadows, gradients } from "../theme/spacing";
import type { AppTab } from "./screenTypes";
import { QuestionSetsScreen } from './QuestionSetsScreen';
import {
  QuestionSetDetailScreen,
  QuestionSetQuizScreen,
  QuestionSetSummaryScreen,
} from './QuestionSetPlayFlow';
import type { QuestionSetCard, QuestionSetFilters, QuizQuestion } from "../data/funfantiContent";
import type { QuizSessionResult } from "../services/funfantiApi";

type MainFlowProps = {
  screen: "home" | "my-quizzes" | "discover" | "question-detail" | "quiz" | "result" | "profile";
  registerName: string;
  registerEmail: string;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenDiscover: () => void;
  onStartQuiz: () => void;
  onBackToHome: () => void;
  activeQuestionSet: QuestionSetCard | null;
  questionSets: QuestionSetCard[];
  questionSetTags: string[];
  questionSetsLoading: boolean;
  questionSetsError: string | null;
  questionSetSearchQuery: string;
  questionSetFilters: QuestionSetFilters;
  bookmarkedQuestionSetIds: string[];
  questionSetActionLoadingId: string | null;
  quizQuestions: QuizQuestion[];
  filterChips: string[];
  stats: ReadonlyArray<{ label: string; value: string }>;
  quizIndex: number;
  selectedChoice: string | null;
  scoreSummary: { answered: number; correct: number; total: number; accuracy: number };
  currentQuestion: QuizQuestion | null;
  questionStartedAtMs: number;
  questionDurations: Record<string, number>;
  quizTotalTimeMs: number;
  quizSessionResult: QuizSessionResult | null;
  quizSubmissionLoading: boolean;
  selectedInterest: string;
  themeEnabled: boolean;
  hapticsEnabled: boolean;
  notificationOverlay: boolean;
  onSelectChoice: (choiceId: string) => void;
  onAdvanceQuiz: () => void;
  onSeeQuizSummary: () => void;
  onTakeQuestionSetQuiz: () => void;
  onChangeQuestionSetSearch: (value: string) => void;
  onApplyQuestionSetFilters: (filters: QuestionSetFilters) => void;
  onStartQuestionSet: (questionSet: QuestionSetCard) => void;
  onToggleQuestionSetBookmark: (questionSet: QuestionSetCard) => void;
  onRetryQuiz: () => void;
  onContinueHome: () => void;
  onUpdateTheme: (value: boolean) => void;
  onUpdateHaptics: (value: boolean) => void;
  onUpdateNotificationOverlay: (value: boolean) => void;
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
  softGreen: 'rgba(56,222,144,0.5)',
  page: '#FFFFFF',
  muted: '#5F6672',
  line: '#E8EDF0',
};

const courseCardColors = [palette.peach, palette.mint, palette.lime, palette.aqua, palette.coral];
const quizDates = [
  { month: 'May', day: '23', weekDay: 'Fri' },
  { month: 'May', day: '24', weekDay: 'Sat' },
  { month: 'May', day: '25', weekDay: 'Sun', active: true },
  { month: 'May', day: '26', weekDay: 'Mon' },
  { month: 'May', day: '27', weekDay: 'Tue' },
];

export function MainFlow(props: MainFlowProps) {
  const {
    screen,
    registerName,
    registerEmail,
    activeTab,
    onSelectTab,
    onOpenDiscover,
    onStartQuiz,
    onBackToHome,
    activeQuestionSet,
    questionSets,
    questionSetTags,
    questionSetsLoading,
    questionSetsError,
    questionSetSearchQuery,
    questionSetFilters,
    bookmarkedQuestionSetIds,
    questionSetActionLoadingId,
    quizQuestions,
    filterChips,
    stats,
    quizIndex,
    selectedChoice,
    scoreSummary,
    currentQuestion,
    questionStartedAtMs,
    questionDurations,
    quizTotalTimeMs,
    quizSessionResult,
    quizSubmissionLoading,
    selectedInterest,
    themeEnabled,
    hapticsEnabled,
    notificationOverlay,
    onSelectChoice,
    onAdvanceQuiz,
    onSeeQuizSummary,
    onTakeQuestionSetQuiz,
    onChangeQuestionSetSearch,
    onApplyQuestionSetFilters,
    onStartQuestionSet,
    onToggleQuestionSetBookmark,
    onRetryQuiz,
    onContinueHome,
    onUpdateTheme,
    onUpdateHaptics,
    onUpdateNotificationOverlay,
  } = props;

  const displayName = registerName.trim() || 'Funfanti Learner';
  const displayEmail = registerEmail.trim() || 'learner@funfanti.app';
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const truncateText = (value: string, maxLength = 30) =>
    value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

  const recommendedQuestionSets = questionSets.filter((set) =>
    set.title.toLowerCase().includes('starter sea') || set.title.toLowerCase().includes('napoleon')
  );
  const myQuizSets = questionSets.filter((set) => bookmarkedQuestionSetIds.includes(set.id));

  const renderBottomNav = () => <BottomNav activeTab={activeTab} onSelect={onSelectTab} />;

  const renderAppHeader = (title: string) => (
    <SafeAreaView style={styles.figmaHeaderSafeArea}>
      <View style={styles.figmaHeader}>
        <Text style={styles.figmaHeaderTitle}>{title}</Text>
      </View>
    </SafeAreaView>
  );

  const renderCourseCard = (
    questionSet: QuestionSetCard,
    index: number,
    variant: 'horizontal' | 'full',
  ) => {
    const cardColor = courseCardColors[index % courseCardColors.length];
    const status = questionSet.progress >= 1 ? 'Completed' : 'Incomplete';
    const widthStyle = variant === 'horizontal' ? styles.homeCourseCard : styles.quizCourseCard;

    return (
      <Pressable
        key={questionSet.id}
        style={[widthStyle, { backgroundColor: cardColor }]}
        onPress={() => onStartQuestionSet(questionSet)}
      >
        <Text style={styles.figmaCourseTitle}>{truncateText(questionSet.title, 28)}</Text>
        <Text style={styles.figmaCourseAuthor}>
          {truncateText(questionSet.creatorName ?? questionSet.topic, 30)}
        </Text>
        <View style={styles.figmaQuestionMeta}>
          <Feather name="book-open" size={15} color={palette.black} />
          <Text style={styles.figmaQuestionCount}>
            {questionSet.questionCount} {questionSet.questionCount === 1 ? 'Question' : 'Questions'}
          </Text>
        </View>
        <View style={styles.figmaStatusPill}>
          <Text style={[styles.figmaStatusText, { color: cardColor }]}>{status}</Text>
        </View>
      </Pressable>
    );
  };

  const renderHome = () => (
    <View style={styles.figmaPage}>
      {renderAppHeader('Home')}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.figmaHomeContent}
      >
        <View style={styles.figmaGreetingRow}>
          <View style={styles.figmaSmallAvatar}>
            <Text style={styles.figmaSmallAvatarText}>{initials}</Text>
          </View>
          <View style={styles.figmaGreetingText}>
            <Text style={styles.figmaHello}>Hello!</Text>
            <Text style={styles.figmaName}>{displayName}</Text>
          </View>
          <Feather name="bell" size={24} color={palette.black} />
        </View>

        <View style={styles.figmaSectionHeader}>
          <Text style={styles.figmaSectionTitle}>Recent Courses</Text>
        </View>
        <View style={styles.emptyRecentRail}>
          <View style={styles.emptyRecentState}>
            <Feather name="book-open" size={22} color={palette.primary} />
            <Text style={styles.emptyRecentText}>No recent courses available</Text>
          </View>
        </View>

        <View style={styles.figmaSectionHeader}>
          <Text style={styles.figmaSectionTitle}>Recommended Courses</Text>
          <Pressable style={styles.figmaSeeMore} onPress={onOpenDiscover}>
            <Text style={styles.figmaSeeMoreText}>See more</Text>
            <Feather name="chevron-right" size={22} color={palette.black} />
          </Pressable>
        </View>

        {recommendedQuestionSets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.homeCourseRail}
          >
            {recommendedQuestionSets.map((set, index) => renderCourseCard(set, index, 'horizontal'))}
          </ScrollView>
        ) : (
          <View style={styles.emptyRecentRail}>
            <View style={styles.emptyRecentState}>
              <Text style={styles.emptyRecentText}>No recommended courses available</Text>
            </View>
          </View>
        )}
      </ScrollView>
      {renderBottomNav()}
    </View>
  );

  const renderDiscover = () => (
    <QuestionSetsScreen
      activeTab={activeTab}
      questionSets={questionSets}
      questionSetTags={questionSetTags}
      questionSetsLoading={questionSetsLoading}
      questionSetsError={questionSetsError}
      searchQuery={questionSetSearchQuery}
      filters={questionSetFilters}
      bookmarkedQuestionSetIds={bookmarkedQuestionSetIds}
      questionSetActionLoadingId={questionSetActionLoadingId}
      onSelectTab={onSelectTab}
      onChangeSearchQuery={onChangeQuestionSetSearch}
      onApplyFilters={onApplyQuestionSetFilters}
      onPlayQuestionSet={onStartQuestionSet}
      onToggleBookmark={onToggleQuestionSetBookmark}
    />
  );

  const renderQuestionDetail = () => (
    <QuestionSetDetailScreen
      activeTab={activeTab}
      loading={questionSetActionLoadingId === activeQuestionSet?.id}
      questionSet={activeQuestionSet}
      onBack={() => onSelectTab('quiz')}
      onSelectTab={onSelectTab}
      onTakeQuiz={onTakeQuestionSetQuiz}
    />
  );

  const renderMyQuizzes = () => (
    <View style={styles.figmaPage}>
      {renderAppHeader('My Quizzes')}
      <View style={styles.pinnedDateStrip}>
        {quizDates.map((date) => (
          <View
            key={`${date.month}-${date.day}`}
            style={[styles.dateCard, date.active && styles.dateCardActive]}
          >
            <Text style={[styles.dateMonth, date.active && styles.dateTextActive]}>{date.month}</Text>
            <Text style={[styles.dateDay, date.active && styles.dateTextActive]}>{date.day}</Text>
            <Text style={[styles.dateWeekDay, date.active && styles.dateTextActive]}>
              {date.weekDay}
            </Text>
          </View>
        ))}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.myQuizzesContent}
      >
        <View style={styles.myQuizList}>
          {myQuizSets.length > 0 ? (
            myQuizSets.map((set, index) => renderCourseCard(set, index + 1, 'full'))
          ) : (
            <View style={styles.emptyRecentState}>
              <Text style={styles.emptyRecentText}>No quizzes available</Text>
            </View>
          )}
        </View>
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
      onAdvance={onAdvanceQuiz}
      onBack={() => onSelectTab('quiz')}
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
      onContinue={onContinueHome}
      onRetry={onRetryQuiz}
    />
  );

  const renderProfile = () => (
    <View style={styles.figmaPage}>
      {renderAppHeader('Profile')}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.profileContent}
      >
        <View style={styles.profileHeroCompact}>
          <View style={styles.figmaProfileAvatar}>
            <Feather name="user" size={36} color={palette.black} />
          </View>
          <Text style={styles.figmaProfileName}>{displayName}</Text>
          <Text style={styles.figmaProfileEmail}>{displayEmail}</Text>
        </View>

        <View style={styles.figmaMenuSection}>
          <Text style={styles.figmaMenuHeading}>My profile</Text>
          <View style={styles.figmaMenuStack}>
            <View style={styles.figmaMenuRow}>
              <Text style={styles.figmaMenuText}>Edit profile</Text>
              <Feather name="chevron-right" size={24} color={palette.navy} />
            </View>
            <View style={styles.figmaMenuRow}>
              <Text style={styles.figmaMenuText}>Avatar upload</Text>
              <Feather name="chevron-right" size={24} color={palette.navy} />
            </View>
            <View style={styles.figmaMenuRow}>
              <Text style={styles.figmaMenuText}>Bookmarks</Text>
              <Feather name="chevron-right" size={24} color={palette.navy} />
            </View>
            <View style={styles.figmaMenuRow}>
              <Text style={styles.figmaMenuText}>Activity history</Text>
              <Feather name="chevron-right" size={24} color={palette.navy} />
            </View>
          </View>
        </View>

        <View style={styles.figmaMenuSection}>
          <Text style={styles.figmaMenuHeading}>Settings</Text>
          <View style={styles.figmaMenuStack}>
            <View style={styles.figmaToggleRow}>
              <Text style={styles.figmaMenuText}>Notification/Overlay</Text>
              <Switch
                value={notificationOverlay}
                onValueChange={onUpdateNotificationOverlay}
                trackColor={{ false: '#D8DEE5', true: '#97D8AF' }}
                thumbColor={notificationOverlay ? palette.primary : palette.white}
              />
            </View>
            <View style={styles.figmaToggleRow}>
              <Text style={styles.figmaMenuText}>Haptics & Sound</Text>
              <Switch
                value={hapticsEnabled}
                onValueChange={onUpdateHaptics}
                trackColor={{ false: '#D8DEE5', true: '#97D8AF' }}
                thumbColor={hapticsEnabled ? palette.primary : palette.white}
              />
            </View>
            <View style={styles.figmaToggleRow}>
              <Text style={styles.figmaMenuText}>Theme</Text>
              <Switch
                value={themeEnabled}
                onValueChange={onUpdateTheme}
                trackColor={{ false: '#D8DEE5', true: '#97D8AF' }}
                thumbColor={themeEnabled ? palette.primary : palette.white}
              />
            </View>
            <View style={styles.figmaMenuRow}>
              <Text style={styles.figmaMenuText}>Notification schedules</Text>
              <Feather name="chevron-right" size={24} color={palette.navy} />
            </View>
          </View>
        </View>
      </ScrollView>
      {renderBottomNav()}
    </View>
  );

  if (screen === "result") {
    return renderResult();
  }

  if (screen === "question-detail") {
    return renderQuestionDetail();
  }

  if (screen === "quiz") {
    return renderQuiz();
  }

  if (screen === "my-quizzes") {
    return renderMyQuizzes();
  }

  switch (activeTab) {
    case "home":
      return renderHome();
    case "discover":
      return renderDiscover();
    case "quiz":
      return renderMyQuizzes();
    case "profile":
      return renderProfile();
    default:
      return renderHome();
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  figmaPage: {
    flex: 1,
    backgroundColor: palette.page,
  },
  figmaHeaderSafeArea: {
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  figmaHeader: {
    minHeight: 118,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 18 : 0,
    paddingBottom: 18,
  },
  figmaHeaderTitle: {
    color: palette.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: 0,
  },
  figmaHomeContent: {
    paddingHorizontal: 19,
    paddingTop: 42,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  figmaGreetingRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 42,
  },
  figmaSmallAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  figmaSmallAvatarText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
  figmaGreetingText: {
    flex: 1,
  },
  figmaHello: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  figmaName: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 2,
  },
  figmaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  figmaSectionTitle: {
    color: palette.black,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
  },
  figmaSeeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
  },
  figmaSeeMoreText: {
    color: palette.black,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  emptyRecentState: {
    minHeight: 104,
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
  emptyRecentRail: {
    width: '100%',
    marginBottom: 38,
  },
  emptyRecentText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    textAlign: 'center',
  },
  homeCourseRail: {
    gap: 12,
    paddingRight: 28,
  },
  homeCourseCard: {
    width: 301,
    minHeight: 185,
    borderRadius: 24,
    padding: 12,
    overflow: 'hidden',
  },
  quizCourseCard: {
    width: '100%',
    minHeight: 143,
    borderRadius: 24,
    padding: 12,
    overflow: 'hidden',
  },
  figmaCourseTitle: {
    color: palette.black,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  figmaCourseAuthor: {
    color: palette.black,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  figmaQuestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 24,
  },
  figmaQuestionCount: {
    color: palette.black,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  figmaStatusPill: {
    alignSelf: 'flex-start',
    height: 28,
    borderRadius: 360,
    backgroundColor: palette.black,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  figmaStatusText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  myQuizzesContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  pinnedDateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 18,
    backgroundColor: palette.white,
  },
  dateCard: {
    width: 64,
    height: 84,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: palette.white,
  },
  dateCardActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  dateMonth: {
    color: palette.ink,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  dateDay: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
  },
  dateWeekDay: {
    color: palette.ink,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  dateTextActive: {
    color: palette.white,
  },
  myQuizList: {
    gap: 12,
  },
  profileContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  profileHeroCompact: {
    alignItems: 'center',
    marginBottom: 25,
  },
  figmaProfileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  figmaProfileName: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  figmaProfileEmail: {
    color: palette.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  figmaMenuSection: {
    marginBottom: 26,
  },
  figmaMenuHeading: {
    color: palette.navy,
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
    marginBottom: 20,
  },
  figmaMenuStack: {
    gap: 12,
  },
  figmaMenuRow: {
    minHeight: 54,
    borderRadius: 360,
    borderWidth: 1.5,
    borderColor: palette.navy,
    paddingLeft: 20,
    paddingRight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  figmaToggleRow: {
    minHeight: 54,
    borderRadius: 360,
    borderWidth: 1.5,
    borderColor: palette.navy,
    paddingLeft: 20,
    paddingRight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  figmaMenuText: {
    flexShrink: 1,
    color: palette.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  appContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  bannerCopy: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  bannerEyebrow: {
    color: '#9CA3AF',
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  bannerTitle: {
    color: '#111827',
    fontSize: 24,
    lineHeight: 36,
    fontWeight: "600",
  },
  bannerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: spacing.md,
    lineHeight: 21,
  },
  bannerArtWrap: {
    padding: spacing.md,
  },
  profileMiniRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  subtleLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    fontWeight: "500",
    lineHeight: 18,
  },
  bigValue: {
    fontSize: 24,
    fontWeight: "600",
    color: '#111827',
    lineHeight: 36,
  },
  avatarBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0,
    elevation: 0,
  },
  avatarBubbleText: {
    color: colors.surface,
    fontWeight: "600",
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
  },
  statLabel: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
  },
  featuredCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  featuredContent: {
    padding: spacing.lg,
  },
  featuredTag: {
    color: '#9CA3AF',
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
  },
  featuredTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  featuredText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  listSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  listSectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: "700",
  },
  listSectionAction: {
    color: '#9CA3AF',
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
  },
  courseCard: {
    flexDirection: "row",
    borderRadius: 24,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  courseBody: {
    flex: 1,
    justifyContent: "center",
    marginLeft: spacing.md,
  },
  courseTopic: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: "400",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  courseTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
    lineHeight: 27,
  },
  courseSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,33,71,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    shadowOpacity: 0,
    elevation: 0,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    lineHeight: 21,
  },
  filterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brandGreen,
  },
  chipRow: {
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  filterChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
  discoveryCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  discoveryBody: {
    flex: 1,
    padding: spacing.md,
  },
  discoveryTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
    lineHeight: 27,
  },
  discoveryMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    fontWeight: "400",
    lineHeight: 18,
  },
  discoveryText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  discoveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discoveryProgress: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
  discoveryAction: {
    color: '#9CA3AF',
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
  },
  quizContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  quizTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingRight: 10,
  },
  backLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  quizMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  quizCounter: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  quizCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  quizQuestion: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "700",
    color: '#111827',
    marginBottom: spacing.lg,
  },
  choiceStack: {
    gap: spacing.md,
  },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  choiceCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: 'transparent',
  },
  choiceWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: 'transparent',
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    color: colors.surface,
    textAlign: "center",
    lineHeight: 32,
    fontWeight: "600",
    marginRight: spacing.md,
    overflow: "hidden",
  },
  choiceText: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "400",
  },
  quizHint: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 0,
  },
  quizHintTitle: {
    color: '#111827',
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  quizHintText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
  },
  resultContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: '#111827',
  },
  resultTopic: {
    marginTop: spacing.sm,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
  resultRing: {
    alignSelf: "center",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.surface,
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    shadowOpacity: 0,
    elevation: 0,
  },
  resultPercent: {
    fontSize: 48,
    fontWeight: "700",
    color: '#111827',
  },
  resultLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: spacing.sm,
    fontWeight: "400",
    lineHeight: 18,
  },
  resultGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  resultMetricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  resultMetricValue: {
    color: '#111827',
    fontWeight: "700",
    fontSize: 20,
  },
  resultMetricLabel: {
    color: '#9CA3AF',
    marginTop: spacing.md,
    lineHeight: 18,
    fontSize: 12,
    fontWeight: "400",
  },
  feedbackCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 0,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: '#111827',
    marginBottom: spacing.sm,
  },
  feedbackText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  resultActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 24,
    paddingVertical: spacing.lg,
    alignItems: "center",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: spacing.lg,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.brand,
    fontWeight: "600",
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 0,
    marginBottom: spacing.lg,
    shadowOpacity: 0,
    elevation: 0,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
    shadowOpacity: 0,
    elevation: 0,
  },
  profileAvatarText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "600",
  },
  profileHeroText: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: '#111827',
  },
  profileEmail: {
    color: '#9CA3AF',
    marginTop: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 0,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowOpacity: 0,
    elevation: 0,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 0,
  },
  settingTitle: {
    color: '#111827',
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 21,
  },
  settingSubtitle: {
    color: '#9CA3AF',
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: '#111827',
  },
  profileStatLabel: {
    color: '#9CA3AF',
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },
});
