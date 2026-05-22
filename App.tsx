import { useEffect, useMemo, useState } from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArtBlock } from './src/components/ArtBlock';
import { BottomNav } from './src/components/BottomNav';
import { LogoBrand } from './src/components/LogoBrand';
import { ScreenHeader } from './src/components/ScreenHeader';
import { IntroFlow } from './src/screens/IntroFlow';
import { AuthFlow } from './src/screens/AuthFlow';
import { MainFlow } from './src/screens/MainFlow';
import {
  filterChips as defaultFilterChips,
  interests as defaultInterests,
  onboardingSlides as defaultOnboardingSlides,
  questionSets as defaultQuestionSets,
  quizQuestions as defaultQuizQuestions,
  ScreenKey,
  stats as defaultStats,
} from './src/data/funfantiContent';
import { funfantiApi } from './src/services/funfantiApi';

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>('splash');
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedInterest, setSelectedInterest] = useState('General Knowledge');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'quiz' | 'profile'>('home');
  const [loginEmail, setLoginEmail] = useState('john.doe@gmail.com');
  const [loginPassword, setLoginPassword] = useState('1234567890');
  const [registerEmail, setRegisterEmail] = useState('john.doe@gmail.com');
  const [registerPassword, setRegisterPassword] = useState('1234567890');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('1234567890');
  const [registerName, setRegisterName] = useState('John Doe');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [onboardingSlides, setOnboardingSlides] = useState(defaultOnboardingSlides);
  const [interests, setInterests] = useState(defaultInterests);
  const [filterChips, setFilterChips] = useState(defaultFilterChips);
  const [questionSets, setQuestionSets] = useState(defaultQuestionSets);
  const [quizQuestions, setQuizQuestions] = useState(defaultQuizQuestions);
  const [stats, setStats] = useState(defaultStats);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [themeEnabled, setThemeEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationOverlay, setNotificationOverlay] = useState(false);

  useEffect(() => {
    let mounted = true;

    void funfantiApi.bootstrap().then((payload) => {
      if (!mounted) {
        return;
      }

      setOnboardingSlides(payload.onboardingSlides);
      setInterests(payload.interests);
      setQuestionSets(payload.questionSets);
      setQuizQuestions(payload.quizQuestions);
      setStats(payload.stats);
      setRegisterName(payload.profile.displayName);
      setRegisterEmail(payload.profile.email);
      setLoginEmail(payload.profile.email);
      setSelectedInterest(payload.interests[0] ?? 'General Knowledge');
    });

    const timer = setTimeout(() => {
      if (mounted) {
        setScreen('onboarding-1');
      }
    }, 1400);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const currentQuestion = quizQuestions[quizIndex];

  const scoreSummary = useMemo(() => {
    const answerCount = Object.keys(answers).length;
    return {
      answered: answerCount,
      total: quizQuestions.length,
      accuracy: answerCount ? Math.round((score / answerCount) * 100) : 0,
    };
  }, [answers, score]);

  const goToMainApp = () => {
    setScreen('home');
    setActiveTab('home');
  };

  const goToAuthEntry = () => {
    setAuthError(null);
    setScreen('auth-select');
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((currentInterests) =>
      currentInterests.includes(interest)
        ? currentInterests.filter((currentInterest) => currentInterest !== interest)
        : [...currentInterests, interest],
    );
  };

  const continueFromInterests = () => {
    if (selectedInterests.length < 3) {
      return;
    }

    setSelectedInterest(selectedInterests[0]);
    setScreen('auth-select');
  };

  const moveOnboarding = (direction: 1 | -1) => {
    const next = activeSlide + direction;
    if (next < 0) {
      return;
    }

    if (next >= onboardingSlides.length) {
      setScreen('interests');
      return;
    }

    setActiveSlide(next);
    setScreen(onboardingSlides[next].key);
  };

  const submitChoice = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion.id]: choiceId }));

    const isCorrect = currentQuestion.choices.find((choice) => choice.id === choiceId)?.correct;
    if (isCorrect) {
      setScore((currentScore) => currentScore + 1);
    }

    const nextIndex = quizIndex + 1;
    if (nextIndex >= quizQuestions.length) {
      submitQuizSession();
      setScreen('result');
      return;
    }

    setTimeout(() => {
      setQuizIndex(nextIndex);
      setSelectedChoice(null);
      setScreen('quiz');
    }, 350);
  };

  const startQuiz = () => {
    setQuizIndex(0);
    setAnswers({});
    setScore(0);
    setSelectedChoice(null);
    setScreen('quiz');
    setActiveTab('quiz');
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
        displayName: fallbackName,
      });
      setAuthToken(payload.accessToken);
      setRegisterName(payload.user.displayName || fallbackName);
      setRegisterEmail(payload.user.email);
      setLoginEmail(payload.user.email);
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
      setAuthToken(payload.accessToken);
      setRegisterName(payload.user.displayName || email.split('@')[0] || 'Funfanti Learner');
      setRegisterEmail(payload.user.email);
      setLoginEmail(payload.user.email);
      setScreen('home');
      setActiveTab('home');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to log in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const persistPreferences = (nextState: {
    themeEnabled: boolean;
    hapticsEnabled: boolean;
    notificationOverlay: boolean;
  }) => {
    void funfantiApi.updatePreferences(
      {
        theme: nextState.themeEnabled ? 'system' : 'light',
        hapticsEnabled: nextState.hapticsEnabled,
        notificationOverlay: nextState.notificationOverlay,
      },
      authToken,
    );
  };

  const submitQuizSession = () => {
    void funfantiApi.submitQuizSession({
      questionSetId: questionSets[0]?.id ?? 'starter-quiz',
      totalTimeMs: quizQuestions.length * 12000,
      score,
      responses: quizQuestions.map((question) => ({
        questionId: question.id,
        selectedAnswerId: answers[question.id] ?? null,
        timeTakenMs: 12000,
      })),
    });
  };

  const renderBottomNav = () => (
    <BottomNav
      activeTab={activeTab}
      onSelect={(tab) => {
        setActiveTab(tab);
        setScreen(tab);
      }}
    />
  );

  const renderSplash = () => (
    <View style={styles.splashScreen}>
      <View style={styles.splashGlowTop} />
      <View style={styles.splashGlowBottom} />
      <View style={styles.splashCenter}>
        <LogoBrand size="lg" showName={false} showTagline={false} />
        <Pressable onPress={goToMainApp} style={styles.splashLink}>
          <Text style={styles.splashLinkText}>Enter app</Text>
          <Text style={styles.splashLinkArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderOnboarding = (slideIndex: number) => {
    const slide = onboardingSlides[slideIndex];

    return (
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.onboardingContainer}>
          <View style={styles.heroMark}>
            <LogoBrand size="md" showName={false} showTagline={false} />
          </View>
          <View style={styles.dotRow}>
            {onboardingSlides.map((item, index) => (
              <View key={item.key} style={[styles.dot, index === slideIndex && styles.dotActive]} />
            ))}
          </View>
          <Text style={styles.onboardingTitle}>{slide.title}</Text>
          <View style={styles.onboardingActions}>
            <Pressable onPress={goToMainApp} style={styles.onboardingLink}>
              <Text style={styles.onboardingLinkText}>Skip</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => moveOnboarding(1)}>
              <Text style={styles.primaryButtonText}>{slideIndex === 2 ? 'Get started' : 'Next'} →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderInterests = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.interestContainer}>
        <ScreenHeader
          title="What interests you?"
          subtitle="Select a learning theme to personalize your feed."
        />
        <View style={styles.interestGrid}>
          {interests.map((interest) => {
            const active = selectedInterest === interest;
            return (
              <Pressable
                key={interest}
                style={[styles.interestChip, active && styles.interestChipActive]}
                onPress={() => setSelectedInterest(interest)}
              >
                <Text style={[styles.interestChipText, active && styles.interestChipTextActive]}>
                  {interest}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Your feed starts with {selectedInterest}</Text>
          <Text style={styles.noteText}>
            We’ll prioritize sets and reminders around your chosen interest for quicker daily
            learning.
          </Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => setScreen('auth-select')}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  const renderAuthSelect = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.authContainer}>
        <View style={styles.authBadge}>
          <LogoBrand size="sm" showName={false} showTagline={false} />
        </View>
        <Text style={styles.authTitle}>Create Account</Text>
        <Text style={styles.authText}>Choose a fast path to get into your learning flow.</Text>
        <View style={styles.authButtonStack}>
          <Pressable style={styles.outlineButton} onPress={() => setScreen('register')}>
            <Text style={styles.outlineButtonText}>Register with E-mail or Phone number</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={() => setScreen('register')}>
            <Text style={styles.outlineButtonText}>Register with Google</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={() => setScreen('register')}>
            <Text style={styles.outlineButtonText}>Register with Apple</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={() => setScreen('register')}>
            <Text style={styles.outlineButtonText}>Register with Facebook</Text>
          </Pressable>
        </View>
        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account?</Text>
          <Pressable onPress={() => setScreen('login')}>
            <Text style={styles.linkAction}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderRegister = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Pressable onPress={() => setScreen('auth-select')}>
          <Text style={styles.backLabel}>‹ Back</Text>
        </Pressable>
        <Text style={styles.formTitle}>Create your account</Text>
        <TextInput
          style={styles.input}
          value={registerEmail}
          onChangeText={setRegisterEmail}
          placeholder="Email address"
          placeholderTextColor="#7d7d7d"
        />
        <TextInput
          style={styles.input}
          value={registerName}
          onChangeText={setRegisterName}
          placeholder="Full name"
          placeholderTextColor="#7d7d7d"
        />
        <TextInput
          style={styles.input}
          value={registerPassword}
          onChangeText={setRegisterPassword}
          placeholder="Password"
          placeholderTextColor="#7d7d7d"
          secureTextEntry
        />
        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>
        <Text style={styles.legalText}>
          By tapping Create Account you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );

  const renderLogin = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Pressable onPress={() => setScreen('auth-select')}>
          <Text style={styles.backLabel}>‹ Back</Text>
        </Pressable>
        <Text style={styles.formTitle}>Login to your account</Text>
        <TextInput
          style={styles.input}
          value={loginEmail}
          onChangeText={setLoginEmail}
          placeholder="Email address"
          placeholderTextColor="#7d7d7d"
        />
        <TextInput
          style={styles.input}
          value={loginPassword}
          onChangeText={setLoginPassword}
          placeholder="Password"
          placeholderTextColor="#7d7d7d"
          secureTextEntry
        />
        <Pressable style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>
        <Pressable style={styles.secondaryLink} onPress={() => setScreen('register')}>
          <Text style={styles.secondaryLinkText}>Forget Password</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  const renderAuthSuccess = () => (
    <View style={styles.successScreen}>
      <View style={styles.successCircle}>
        <Text style={styles.successCheck}>✓</Text>
      </View>
      <Text style={styles.successTitle}>You're All Set!</Text>
      <Pressable style={styles.successButton} onPress={goToMainApp}>
        <Text style={styles.successButtonText}>Continue</Text>
      </Pressable>
    </View>
  );

  const renderHome = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.appContent}>
        <ScreenHeader title="Home" subtitle={`Good evening, ${registerName.split(' ')[0]}.`} />
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
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.featuredCard}>
          <ArtBlock tone="#d7f2c8" variant="hero" />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTag}>Featured quiz</Text>
            <Text style={styles.featuredTitle}>{questionSets[0].title}</Text>
            <Text style={styles.featuredText}>{questionSets[0].subtitle}</Text>
            <Pressable style={styles.featuredButton} onPress={startQuiz}>
              <Text style={styles.featuredButtonText}>Play now</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.listSectionHeader}>
          <Text style={styles.listSectionTitle}>Recommended courses</Text>
          <Pressable onPress={() => setScreen('discover')}>
            <Text style={styles.listSectionAction}>See all</Text>
          </Pressable>
        </View>

        {questionSets.map((set) => (
          <Pressable
            key={set.id}
            style={[styles.courseCard, { backgroundColor: set.accent }]}
            onPress={() => setScreen('quiz')}
          >
            <ArtBlock tone={set.artTone} variant="card" />
            <View style={styles.courseBody}>
              <Text style={styles.courseTopic}>{set.topic}</Text>
              <Text style={styles.courseTitle}>{set.title}</Text>
              <Text style={styles.courseSubtitle}>{set.subtitle}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(set.progress * 100)}%` }]} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {renderBottomNav()}
    </SafeAreaView>
  );

  const renderDiscover = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.appContent}>
        <ScreenHeader
          title="Question Sets"
          subtitle="Search and filter bite-sized quizzes by topic."
        />
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
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
          <Pressable key={set.id} style={styles.discoveryCard} onPress={startQuiz}>
            <ArtBlock tone={set.artTone} variant="card" />
            <View style={styles.discoveryBody}>
              <Text style={styles.discoveryTitle}>{set.title}</Text>
              <Text style={styles.discoveryMeta}>{set.topic}</Text>
              <Text style={styles.discoveryText}>{set.subtitle}</Text>
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

  const renderQuiz = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.quizContainer}>
        <View style={styles.quizTopRow}>
          <Pressable
            onPress={() => {
              setScreen('home');
              setActiveTab('home');
            }}
          >
            <Text style={styles.backLabel}>‹ Back</Text>
          </Pressable>
          <Text style={styles.quizMeta}>{currentQuestion.topic}</Text>
          <Text style={styles.quizCounter}>{quizIndex + 1} of {quizQuestions.length}</Text>
        </View>

        <View style={styles.quizCard}>
          <ArtBlock tone={currentQuestion.artTone} variant="quiz" />
          <Text style={styles.quizQuestion}>{currentQuestion.prompt}</Text>

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
                  onPress={() => submitChoice(choice.id)}
                >
                  <Text style={styles.choiceLetter}>{choice.id.toUpperCase()}</Text>
                  <Text style={styles.choiceText}>{choice.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.quizHint}>
            <Text style={styles.quizHintTitle}>Fast feedback</Text>
            <Text style={styles.quizHintText}>{currentQuestion.explanation}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderResult = () => {
    const percent = Math.round((score / quizQuestions.length) * 100);
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
              <Text style={styles.resultMetricValue}>{scoreSummary.answered}</Text>
              <Text style={styles.resultMetricLabel}>Answered</Text>
            </View>
            <View style={styles.resultMetricCard}>
              <Text style={styles.resultMetricValue}>{compare}</Text>
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
            <Pressable style={styles.secondaryButton} onPress={startQuiz}>
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => setScreen('home')}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
        {renderBottomNav()}
      </SafeAreaView>
    );
  };

  const renderProfile = () => (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.appContent}>
        <ScreenHeader title="Profile" subtitle="Your settings and progress in one place." />
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>JD</Text>
          </View>
          <View style={styles.profileHeroText}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@gmail.com</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingSubtitle}>Match your device appearance</Text>
            </View>
            <Switch
              value={themeEnabled}
              onValueChange={(value) => {
                setThemeEnabled(value);
                persistPreferences({
                  themeEnabled: value,
                  hapticsEnabled,
                  notificationOverlay,
                });
              }}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Haptics</Text>
              <Text style={styles.settingSubtitle}>Light feedback on quiz answers</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(value) => {
                setHapticsEnabled(value);
                persistPreferences({
                  themeEnabled,
                  hapticsEnabled: value,
                  notificationOverlay,
                });
              }}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Notification overlay</Text>
              <Text style={styles.settingSubtitle}>Show lock-screen reminders</Text>
            </View>
            <Switch
              value={notificationOverlay}
              onValueChange={(value) => {
                setNotificationOverlay(value);
                persistPreferences({
                  themeEnabled,
                  hapticsEnabled,
                  notificationOverlay: value,
                });
              }}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.profileStatCard}>
              <Text style={styles.profileStatValue}>{item.value}</Text>
              <Text style={styles.profileStatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {renderBottomNav()}
    </SafeAreaView>
  );

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
      registerName={registerName}
      authLoading={authLoading}
      authError={authError}
      onChangeLoginEmail={setLoginEmail}
      onChangeLoginPassword={setLoginPassword}
      onChangeRegisterEmail={(value) => {
        setRegisterEmail(value);
        if (!registerName.trim()) {
          setRegisterName(value.split('@')[0]);
        }
      }}
      onChangeRegisterPassword={setRegisterPassword}
      onChangeRegisterConfirmPassword={setRegisterConfirmPassword}
      onChangeRegisterName={setRegisterName}
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

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return (
          <IntroFlow
            screen={screen}
            activeSlide={activeSlide}
            selectedInterests={selectedInterests}
            interests={interests}
            onSelectInterest={toggleInterest}
            onGoToApp={goToAuthEntry}
            onAdvanceOnboarding={() => moveOnboarding(1)}
            onContinue={continueFromInterests}
            onSetScreen={setScreen}
          />
        );
      case 'onboarding-1':
        return (
          <IntroFlow
            screen={screen}
            activeSlide={0}
            selectedInterests={selectedInterests}
            interests={interests}
            onSelectInterest={toggleInterest}
            onGoToApp={goToAuthEntry}
            onAdvanceOnboarding={() => moveOnboarding(1)}
            onContinue={continueFromInterests}
            onSetScreen={setScreen}
          />
        );
      case 'onboarding-2':
        return (
          <IntroFlow
            screen={screen}
            activeSlide={1}
            selectedInterests={selectedInterests}
            interests={interests}
            onSelectInterest={toggleInterest}
            onGoToApp={goToAuthEntry}
            onAdvanceOnboarding={() => moveOnboarding(1)}
            onContinue={continueFromInterests}
            onSetScreen={setScreen}
          />
        );
      case 'onboarding-3':
        return (
          <IntroFlow
            screen={screen}
            activeSlide={2}
            selectedInterests={selectedInterests}
            interests={interests}
            onSelectInterest={toggleInterest}
            onGoToApp={goToAuthEntry}
            onAdvanceOnboarding={() => setScreen('interests')}
            onContinue={continueFromInterests}
            onSetScreen={setScreen}
          />
        );
      case 'interests':
        return (
          <IntroFlow
            screen={screen}
            activeSlide={activeSlide}
            selectedInterests={selectedInterests}
            interests={interests}
            onSelectInterest={toggleInterest}
            onGoToApp={goToAuthEntry}
            onAdvanceOnboarding={() => moveOnboarding(1)}
            onContinue={continueFromInterests}
            onSetScreen={setScreen}
          />
        );
      case 'auth-select':
        return renderAuthFlowScreen('auth-select', 'interests');
      case 'login-method':
        return renderAuthFlowScreen('login-method', 'auth-select');
      case 'register':
        return renderAuthFlowScreen('register', 'auth-select');
      case 'login':
        return renderAuthFlowScreen('login', 'login-method');
      case 'auth-success':
        return renderAuthFlowScreen('auth-success', 'auth-select');
      case 'home':
      case 'discover':
      case 'quiz':
      case 'result':
      case 'profile':
        return (
          <MainFlow
            screen={screen}
            registerName={registerName}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setScreen(tab);
            }}
            onOpenDiscover={() => {
              setActiveTab('discover');
              setScreen('discover');
            }}
            onStartQuiz={startQuiz}
            onBackToHome={() => {
              setScreen('home');
              setActiveTab('home');
            }}
            questionSets={questionSets}
            quizQuestions={quizQuestions}
            filterChips={filterChips}
            stats={stats}
            quizIndex={quizIndex}
            selectedChoice={selectedChoice}
            scoreSummary={scoreSummary}
            currentQuestion={currentQuestion}
            selectedInterest={selectedInterest}
            themeEnabled={themeEnabled}
            hapticsEnabled={hapticsEnabled}
            notificationOverlay={notificationOverlay}
            onSelectChoice={submitChoice}
            onRetryQuiz={startQuiz}
            onContinueHome={() => {
              setScreen('home');
              setActiveTab('home');
            }}
            onUpdateTheme={(value) => {
              setThemeEnabled(value);
              persistPreferences({
                themeEnabled: value,
                hapticsEnabled,
                notificationOverlay,
              });
            }}
            onUpdateHaptics={(value) => {
              setHapticsEnabled(value);
              persistPreferences({
                themeEnabled,
                hapticsEnabled: value,
                notificationOverlay,
              });
            }}
            onUpdateNotificationOverlay={(value) => {
              setNotificationOverlay(value);
              persistPreferences({
                themeEnabled,
                hapticsEnabled,
                notificationOverlay: value,
              });
            }}
          />
        );
      default:
        return (
          <MainFlow
            screen="home"
            registerName={registerName}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setScreen(tab);
            }}
            onOpenDiscover={() => {
              setActiveTab('discover');
              setScreen('discover');
            }}
            onStartQuiz={startQuiz}
            onBackToHome={() => {
              setScreen('home');
              setActiveTab('home');
            }}
            questionSets={questionSets}
            quizQuestions={quizQuestions}
            filterChips={filterChips}
            stats={stats}
            quizIndex={quizIndex}
            selectedChoice={selectedChoice}
            scoreSummary={scoreSummary}
            currentQuestion={currentQuestion}
            selectedInterest={selectedInterest}
            themeEnabled={themeEnabled}
            hapticsEnabled={hapticsEnabled}
            notificationOverlay={notificationOverlay}
            onSelectChoice={submitChoice}
            onRetryQuiz={startQuiz}
            onContinueHome={() => {
              setScreen('home');
              setActiveTab('home');
            }}
            onUpdateTheme={(value) => {
              setThemeEnabled(value);
              persistPreferences({
                themeEnabled: value,
                hapticsEnabled,
                notificationOverlay,
              });
            }}
            onUpdateHaptics={(value) => {
              setHapticsEnabled(value);
              persistPreferences({
                themeEnabled,
                hapticsEnabled: value,
                notificationOverlay,
              });
            }}
            onUpdateNotificationOverlay={(value) => {
              setNotificationOverlay(value);
              persistPreferences({
                themeEnabled,
                hapticsEnabled,
                notificationOverlay: value,
              });
            }}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <ExpoStatusBar style="dark" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f5ef',
  },
  page: {
    flex: 1,
    backgroundColor: '#f4f5ef',
  },
  splashScreen: {
    flex: 1,
    backgroundColor: '#2ea24f',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  splashGlowTop: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -40,
    right: -80,
  },
  splashGlowBottom: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -90,
    left: -100,
  },
  splashCenter: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  splashLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  splashLinkText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  splashLinkArrow: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  onboardingContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  heroMark: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    width: 140,
    height: 140,
  },
  dotRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 28,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#c0c7ba',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#0f2147',
  },
  onboardingTitle: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    color: '#162033',
  },
  onboardingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 28,
  },
  onboardingLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  onboardingLinkText: {
    color: '#24324a',
    fontWeight: '600',
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  interestContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerBlock: {
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 26,
    color: '#162033',
    fontWeight: '800',
    lineHeight: 32,
  },
  sectionSubtitle: {
    marginTop: 8,
    color: '#546274',
    lineHeight: 22,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  interestChip: {
    width: '48%',
    marginHorizontal: '1%',
    backgroundColor: '#eef2d4',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  interestChipActive: {
    backgroundColor: '#0f2147',
  },
  interestChipText: {
    color: '#31404f',
    fontWeight: '700',
    textAlign: 'center',
  },
  interestChipTextActive: {
    color: '#ffffff',
  },
  noteCard: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e1e6d9',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132033',
    marginBottom: 8,
  },
  noteText: {
    color: '#5a6777',
    lineHeight: 22,
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  authBadge: {
    alignItems: 'center',
    marginBottom: 18,
  },
  authIcon: {
    width: 120,
    height: 120,
  },
  authTitle: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '900',
    color: '#132033',
  },
  authText: {
    textAlign: 'center',
    color: '#546274',
    marginTop: 10,
    marginBottom: 22,
    lineHeight: 22,
  },
  authButtonStack: {
    gap: 10,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#282828',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#1b2740',
    fontWeight: '700',
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  linkText: {
    color: '#546274',
    marginRight: 6,
  },
  linkAction: {
    color: '#0f2147',
    fontWeight: '800',
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  backLabel: {
    color: '#19263a',
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '700',
  },
  formTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: '#132033',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b5bdd5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
    color: '#132033',
  },
  legalText: {
    marginTop: 18,
    fontSize: 12,
    color: '#556270',
    lineHeight: 18,
    textAlign: 'center',
  },
  secondaryLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: '#0f2147',
    fontWeight: '800',
  },
  successScreen: {
    flex: 1,
    backgroundColor: '#2ea24f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successCheck: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  successButton: {
    marginTop: 22,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  successButtonText: {
    color: '#0f2147',
    fontWeight: '900',
  },
  appContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  subtleLabel: {
    color: '#62707f',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: '700',
  },
  bigValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#132033',
  },
  avatarBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0f2147',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBubbleText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e5d8',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#132033',
  },
  statLabel: {
    marginTop: 6,
    color: '#5a6777',
    fontSize: 12,
  },
  featuredCard: {
    marginBottom: 20,
  },
  featuredContent: {
    marginTop: -176,
    minHeight: 230,
    borderRadius: 28,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredTag: {
    color: '#f7f6cf',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  featuredTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  featuredText: {
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 21,
    marginBottom: 16,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  featuredButtonText: {
    color: '#0f2147',
    fontWeight: '900',
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listSectionTitle: {
    color: '#132033',
    fontSize: 18,
    fontWeight: '900',
  },
  listSectionAction: {
    color: '#0f2147',
    fontWeight: '800',
  },
  courseCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
  },
  courseBody: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 12,
  },
  courseTopic: {
    color: '#5a6777',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  courseTitle: {
    color: '#132033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 3,
  },
  courseSubtitle: {
    color: '#4f5d6d',
    lineHeight: 19,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15,33,71,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0f2147',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dde3d5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 18,
    color: '#52606d',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#132033',
    fontSize: 15,
  },
  filterDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#2ea24f',
  },
  chipRow: {
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#eef2d4',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  filterChipText: {
    color: '#31404f',
    fontWeight: '800',
  },
  discoveryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e6db',
  },
  discoveryBody: {
    flex: 1,
    padding: 14,
  },
  discoveryTitle: {
    color: '#132033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  discoveryMeta: {
    color: '#5d6a77',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    fontWeight: '700',
  },
  discoveryText: {
    color: '#4f5d6d',
    lineHeight: 19,
    marginBottom: 10,
  },
  discoveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoveryProgress: {
    color: '#2e6a4c',
    fontWeight: '800',
  },
  discoveryAction: {
    color: '#0f2147',
    fontWeight: '900',
  },
  quizContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  quizTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizMeta: {
    color: '#556270',
    fontWeight: '700',
  },
  quizCounter: {
    color: '#0f2147',
    fontWeight: '900',
  },
  quizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e5d8',
  },
  quizQuestion: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '900',
    color: '#132033',
    marginBottom: 16,
  },
  choiceStack: {
    gap: 10,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cfd6e0',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: '#fdfefe',
  },
  choiceCorrect: {
    backgroundColor: '#d3f3d8',
    borderColor: '#7ac88a',
  },
  choiceWrong: {
    backgroundColor: '#ffdada',
    borderColor: '#e57b7b',
  },
  choiceLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f2147',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '900',
    marginRight: 12,
    overflow: 'hidden',
  },
  choiceText: {
    flex: 1,
    color: '#132033',
    fontWeight: '700',
  },
  quizHint: {
    backgroundColor: '#f7f0c8',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  quizHintTitle: {
    color: '#0f2147',
    fontWeight: '900',
    marginBottom: 6,
  },
  quizHintText: {
    color: '#425167',
    lineHeight: 20,
  },
  resultContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#132033',
  },
  resultTopic: {
    marginTop: 4,
    color: '#5a6777',
  },
  resultRing: {
    alignSelf: 'center',
    width: 190,
    height: 190,
    borderRadius: 190,
    backgroundColor: '#ffffff',
    borderWidth: 12,
    borderColor: '#2ea24f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultPercent: {
    fontSize: 42,
    fontWeight: '900',
    color: '#132033',
  },
  resultLabel: {
    color: '#5a6777',
    marginTop: 4,
    fontWeight: '700',
  },
  resultGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  resultMetricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e5d8',
  },
  resultMetricValue: {
    color: '#132033',
    fontWeight: '900',
    fontSize: 18,
  },
  resultMetricLabel: {
    color: '#5a6777',
    marginTop: 6,
    lineHeight: 18,
  },
  feedbackCard: {
    backgroundColor: '#d8f1db',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f2147',
    marginBottom: 6,
  },
  feedbackText: {
    color: '#2d4b38',
    lineHeight: 21,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0f2147',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#0f2147',
    fontWeight: '900',
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e0e5d8',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2ea24f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  profileHeroText: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#132033',
  },
  profileEmail: {
    color: '#5a6777',
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e5d8',
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    color: '#132033',
    fontWeight: '900',
    fontSize: 15,
  },
  settingSubtitle: {
    color: '#5a6777',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: '#eef2d4',
    borderRadius: 18,
    padding: 14,
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#132033',
  },
  profileStatLabel: {
    marginTop: 6,
    color: '#556270',
    fontSize: 12,
  },
  artBlock: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artBlock_wide: {
    minHeight: 230,
    borderRadius: 28,
  },
  artBlock_square: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  artBlock_quiz: {
    width: '100%',
    height: 180,
    borderRadius: 22,
    marginBottom: 18,
  },
  artRingLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    borderWidth: 16,
    borderColor: 'rgba(255,255,255,0.24)',
    top: 8,
    right: -20,
  },
  artRingSmall: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 96,
    borderWidth: 12,
    borderColor: 'rgba(255,255,255,0.28)',
    bottom: 10,
    left: 14,
  },
  artIcon: {
    width: 68,
    height: 68,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e6db',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  navPillActive: {
    backgroundColor: '#0f2147',
  },
  navLabel: {
    color: '#5a6777',
    fontWeight: '700',
    fontSize: 12,
  },
  navLabelActive: {
    color: '#ffffff',
  },
  quizTextRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quizScoreText: {
    color: '#132033',
    fontWeight: '900',
  },
});
