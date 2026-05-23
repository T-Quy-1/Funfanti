import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { ArtBlock, BottomNav, ScreenHeader, LogoBrand, EnhancedCard, StatCard } from "../components";
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
const strictScrollProps = {
  alwaysBounceVertical: false,
  bounces: false,
  overScrollMode: 'never' as const,
};
const strictHorizontalScrollProps = {
  alwaysBounceHorizontal: false,
  bounces: false,
  overScrollMode: 'never' as const,
};

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

  const recommendedQuestionSets = questionSets.slice(0, 6);
  const myQuizSets = questionSets.slice(0, 4);

  const renderBottomNav = () => <BottomNav activeTab={activeTab} onSelect={onSelectTab} />;

  const renderHome = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.appContent}>
        <ScreenHeader title="Home" subtitle={`Good evening, ${registerName.split(" ")[0]}.`} />
        <LinearGradient
          colors={['#EEF2FF', '#ECFEFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerEyebrow}>Daily learning</Text>
            <Text style={styles.bannerTitle}>Short sessions, better retention.</Text>
            <Text style={styles.bannerText}>
              A clean quiz loop that feels light, visual, and fast to finish.
            </Text>
          </View>
          <View style={styles.bannerArtWrap}>
            <ArtBlock tone={colors.brandGreenSoft} variant="hero" />
          </View>
        </LinearGradient>

        <View style={styles.profileMiniRow}>
          <View>
            <Text style={styles.subtleLabel}>Active streak</Text>
            <Text style={styles.bigValue}>12 days</Text>
          </View>
          <View style={styles.avatarBubble}>
            <Text style={styles.avatarBubbleText}>JD</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Questions today"
            value={stats[0]?.value || '18'}
            iconName="help-circle"
            toneIndex={0}
            accentColor={colors.brand}
            textColor="#111827"
          />
          <StatCard
            title="Streak"
            value={stats[1]?.value || '12'}
            unit="days"
            iconName="zap"
            toneIndex={1}
            accentColor={colors.brand}
            textColor="#111827"
            trend="up"
            trendValue="+3 this week"
          />
          <StatCard
            title="Saved sets"
            value={stats[2]?.value || '24'}
            iconName="bookmark"
            toneIndex={2}
            accentColor={colors.brand}
            textColor="#111827"
          />
        </View>

        <View style={styles.listSectionHeader}>
          <Text style={styles.listSectionTitle}>Featured quiz</Text>
          <Pressable onPress={onOpenDiscover}>
            <Text style={styles.listSectionAction}>See all</Text>
          </Pressable>
        </View>

        <EnhancedCard
          isFeatured
          gradientColors={['#6366F1', '#3B82F6']}
          onPress={onStartQuiz}
          style={styles.featuredCard}
          size="lg"
        >
          <ArtBlock tone={colors.brand} variant="hero" imageUrl={questionSets[0].imageUrl} showLogo={false} />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTag}>Starter Quiz</Text>
            <Text style={styles.featuredTitle}>{truncateText(questionSets[0].title, 30)}</Text>
            <Text style={styles.featuredText}>{truncateText(questionSets[0].subtitle, 54)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${questionSets[0].progress * 100}%` as `${number}%` }]} />
            </View>
          </View>
        </EnhancedCard>

        <View style={styles.listSectionHeader}>
          <Text style={styles.listSectionTitle}>Recommended courses</Text>
          <Pressable onPress={onOpenDiscover}>
            <Text style={styles.listSectionAction}>Explore</Text>
          </Pressable>
        </View>

        {questionSets.map((set, index) => {
          // Cycle through accent colors for visual variety
          const accentColors = [
            colors.tealSoft,
            colors.orangeSoft,
            colors.purpleSoft,
            colors.blueSoft,
          ];
          const accentTextColors = [
            colors.tealDark,
            colors.orangeDark,
            colors.purpleDark,
            colors.blueDark,
          ];
          const accentAccent = [
            colors.teal,
            colors.orange,
            colors.purple,
            colors.blue,
          ];
          const bgColor = accentColors[index % accentColors.length];
          const textColor = accentTextColors[index % accentTextColors.length];
          const accentColor = accentAccent[index % accentAccent.length];

          return (
            <Pressable
              key={set.id}
              style={[styles.courseCard, { backgroundColor: bgColor }]}
              onPress={onStartQuiz}
            >
              <ArtBlock tone={set.artTone} variant="card" imageUrl={set.imageUrl} />
              <View style={styles.courseBody}>
                <Text style={[styles.courseTopic, { color: textColor }]}>{truncateText(set.topic, 24)}</Text>
                <Text style={styles.courseTitle}>{truncateText(set.title, 30)}</Text>
                <Text style={styles.courseSubtitle}>{truncateText(set.subtitle, 54)}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { backgroundColor: accentColor, width: `${set.progress * 100}%` as `${number}%` }]} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderDiscover = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.appContent}>
        <ScreenHeader
          title="Question Sets"
          subtitle={`Search and filter bite-sized quizzes around ${selectedInterest.toLowerCase()}.`}
        />
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topic"
            placeholderTextColor="#7d7d7d"
          />
          <View style={styles.filterDot} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {filterChips.map((chip) => (
            <Pressable key={chip} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {questionSets.map((set) => (
          <Pressable key={set.id} style={styles.discoveryCard} onPress={onStartQuiz}>
            <ArtBlock tone={set.artTone} variant="card" imageUrl={set.imageUrl} />
            <View style={styles.discoveryBody}>
              <Text style={styles.discoveryTitle}>{truncateText(set.title, 30)}</Text>
              <Text style={styles.discoveryMeta}>{truncateText(set.topic, 24)}</Text>
              <Text style={styles.discoveryText}>{truncateText(set.subtitle, 54)}</Text>
              <View style={styles.discoveryFooter}>
                <Text style={styles.discoveryProgress}>
                  {Math.round(set.progress * 100)}% complete
                </Text>
                <Text style={styles.discoveryAction}>Start</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderQuestionDetail = () => {
    if (!activeQuestionSet) {
      return null;
    }

    return (
      <QuestionSetDetailScreen
        activeTab={activeTab}
        loading={questionSetActionLoadingId === activeQuestionSet.id}
        questionSet={activeQuestionSet}
        onBack={onBackToHome}
        onSelectTab={onSelectTab}
        onTakeQuiz={onTakeQuestionSetQuiz}
      />
    );
  };

  const renderMyQuizzes = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.appContent}>
        <ScreenHeader title="My Quizzes" subtitle="Continue from where you left off." />

        <View style={styles.statsRow}>
          <StatCard
            title="Saved sets"
            value={`${myQuizSets.length}`}
            iconName="bookmark"
            toneIndex={0}
            accentColor={colors.brand}
            textColor="#111827"
          />
          <StatCard
            title="Completed"
            value={`${questionSets.filter((set) => set.progress >= 1).length}`}
            iconName="check-circle"
            toneIndex={1}
            accentColor={colors.brand}
            textColor="#111827"
          />
        </View>

        {myQuizSets.map((set, index) => (
          <EnhancedCard
            key={set.id}
            title={set.title}
            subtitle={set.topic}
            description={set.subtitle}
            backgroundColor={courseCardColors[index % courseCardColors.length]}
            imageUrl={set.imageUrl}
            badge={`${Math.round(set.progress * 100)}%`}
            onPress={() => onStartQuestionSet(set)}
            size="md"
            style={styles.myQuizCard}
          />
        ))}
      </ScrollView>
      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderQuiz = () => (
    currentQuestion ? (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.quizContainer}>
        <View style={styles.quizTopRow}>
          <Pressable style={styles.backLink} onPress={onBackToHome}>
            <Feather name="arrow-left" size={16} color={colors.textMuted} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.quizMeta}>{truncateText(currentQuestion.topic, 24)}</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>
              {quizIndex + 1} of {quizQuestions.length}
            </Text>
          </View>
        </View>

        <View style={styles.quizCard}>
          <ArtBlock tone={currentQuestion.artTone} variant="quiz" imageUrl={currentQuestion.imageUrl} />
          <Text style={styles.quizQuestion}>{truncateText(currentQuestion.prompt, 80)}</Text>

          <View style={styles.choiceStack}>
            {currentQuestion.choices.map((choice) => {
              const active = selectedChoice === choice.id;
              return (
                <Pressable
                  key={choice.id}
                  style={[
                    styles.choiceButton,
                    active && (choice.correct ? styles.choiceCorrect : styles.choiceWrong),
                  ]}
                  onPress={() => onSelectChoice(choice.id)}
                >
                  <Text style={styles.choiceLetter}>{choice.id.toUpperCase()}</Text>
                  <Text style={styles.choiceText}>{choice.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.quizHint}>
            <Text style={styles.quizHintTitle}>Fast feedback</Text>
            <Text style={styles.quizHintText}>{truncateText(currentQuestion.explanation, 120)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    ) : null
  );

  const renderResult = () => {
    const percent = Math.round((scoreSummary.answered / scoreSummary.total) * 100);
    const compare = percent >= 80 ? 'Top 10%' : percent >= 60 ? 'Top 30%' : 'Top 50%';

    return (
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Summary</Text>
            <Text style={styles.resultTopic}>Starter Quiz</Text>
          </View>
          <View style={styles.resultRing}>
            <Text style={styles.resultPercent}>{percent}%</Text>
            <Text style={styles.resultLabel}>Correct answers</Text>
          </View>
          <View style={styles.resultGrid}>
            <View style={styles.resultMetricCard}>
              <View style={styles.metricBadge}>
                <Text style={styles.resultMetricValue}>{scoreSummary.answered}</Text>
              </View>
              <Text style={styles.resultMetricLabel}>Answered</Text>
            </View>
            <View style={styles.resultMetricCard}>
              <View style={styles.metricBadge}>
                <Text style={styles.resultMetricValue}>{compare}</Text>
              </View>
              <Text style={styles.resultMetricLabel}>Compared to peers</Text>
            </View>
          </View>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>
              {percent >= 80 ? 'Outstanding' : percent >= 60 ? 'Nice work' : 'Keep going'}
            </Text>
            <Text style={styles.feedbackText}>
              Funfanti surfaces the next best set based on your performance so your next session
              stays short and useful.
            </Text>
          </View>
          <View style={styles.resultActions}>
            <Pressable style={styles.secondaryButton} onPress={onRetryQuiz}>
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={onContinueHome}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  };

  const renderProfile = () => (
    <View style={styles.page}>
      <SafeAreaView style={styles.profileTopSafeArea}>
        <View style={styles.profileTopStrip} />
      </SafeAreaView>
      <ScrollView
        {...strictScrollProps}
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

  if (screen === 'result') {
    return renderResult();
  }

  if (screen === 'question-detail') {
    return renderQuestionDetail();
  }

  if (screen === 'quiz') {
    return renderQuiz();
  }

  if (screen === 'my-quizzes') {
    return renderMyQuizzes();
  }

  switch (activeTab) {
    case 'home':
      return renderHome();
    case 'discover':
      return renderDiscover();
    case 'quiz':
      return renderMyQuizzes();
    case 'profile':
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
  profileTopSafeArea: {
    backgroundColor: palette.primary,
  },
  profileTopStrip: {
    height: 42,
    backgroundColor: palette.primary,
  },
  profileContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: spacing.xxl,
  },
  myQuizCard: {
    marginBottom: spacing.md,
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
    marginBottom: 14,
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
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
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
    marginBottom: 14,
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
    marginBottom: 14,
    padding: 0,
    overflow: "hidden",
  },
  featuredContent: {
    padding: spacing.lg,
  },
  featuredTag: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    fontSize: 12,
    lineHeight: 18,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
    lineHeight: 30,
  },
  featuredText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  listSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
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
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
  },
  counterBadgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
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
    fontSize: 22,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.5,
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
    paddingVertical: 18,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  choiceCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: 'transparent',
    transform: [{ scale: 1.01 }],
  },
  choiceWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: 'transparent',
    transform: [{ scale: 1.01 }],
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
  metricBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    marginBottom: spacing.sm,
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
