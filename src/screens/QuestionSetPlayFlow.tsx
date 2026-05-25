import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomNav } from '../components';
import { BOTTOM_NAV_CONTENT_PADDING, BOTTOM_NAV_HEIGHT, BOTTOM_NAV_BOTTOM_OFFSET } from '../components/BottomNav';
import type { QuestionSetCard, QuizQuestion } from '../data/funfantiContent';
import type { QuizSessionResult } from '../services/funfantiApi';
import type { AppTab } from './screenTypes';

const QUESTION_TIME_LIMIT_MS = 15000;

const playColors = {
  primary: '#269D54',
  primaryLight: '#38DE90',
  navy: '#081245',
  white: '#FFFFFF',
  offWhite: '#F9F9F9',
  lime: '#EEF4C2',
  cyan: '#CFF4F5',
  blue: '#0043CE',
  danger: '#EA5F5F',
  dangerBorder: '#810406',
  text: '#020202',
};

type ScoreSummary = {
  answered: number;
  correct: number;
  total: number;
  accuracy: number;
};

const resolveQuestionSetImage = (questionSet?: QuestionSetCard): ImageSourcePropType | undefined => {
  if (!questionSet) {
    return undefined;
  }

  return questionSet.imageSource ?? (questionSet.imageUrl ? { uri: questionSet.imageUrl } : undefined);
};

const resolveQuestionImage = (question: QuizQuestion): ImageSourcePropType | undefined =>
  question.imageSource ?? (question.imageUrl ? { uri: question.imageUrl } : undefined);

const formatQuestionCount = (count: number) => `${count} ${count === 1 ? 'Question' : 'Questions'}`;

const getChoiceLetter = (choice: QuizQuestion['choices'][number], index: number) =>
  `${(choice.letter ?? String.fromCharCode(65 + index)).toUpperCase()}.`;

function PlayHeader({
  completedCount,
  onBack,
  questionIndex,
  secondsRemaining,
  totalQuestions,
}: {
  completedCount: number;
  onBack: () => void;
  questionIndex: number;
  secondsRemaining: number;
  totalQuestions: number;
}) {
  const progress = totalQuestions > 0 ? completedCount / totalQuestions : 0;
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.playHeader}>
      <View style={styles.playTopRow}>
        <Pressable style={styles.headerIconButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={playColors.white} />
        </Pressable>
        <Text style={styles.playHeaderTitle}>Question {questionIndex + 1}</Text>
        <View style={styles.timerRow}>
          <Feather name="clock" size={22} color={playColors.white} />
          <Text style={styles.timerText}>{secondsRemaining}s</Text>
        </View>
      </View>
      <View style={styles.progressBlock}>
        <View style={styles.progressInfoRow}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressPercent}>{percent}%</Text>
            <Text style={styles.progressLabel}>Completed</Text>
          </View>
          <Text style={styles.progressCount}>
            {completedCount}/{totalQuestions}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(2, percent)}%` as `${number}%` }]} />
        </View>
      </View>
    </View>
  );
}

function ChoiceButton({
  choice,
  index,
  selected,
  state,
  onPress,
}: {
  choice: QuizQuestion['choices'][number];
  index: number;
  selected: boolean;
  state: 'idle' | 'correct' | 'wrong';
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      style={({ pressed }) => [
        styles.optionButton,
        state === 'correct' && styles.optionCorrect,
        state === 'wrong' && styles.optionWrong,
        selected && state === 'idle' && styles.optionSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionLetter,
          (state === 'correct' || state === 'wrong') && styles.optionTextInverse,
        ]}
      >
        {getChoiceLetter(choice, index)}
      </Text>
      <Text
        style={[
          styles.optionText,
          (state === 'correct' || state === 'wrong') && styles.optionTextInverse,
        ]}
      >
        {choice.label}
      </Text>
      <View style={{ width: 38 }} />
    </Pressable>
  );
}

export function QuestionSetDetailScreen({
  activeTab,
  error,
  loading,
  questionSet,
  onBack,
  onSelectTab,
  onTakeQuiz,
}: {
  activeTab: AppTab;
  error?: string | null;
  loading: boolean;
  questionSet?: QuestionSetCard | null;
  onBack: () => void;
  onSelectTab: (tab: AppTab) => void;
  onTakeQuiz: () => void;
}) {
  const imageSource = resolveQuestionSetImage(questionSet ?? undefined);

  if (!questionSet) {
    return (
      <View style={styles.page}>
        <SafeAreaView style={{ backgroundColor: playColors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
          <View style={styles.detailHeader}>
            <Pressable style={styles.detailBackButton} onPress={onBack}>
              <Feather name="chevron-left" size={24} color={playColors.white} />
            </Pressable>
            <Text style={styles.detailHeaderTitle}>Quiz Detail</Text>
          </View>
        </SafeAreaView>
        <View style={styles.emptyDetail}>
          <Text style={styles.emptyTitle}>Question set unavailable</Text>
          <Text style={styles.emptyBody}>Return to Question Sets and choose another quiz.</Text>
        </View>
        <BottomNav activeTab={activeTab} onSelect={onSelectTab} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <SafeAreaView style={{ backgroundColor: playColors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
        <View style={styles.detailHeader}>
          <Pressable style={styles.detailBackButton} onPress={onBack}>
            <Feather name="chevron-left" size={24} color={playColors.white} />
          </Pressable>
          <Text style={styles.detailHeaderTitle}>Quiz Detail</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
        {imageSource ? (
          <Image source={imageSource} style={styles.detailImage} resizeMode="cover" />
        ) : null}
        <Text style={styles.detailTitle}>{questionSet.title}</Text>
        <View style={styles.detailCountRow}>
          <Feather name="book-open" size={16} color={playColors.navy} />
          <Text style={styles.detailCount}>{formatQuestionCount(questionSet.questionCount)}</Text>
        </View>
        <View style={styles.detailTags}>
          {questionSet.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.detailTag}>
              <Text style={styles.detailTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.creatorRow}>
          <View style={styles.creatorAvatar}>
            <Feather name="user" size={18} color={playColors.navy} />
          </View>
          <Text style={styles.creatorName}>{questionSet.creatorName ?? 'Creator unavailable'}</Text>
        </View>
        <Text style={styles.detailLead}>{questionSet.subtitle}</Text>
        <Text style={styles.detailBody}>{questionSet.description}</Text>
        {error ? <Text style={styles.detailError}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.detailActionWrap}>
        <Pressable
          disabled={loading}
          style={({ pressed }) => [
            styles.takeQuizButton,
            loading && styles.disabledButton,
            pressed && styles.pressed,
          ]}
          onPress={onTakeQuiz}
        >
          <Text style={styles.takeQuizText}>{loading ? 'Loading quiz' : 'Take the quiz'}</Text>
        </Pressable>
      </View>
      <BottomNav activeTab={activeTab} onSelect={onSelectTab} />
    </View>
  );
}

export function QuestionSetQuizScreen({
  question,
  questionIndex,
  questionStartedAtMs,
  questionDurationMs,
  selectedChoice,
  totalQuestions,
  onAdvance,
  onBack,
  onSeeSummary,
  onSelectChoice,
  submitting,
  submissionError,
}: {
  question: QuizQuestion | null;
  questionIndex: number;
  questionStartedAtMs: number;
  questionDurationMs?: number;
  selectedChoice: string | null;
  totalQuestions: number;
  onAdvance: () => void;
  onBack: () => void;
  onSeeSummary: () => void;
  onSelectChoice: (choiceId: string) => void;
  submitting: boolean;
  submissionError?: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (selectedChoice) {
      return undefined;
    }

    setNow(Date.now());
    const timerId = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      if (currentNow - questionStartedAtMs >= QUESTION_TIME_LIMIT_MS) {
        onSelectChoice('TIMEOUT');
      }
    }, 500);
    return () => clearInterval(timerId);
  }, [selectedChoice, question?.id, questionStartedAtMs, onSelectChoice]);

  if (!question) {
    return (
      <View style={styles.quizPage}>
        <SafeAreaView style={{ backgroundColor: playColors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
          <View style={styles.detailHeader}>
            <Pressable style={styles.detailBackButton} onPress={onBack}>
              <Feather name="chevron-left" size={24} color={playColors.white} />
            </Pressable>
            <Text style={styles.detailHeaderTitle}>Quiz</Text>
          </View>
        </SafeAreaView>
        <View style={styles.emptyDetail}>
          <Text style={styles.emptyTitle}>No quiz questions yet</Text>
          <Text style={styles.emptyBody}>Load a question set from the backend to begin.</Text>
        </View>
      </View>
    );
  }

  const selected = question.choices.find((choice) => choice.id === selectedChoice);
  const answered = Boolean(selectedChoice);
  const selectedIsCorrect = Boolean(selected?.correct);
  const currentElapsedMs = answered && questionDurationMs !== undefined ? questionDurationMs : now - questionStartedAtMs;
  const secondsRemaining = Math.max(0, Math.ceil((QUESTION_TIME_LIMIT_MS - currentElapsedMs) / 1000));
  const completedCount = answered ? questionIndex + 1 : questionIndex;
  const imageSource = resolveQuestionImage(question);
  const finalQuestion = questionIndex + 1 >= totalQuestions;

  const isTimeout = selectedChoice === 'TIMEOUT';
  const feedbackTitle = selectedIsCorrect
    ? finalQuestion
      ? 'Spot On!'
      : 'Congratulations!'
    : isTimeout
      ? "Time's up!"
      : finalQuestion
        ? 'Not Quite!'
        : 'Tough Luck!';
        
  const correctChoiceLabel = question.choices.find(c => c.correct)?.label;
  const feedbackCopy = isTimeout
    ? `Correct answer: ${correctChoiceLabel}\n\n${question.explanation}`
    : question.explanation;

  return (
    <View style={styles.quizPage}>
      <SafeAreaView style={{ backgroundColor: playColors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
        <PlayHeader
          completedCount={completedCount}
          onBack={onBack}
          questionIndex={questionIndex}
          secondsRemaining={secondsRemaining}
          totalQuestions={totalQuestions}
        />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[styles.quizContent, answered && styles.quizContentAnswered]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionPrompt}>{question.prompt}</Text>
        {!answered && imageSource ? (
          <Image source={imageSource} style={styles.questionImage} resizeMode="cover" />
        ) : null}

        <View style={styles.optionsStack}>
          {(answered ? question.choices.filter((choice) => choice.id === selectedChoice) : question.choices).map(
            (choice, index) => {
              const originalIndex = question.choices.findIndex((item) => item.id === choice.id);
              const state = answered ? (choice.correct ? 'correct' : 'wrong') : 'idle';

              return (
                <ChoiceButton
                  key={choice.id}
                  choice={choice}
                  index={originalIndex >= 0 ? originalIndex : index}
                  selected={choice.id === selectedChoice}
                  state={state}
                  onPress={answered ? undefined : () => onSelectChoice(choice.id)}
                />
              );
            },
          )}
        </View>
      </ScrollView>

      {answered ? (
        <View style={[styles.feedbackSheet, selectedIsCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackTitle}>{feedbackTitle}</Text>
          <Text style={styles.feedbackCopy}>{feedbackCopy}</Text>
          {submissionError ? <Text style={styles.feedbackError}>{submissionError}</Text> : null}
          {finalQuestion ? <Text style={styles.completionNote}>You have completed the Quiz, Great work!</Text> : null}
          <Pressable
            disabled={submitting}
            style={({ pressed }) => [
              styles.feedbackButton,
              finalQuestion && styles.feedbackButtonFinal,
              submitting && styles.disabledButton,
              pressed && styles.pressed,
            ]}
            onPress={finalQuestion ? onSeeSummary : onAdvance}
          >
            <Text style={[styles.feedbackButtonText, finalQuestion && styles.feedbackButtonTextFinal]}>
              {finalQuestion ? (submitting ? 'Saving' : 'See Summary') : 'Next Question'}
            </Text>
            <Feather name="arrow-right" size={24} color={finalQuestion ? playColors.white : playColors.navy} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function QuestionSetSummaryScreen({
  questionSet,
  quizSessionResult,
  scoreSummary,
  totalTimeMs,
  onBack,
  onContinue,
  onRetry,
}: {
  questionSet?: QuestionSetCard | null;
  quizSessionResult: QuizSessionResult | null;
  scoreSummary: ScoreSummary;
  totalTimeMs: number;
  onBack: () => void;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const percent = scoreSummary.accuracy;
  const title = percent === 100 ? 'Perfect Score!' : percent === 0 ? 'Better Luck Next Time!' : 'Good Effort!';
  const timeSeconds = Math.max(1, Math.round((quizSessionResult?.totalTimeMs ?? totalTimeMs) / 1000));
  const analyticsCopy = quizSessionResult?.id
    ? quizSessionResult.analyticsSummary
    : 'Server analytics were not returned for this attempt.';

  return (
    <View style={styles.summaryPage}>
      <SafeAreaView style={{ backgroundColor: playColors.navy, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
        <View style={styles.summaryHeader}>
          <Pressable style={styles.detailBackButton} onPress={onBack}>
            <Feather name="chevron-left" size={24} color={playColors.white} />
          </Pressable>
          <View style={styles.summaryHeaderRow}>
            <Feather name="star" size={24} color="#D6F300" />
            <Text style={styles.summaryHeaderTitle}>Summary</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.summaryContent} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <Text style={styles.summarySetTitle}>{questionSet?.title ?? 'Starter Quiz'}</Text>
        <View style={styles.scoreRing}>
          <Text style={styles.scorePercent}>{percent}%</Text>
        </View>
        <Text style={styles.summaryResultTitle}>{title}</Text>
        <Text style={styles.summaryAnalytics}>{analyticsCopy}</Text>
        <View style={styles.summaryMetricRow}>
          <Feather name="check-circle" size={24} color={playColors.primary} />
          <Text style={styles.summaryMetricText}>
            Correct answers: {scoreSummary.correct}/{scoreSummary.total}
          </Text>
        </View>
        <View style={styles.summaryMetricRow}>
          <Feather name="clock" size={24} color={playColors.navy} />
          <Text style={styles.summaryMetricText}>Time: {timeSeconds}s</Text>
        </View>
        <View style={styles.summaryActions}>
          <Pressable style={({ pressed }) => [styles.summaryRetryButton, pressed && styles.pressed]} onPress={onRetry}>
            <Text style={styles.summaryRetryText}>Retry</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.summaryContinueButton, pressed && styles.pressed]}
            onPress={onContinue}
          >
            <Text style={styles.summaryContinueText}>Continue</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: playColors.white,
  },
  detailHeader: {
    minHeight: 137,
    backgroundColor: playColors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 22,
  },
  detailBackButton: {
    position: 'absolute',
    left: 18,
    top: 58,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailHeaderTitle: {
    color: playColors.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
  },
  detailContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING + 76,
  },
  detailImage: {
    width: '100%',
    height: 144,
    borderRadius: 14,
    marginBottom: 18,
  },
  detailTitle: {
    color: playColors.navy,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '600',
  },
  detailCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  detailCount: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  detailTag: {
    minHeight: 28,
    borderRadius: 360,
    backgroundColor: playColors.navy,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  detailTagText: {
    color: playColors.white,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: playColors.lime,
    borderWidth: 1,
    borderColor: 'rgba(8,18,69,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  detailLead: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginTop: 18,
  },
  detailBody: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    marginTop: 18,
  },
  detailError: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  detailActionWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: BOTTOM_NAV_HEIGHT + BOTTOM_NAV_BOTTOM_OFFSET + 8,
  },
  takeQuizButton: {
    height: 56,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: playColors.primary,
    backgroundColor: playColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeQuizText: {
    color: playColors.primary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  emptyDetail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: BOTTOM_NAV_CONTENT_PADDING,
  },
  emptyTitle: {
    color: playColors.navy,
    fontSize: 20,
    fontWeight: '700',
  },
  emptyBody: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  quizPage: {
    flex: 1,
    backgroundColor: playColors.white,
  },
  playHeader: {
    minHeight: 137,
    backgroundColor: playColors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 36,
    paddingHorizontal: 18,
  },
  playTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  playHeaderTitle: {
    color: playColors.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
    flex: 1,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    color: playColors.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '600',
  },
  progressBlock: {
    paddingHorizontal: 24,
    marginTop: 2,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  progressPercent: {
    color: playColors.white,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
  },
  progressLabel: {
    color: playColors.white,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  progressCount: {
    color: playColors.white,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  progressTrack: {
    height: 8,
    borderRadius: 64,
    backgroundColor: playColors.navy,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 64,
    backgroundColor: playColors.blue,
  },
  quizContent: {
    paddingHorizontal: 36,
    paddingTop: 38,
    paddingBottom: 52,
  },
  quizContentAnswered: {
    paddingTop: 38,
    paddingBottom: 180,
  },
  questionPrompt: {
    color: playColors.navy,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '500',
    textAlign: 'center',
  },
  questionImage: {
    width: '100%',
    height: 134,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 28,
  },
  optionsStack: {
    gap: 22,
    marginTop: 28,
  },
  optionButton: {
    minHeight: 56,
    borderRadius: 360,
    borderWidth: 1.5,
    borderColor: playColors.navy,
    backgroundColor: playColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 22,
  },
  optionSelected: {
    backgroundColor: playColors.offWhite,
  },
  optionCorrect: {
    backgroundColor: playColors.primaryLight,
    borderColor: playColors.primary,
  },
  optionWrong: {
    backgroundColor: playColors.danger,
    borderColor: playColors.dangerBorder,
  },
  optionLetter: {
    width: 38,
    color: playColors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    color: playColors.navy,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextInverse: {
    color: playColors.white,
  },
  feedbackSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 220,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: playColors.navy,
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 34,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: playColors.lime,
  },
  feedbackWrong: {
    backgroundColor: playColors.cyan,
  },
  feedbackTitle: {
    color: playColors.navy,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedbackCopy: {
    color: playColors.navy,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 34,
  },
  feedbackError: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
  },
  completionNote: {
    color: playColors.text,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 22,
  },
  feedbackButton: {
    minHeight: 48,
    borderRadius: 360,
    borderWidth: 1.5,
    borderColor: playColors.navy,
    backgroundColor: playColors.primaryLight,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
  },
  feedbackButtonFinal: {
    backgroundColor: playColors.navy,
  },
  feedbackButtonText: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  feedbackButtonTextFinal: {
    color: playColors.white,
  },
  summaryPage: {
    flex: 1,
    backgroundColor: playColors.white,
  },
  summaryContent: {
    paddingBottom: 32,
  },
  summaryHeader: {
    minHeight: 137,
    backgroundColor: playColors.navy,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryHeaderTitle: {
    color: playColors.white,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
  },
  summaryCard: {
    marginHorizontal: 28,
    marginTop: 32,
    minHeight: 487,
    borderRadius: 20,
    backgroundColor: 'rgba(43,217,222,0.2)',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
  },
  summarySetTitle: {
    color: playColors.navy,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreRing: {
    width: 145,
    height: 145,
    borderRadius: 72.5,
    borderWidth: 10,
    borderColor: playColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  scorePercent: {
    color: playColors.primary,
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
  },
  summaryResultTitle: {
    color: playColors.navy,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },
  summaryAnalytics: {
    color: playColors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  summaryMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 10,
    minHeight: 30,
    flexWrap: 'wrap',
  },
  summaryMetricText: {
    color: playColors.text,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 22,
  },
  summaryRetryButton: {
    width: 103,
    height: 40,
    borderRadius: 360,
    borderWidth: 1,
    borderColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRetryText: {
    color: playColors.navy,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  summaryContinueButton: {
    width: 103,
    height: 40,
    borderRadius: 360,
    backgroundColor: playColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContinueText: {
    color: playColors.white,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  disabledButton: {
    opacity: 0.68,
  },
  pressed: {
    opacity: 0.76,
  },
});
