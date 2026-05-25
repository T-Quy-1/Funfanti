import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { IntroFlow } from './src/screens/IntroFlow';
import { AuthFlow } from './src/screens/AuthFlow';
import { MainFlow } from './src/screens/MainFlow';
import {
  onboardingSlides,
  type QuestionSetCard,
  type QuizQuestion,
  type ScreenKey,
} from './src/data/funfantiContent';
import * as Notifications from 'expo-notifications';
import { notificationService, markQuestionAsCorrect } from './src/services/notificationService';
import { QuickQuestionScreen } from './src/screens/QuickQuestionScreen';
import {
  funfantiApi,
  type AuthUser,
  type NotificationSchedule,
  type QuizSessionResult,
  type UserActivity,
  type UserBookmark,
  type UserProfile,
} from './src/services/funfantiApi';
import type { LockScreenTimingPreference } from './src/utils/notificationPreferences';

const emptyProfileFromAuth = (user: AuthUser): UserProfile => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
});

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>('splash');
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'quiz' | 'profile'>('home');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerName, setRegisterName] = useState('');

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userSpaceLoading, setUserSpaceLoading] = useState(false);
  const [userSpaceError, setUserSpaceError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);

  const [questionSets, setQuestionSets] = useState<QuestionSetCard[]>([]);
  const [questionSetTags, setQuestionSetTags] = useState<string[]>([]);
  const [questionSetsLoading, setQuestionSetsLoading] = useState(false);
  const [questionSetsError, setQuestionSetsError] = useState<string | null>(null);
  const [bookmarkActionLoadingId, setBookmarkActionLoadingId] = useState<string | null>(null);
  const [questionSetActionLoadingId, setQuestionSetActionLoadingId] = useState<string | null>(null);
  const [questionSetActionError, setQuestionSetActionError] = useState<string | null>(null);
  const [activeQuestionSetId, setActiveQuestionSetId] = useState('');
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuestionSetCard | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [quizStartedAtMs, setQuizStartedAtMs] = useState(() => Date.now());
  const [questionStartedAtMs, setQuestionStartedAtMs] = useState(() => Date.now());
  const [questionDurations, setQuestionDurations] = useState<Record<string, number>>({});
  const [quizSessionResult, setQuizSessionResult] = useState<QuizSessionResult | null>(null);
  const [quizSubmissionLoading, setQuizSubmissionLoading] = useState(false);
  const [quizSubmissionError, setQuizSubmissionError] = useState<string | null>(null);
  const [quizTotalTimeMs, setQuizTotalTimeMs] = useState(0);

  const [themeEnabled, setThemeEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationOverlay, setNotificationOverlay] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState<QuizQuestion | null>(null);

  const questionSetFetchId = useRef(0);

  useEffect(() => {
    notificationService.requestPermissionsAsync();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const question = response.notification.request.content.data?.question as QuizQuestion | undefined;
      if (question) {
        setQuickQuestion(question);
        setScreen('quick-question');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const bookmarkedQuestionSetIds = useMemo(
    () => bookmarks.map((bookmark) => bookmark.questionSet.id),
    [bookmarks],
  );

  const currentQuestion = quizQuestions[quizIndex] ?? null;

  const scoreSummary = useMemo(() => {
    const answerCount = Object.keys(answers).length;
    return {
      answered: answerCount,
      correct: score,
      total: quizQuestions.length,
      accuracy: quizQuestions.length ? Math.round((score / quizQuestions.length) * 100) : 0,
    };
  }, [answers, quizQuestions.length, score]);

  const syncPreferenceState = (nextProfile: UserProfile) => {
    const preference = nextProfile.preference;
    if (!preference) {
      return;
    }

    setThemeEnabled(preference.theme !== 'light');
    setHapticsEnabled(preference.hapticsEnabled);
    setNotificationOverlay(preference.notificationOverlay);
  };

  const refreshUserSpace = useCallback(async (token: string) => {
    setUserSpaceLoading(true);
    setUserSpaceError(null);

    try {
      const [nextProfile, nextBookmarks, nextActivity, nextSchedules] = await Promise.all([
        funfantiApi.getProfile(token),
        funfantiApi.getBookmarks(token),
        funfantiApi.getActivity(token),
        funfantiApi.getSchedules(token),
      ]);

      setProfile(nextProfile);
      setRegisterName(nextProfile.displayName ?? '');
      setRegisterEmail(nextProfile.email);
      setLoginEmail(nextProfile.email);
      setBookmarks(nextBookmarks);
      setActivity(nextActivity);
      setSchedules(nextSchedules);
      syncPreferenceState(nextProfile);
      void notificationService.replenishQuestionQueue(
        token,
        nextProfile.preference?.lockScreenTiming,
        nextProfile.preference?.notificationOverlay,
      );
    } catch (error) {
      setUserSpaceError(error instanceof Error ? error.message : 'Unable to load your profile data.');
    } finally {
      setUserSpaceLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('onboarding-1');
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    void funfantiApi
      .getQuestionSetTags()
      .then(setQuestionSetTags)
      .catch((error) => {
        setQuestionSetsError(error instanceof Error ? error.message : 'Unable to load question set tags.');
      });
  }, []);

  useEffect(() => {
    const fetchId = questionSetFetchId.current + 1;
    questionSetFetchId.current = fetchId;

    const timeoutId = setTimeout(() => {
      setQuestionSetsLoading(true);
      setQuestionSetsError(null);

      void funfantiApi
        .getQuestionSets({}, authToken)
        .then((nextQuestionSets) => {
          if (questionSetFetchId.current !== fetchId) {
            return;
          }

          setQuestionSets(nextQuestionSets);
          setActiveQuestionSet((current) => {
            if (!current) {
              return nextQuestionSets[0] ?? null;
            }
            return nextQuestionSets.find((questionSet) => questionSet.id === current.id) ?? current;
          });
          setActiveQuestionSetId((current) => current || nextQuestionSets[0]?.id || '');
        })
        .catch((error) => {
          if (questionSetFetchId.current === fetchId) {
            setQuestionSetsError(error instanceof Error ? error.message : 'Unable to refresh question sets.');
          }
        })
        .finally(() => {
          if (questionSetFetchId.current === fetchId) {
            setQuestionSetsLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      void refreshUserSpace(authToken);
      return;
    }

    setProfile(null);
    setBookmarks([]);
    setActivity([]);
    setSchedules([]);
    void notificationService.clearAllScheduledNotifications();
  }, [authToken, refreshUserSpace]);

  const goToAuthEntry = () => {
    setAuthError(null);
    setScreen('auth-select');
  };

  const goToMainApp = () => {
    setScreen('home');
    setActiveTab('home');
  };

  const moveOnboarding = (direction: 1 | -1) => {
    const next = activeSlide + direction;
    if (next < 0) {
      return;
    }

    if (next >= onboardingSlides.length) {
      setScreen('auth-select');
      return;
    }

    setActiveSlide(next);
    setScreen(onboardingSlides[next].key);
  };

  const handleRegister = async () => {
    const email = registerEmail.trim();
    const fallbackName = email.split('@')[0] || 'Funfanti Learner';

    if (!email) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (registerPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const payload = await funfantiApi.register({
        email,
        password: registerPassword,
        displayName: registerName.trim() || fallbackName,
      });
      setProfile(emptyProfileFromAuth(payload.user));
      setAuthToken(payload.accessToken);
      setScreen('auth-success');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create your account.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    const email = loginEmail.trim();

    if (!email || !loginPassword) {
      setAuthError('Please enter your email and password.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const payload = await funfantiApi.login(email, loginPassword);
      setProfile(emptyProfileFromAuth(payload.user));
      setAuthToken(payload.accessToken);
      goToMainApp();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to log in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const startQuestionSet = async (questionSet: QuestionSetCard) => {
    setActiveQuestionSetId(questionSet.id);
    setActiveQuestionSet(questionSet);
    setQuestionSetActionError(null);
    setScreen('question-detail');
    setActiveTab('quiz');

    try {
      const nextQuestionSet = await funfantiApi.getQuestionSet(questionSet.id, authToken);
      setActiveQuestionSet(nextQuestionSet);
    } catch {
      // The card already has enough data to let the user try loading questions.
    }
  };

  const startQuiz = () => {
    const now = Date.now();
    setQuizIndex(0);
    setAnswers({});
    setScore(0);
    setSelectedChoice(null);
    setQuestionDurations({});
    setQuizSessionResult(null);
    setQuizSubmissionError(null);
    setQuizStartedAtMs(now);
    setQuestionStartedAtMs(now);
    setQuizTotalTimeMs(0);
    setScreen('quiz');
    setActiveTab('quiz');
  };

  const beginActiveQuestionSetQuiz = async () => {
    const nextQuestionSet = activeQuestionSet ?? questionSets[0] ?? null;

    if (!nextQuestionSet) {
      setQuestionSetActionError('Choose a question set before starting a quiz.');
      return;
    }

    setActiveQuestionSetId(nextQuestionSet.id);
    setActiveQuestionSet(nextQuestionSet);
    setQuestionSetActionLoadingId(nextQuestionSet.id);
    setQuestionSetActionError(null);

    try {
      const nextQuestions = await funfantiApi.getQuestionSetQuestions(nextQuestionSet.id, nextQuestionSet);
      if (nextQuestions.length === 0) {
        setQuestionSetActionError('This question set does not have playable questions yet.');
        return;
      }

      setQuizQuestions(nextQuestions);
      startQuiz();
    } catch (error) {
      setQuestionSetActionError(error instanceof Error ? error.message : 'Unable to load this quiz.');
    } finally {
      setQuestionSetActionLoadingId(null);
    }
  };

  const submitChoice = (choiceId: string) => {
    if (!currentQuestion || selectedChoice) {
      return;
    }

    const timeTakenMs = choiceId === 'TIMEOUT' ? 15000 : Math.max(0, Date.now() - questionStartedAtMs);
    const nextAnswers = { ...answers };
    if (choiceId !== 'TIMEOUT') {
      nextAnswers[currentQuestion.id] = choiceId;
    }
    const isCorrect =
      choiceId !== 'TIMEOUT' && currentQuestion.choices.find((choice) => choice.id === choiceId)?.correct;

    setSelectedChoice(choiceId);
    setAnswers(nextAnswers);
    setQuestionDurations((current) => ({
      ...current,
      [currentQuestion.id]: timeTakenMs,
    }));

    if (isCorrect) {
      setScore((current) => current + 1);
    }
  };

  const advanceQuiz = () => {
    const nextIndex = quizIndex + 1;
    if (nextIndex >= quizQuestions.length) {
      return;
    }

    setQuizIndex(nextIndex);
    setSelectedChoice(null);
    setQuestionStartedAtMs(Date.now());
    setScreen('quiz');
    setActiveTab('quiz');
  };

  const submitQuizSession = async (finalAnswers: Record<string, string> = answers) => {
    if (!authToken) {
      setAuthError('Please log in before saving quiz results.');
      setScreen('login-method');
      return false;
    }

    const totalTimeMs = Math.max(1000, Date.now() - quizStartedAtMs);
    const responses = quizQuestions.map((question) => ({
      questionId: question.id,
      selectedAnswerId: finalAnswers[question.id] ?? undefined,
      timeTakenMs: questionDurations[question.id] ?? 0,
    }));

    setQuizSubmissionLoading(true);
    setQuizSubmissionError(null);
    setQuizTotalTimeMs(totalTimeMs);

    try {
      const result = await funfantiApi.submitQuizSession(
        activeQuestionSetId,
        {
          totalTimeMs,
          responses,
        },
        authToken,
      );
      setQuizSessionResult(result);
      setQuestionSets((current) =>
        current.map((questionSet) =>
          questionSet.id === activeQuestionSetId ? { ...questionSet, progress: 1 } : questionSet,
        ),
      );
      void refreshUserSpace(authToken);
      return true;
    } catch (error) {
      setQuizSubmissionError(error instanceof Error ? error.message : 'Unable to save quiz results.');
      return false;
    } finally {
      setQuizSubmissionLoading(false);
    }
  };

  const seeQuizSummary = async () => {
    const saved = await submitQuizSession(answers);
    if (saved) {
      setScreen('result');
    }
  };

  const toggleQuestionSetBookmark = async (questionSet: QuestionSetCard) => {
    if (!authToken) {
      setAuthError('Please log in to save question sets.');
      setScreen('login-method');
      return;
    }

    const alreadyBookmarked = bookmarkedQuestionSetIds.includes(questionSet.id);
    const previousBookmarks = bookmarks;
    setBookmarkActionLoadingId(questionSet.id);
    setQuestionSetsError(null);

    setBookmarks((current) =>
      alreadyBookmarked
        ? current.filter((bookmark) => bookmark.questionSet.id !== questionSet.id)
        : [
            {
              id: `optimistic-${questionSet.id}`,
              createdAt: new Date().toISOString(),
              questionSet: {
                id: questionSet.id,
                title: questionSet.title,
                description: questionSet.description,
                topic: questionSet.topic,
                mediaUrl: questionSet.imageUrl,
                isFeatured: questionSet.isFeatured,
              },
            },
            ...current,
          ],
    );

    setQuestionSets((current) =>
      current.map((item) =>
        item.id === questionSet.id ? { ...item, isBookmarked: !alreadyBookmarked } : item,
      ),
    );

    try {
      if (alreadyBookmarked) {
        await funfantiApi.removeQuestionSetBookmark(questionSet.id, authToken);
      } else {
        await funfantiApi.bookmarkQuestionSet(questionSet.id, authToken);
      }
      setBookmarks(await funfantiApi.getBookmarks(authToken));
      await notificationService.replenishQuestionQueue(
        authToken,
        profile?.preference?.lockScreenTiming,
        notificationOverlay,
      );
    } catch (error) {
      setBookmarks(previousBookmarks);
      setQuestionSets((current) =>
        current.map((item) =>
          item.id === questionSet.id ? { ...item, isBookmarked: alreadyBookmarked } : item,
        ),
      );
      setQuestionSetsError(error instanceof Error ? error.message : 'Unable to update bookmark.');
    } finally {
      setBookmarkActionLoadingId(null);
    }
  };

  const updateProfile = async (payload: { displayName?: string; avatarUrl?: string }) => {
    if (!authToken) {
      setAuthError('Please log in before editing your profile.');
      setScreen('login-method');
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const nextProfile = await funfantiApi.updateProfile(payload, authToken);
      setProfile(nextProfile);
      setRegisterName(nextProfile.displayName ?? '');
      setRegisterEmail(nextProfile.email);
      syncPreferenceState(nextProfile);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Unable to update your profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const updatePreference = async (nextState: {
    themeEnabled: boolean;
    hapticsEnabled: boolean;
    notificationOverlay: boolean;
    lockScreenTiming?: LockScreenTimingPreference;
  }) => {
    if (!authToken) {
      setAuthError('Please log in before changing settings.');
      setScreen('login-method');
      return;
    }

    const previous = { themeEnabled, hapticsEnabled, notificationOverlay };
    setThemeEnabled(nextState.themeEnabled);
    setHapticsEnabled(nextState.hapticsEnabled);
    setNotificationOverlay(nextState.notificationOverlay);
    setProfileError(null);

    try {
      const nextProfile = await funfantiApi.updatePreferences(
        {
          theme: nextState.themeEnabled ? 'system' : 'light',
          hapticsEnabled: nextState.hapticsEnabled,
          notificationOverlay: nextState.notificationOverlay,
          ...(nextState.lockScreenTiming ? { lockScreenTiming: nextState.lockScreenTiming } : {}),
        },
        authToken,
      );
      setProfile(nextProfile);
      syncPreferenceState(nextProfile);
      await notificationService.replenishQuestionQueue(
        authToken,
        nextProfile.preference?.lockScreenTiming,
        nextProfile.preference?.notificationOverlay,
      );
    } catch (error) {
      setThemeEnabled(previous.themeEnabled);
      setHapticsEnabled(previous.hapticsEnabled);
      setNotificationOverlay(previous.notificationOverlay);
      setProfileError(error instanceof Error ? error.message : 'Unable to update preferences.');
    }
  };

  const renderAuthFlowScreen = (
    authScreen: 'auth-select' | 'login-method' | 'register' | 'login' | 'auth-success',
    backTarget: ScreenKey = 'auth-select',
  ) => (
    <AuthFlow
      screen={authScreen}
      loginEmail={loginEmail}
      loginPassword={loginPassword}
      registerEmail={registerEmail}
      registerPassword={registerPassword}
      registerConfirmPassword={registerConfirmPassword}
      authLoading={authLoading}
      authError={authError}
      onChangeLoginEmail={setLoginEmail}
      onChangeLoginPassword={setLoginPassword}
      onChangeRegisterEmail={(value) => {
        setRegisterEmail(value);
        if (!registerName.trim()) {
          setRegisterName(value.split('@')[0] ?? '');
        }
      }}
      onChangeRegisterPassword={setRegisterPassword}
      onChangeRegisterConfirmPassword={setRegisterConfirmPassword}
      onBackToIntro={() => {
        setAuthError(null);
        setScreen(backTarget);
      }}
      onGoToLoginMethod={() => {
        setAuthError(null);
        setScreen('login-method');
      }}
      onGoToRegisterMethod={() => {
        setAuthError(null);
        setScreen('auth-select');
      }}
      onGoToLogin={() => {
        setAuthError(null);
        setScreen('login');
      }}
      onGoToRegister={() => {
        setAuthError(null);
        setScreen('register');
      }}
      onSubmitRegister={handleRegister}
      onSubmitLogin={handleLogin}
      onCompleteSuccess={goToMainApp}
    />
  );

  const renderMainFlow = (mainScreen: 'home' | 'my-quizzes' | 'discover' | 'question-detail' | 'quiz' | 'result' | 'profile') => (
    <MainFlow
      screen={mainScreen}
      profile={profile}
      profileSaving={profileSaving}
      profileError={profileError}
      userSpaceLoading={userSpaceLoading}
      userSpaceError={userSpaceError}
      bookmarks={bookmarks}
      activity={activity}
      schedules={schedules}
      activeTab={activeTab}
      onSelectTab={(tab) => {
        setActiveTab(tab);
        setScreen(tab === 'quiz' ? 'my-quizzes' : tab);
      }}
      onOpenDiscover={() => {
        setActiveTab('discover');
        setScreen('discover');
      }}
      onBackToHome={() => {
        setScreen('home');
        setActiveTab('home');
      }}
      activeQuestionSet={activeQuestionSet}
      questionSets={questionSets}
      questionSetTags={questionSetTags}
      questionSetsLoading={questionSetsLoading}
      questionSetsError={questionSetsError}
      bookmarkedQuestionSetIds={bookmarkedQuestionSetIds}
      bookmarkActionLoadingId={bookmarkActionLoadingId}
      questionSetActionLoadingId={questionSetActionLoadingId}
      questionSetActionError={questionSetActionError}
      quizQuestions={quizQuestions}
      quizIndex={quizIndex}
      selectedChoice={selectedChoice}
      scoreSummary={scoreSummary}
      currentQuestion={currentQuestion}
      questionStartedAtMs={questionStartedAtMs}
      questionDurations={questionDurations}
      quizTotalTimeMs={quizTotalTimeMs}
      quizSessionResult={quizSessionResult}
      quizSubmissionLoading={quizSubmissionLoading}
      quizSubmissionError={quizSubmissionError}
      notificationOverlay={notificationOverlay}
      onSelectChoice={submitChoice}
      onAdvanceQuiz={advanceQuiz}
      onSeeQuizSummary={seeQuizSummary}
      onTakeQuestionSetQuiz={beginActiveQuestionSetQuiz}
      onStartQuestionSet={startQuestionSet}
      onToggleQuestionSetBookmark={toggleQuestionSetBookmark}
      onRetryQuiz={startQuiz}
      onContinueHome={() => {
        setScreen('home');
        setActiveTab('home');
      }}
      onUpdateProfile={updateProfile}
      onRefreshUserSpace={() => {
        if (authToken) {
          void refreshUserSpace(authToken);
        }
      }}
      onUpdateNotificationOverlay={(value) => {
        void updatePreference({
          themeEnabled,
          hapticsEnabled,
          notificationOverlay: value,
        });
      }}
      onUpdateLockScreenTiming={(value) => {
        void updatePreference({
          themeEnabled,
          hapticsEnabled,
          notificationOverlay,
          lockScreenTiming: value,
        });
      }}
    />
  );

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
      case 'onboarding-1':
      case 'onboarding-2':
      case 'onboarding-3':
        return (
          <IntroFlow
            screen={screen}
            activeSlide={
              screen === 'onboarding-1' ? 0 : screen === 'onboarding-2' ? 1 : screen === 'onboarding-3' ? 2 : activeSlide
            }
            onGoToApp={goToAuthEntry}
            onAdvanceOnboarding={() => {
              if (screen === 'onboarding-3') {
                setScreen('auth-select');
                return;
              }
              moveOnboarding(1);
            }}
          />
        );
      case 'auth-select':
        return renderAuthFlowScreen('auth-select', 'auth-select');
      case 'login-method':
        return renderAuthFlowScreen('login-method', 'auth-select');
      case 'register':
        return renderAuthFlowScreen('register', 'auth-select');
      case 'login':
        return renderAuthFlowScreen('login', 'login-method');
      case 'auth-success':
        return renderAuthFlowScreen('auth-success', 'auth-select');
      case 'quick-question':
        return (
          <QuickQuestionScreen
            question={quickQuestion}
            onClose={(wasCorrect) => {
              if (wasCorrect && quickQuestion) {
                markQuestionAsCorrect(quickQuestion.id);
                if (authToken) {
                  void notificationService.replenishQuestionQueue(
                    authToken,
                    profile?.preference?.lockScreenTiming,
                    notificationOverlay,
                  );
                }
              }
              setScreen('home');
              setActiveTab('home');
            }}
          />
        );
      case 'home':
      case 'my-quizzes':
      case 'discover':
      case 'question-detail':
      case 'quiz':
      case 'result':
      case 'profile':
        return renderMainFlow(screen);
      default:
        return renderMainFlow('home');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ExpoStatusBar style="dark" />
      {renderScreen()}
    </View>
  );
}
