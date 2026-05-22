import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArtBlock } from '../components/ArtBlock';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { onboardingSlides } from '../data/funfantiContent';
import type { ScreenKey } from '../data/funfantiContent';

type IntroFlowProps = {
  screen: ScreenKey;
  activeSlide: number;
  selectedInterest: string;
  interests: string[];
  onSelectInterest: (interest: string) => void;
  onGoToApp: () => void;
  onAdvanceOnboarding: () => void;
  onContinue: () => void;
  onSetScreen: (screen: ScreenKey) => void;
};

export function IntroFlow({
  screen,
  activeSlide,
  selectedInterest,
  interests,
  onSelectInterest,
  onGoToApp,
  onAdvanceOnboarding,
  onContinue,
  onSetScreen,
}: IntroFlowProps) {
  if (screen === 'splash') {
    return (
      <View style={styles.splashScreen}>
        <View style={styles.splashGlowTop} />
        <View style={styles.splashGlowBottom} />
        <View style={styles.splashCenter}>
          <ArtBlock tone={colors.brandGreen} variant="hero" />
          <Text style={styles.splashWordmark}>Funfanti</Text>
          <Pressable style={styles.splashLink} onPress={onGoToApp}>
            <Text style={styles.splashLinkText}>Enter app</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (screen === 'interests') {
    return (
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
                  onPress={() => onSelectInterest(interest)}
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
          <PrimaryButton label="Continue" onPress={onContinue} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const slide = onboardingSlides[activeSlide];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.onboardingContainer}>
        <View style={styles.heroMark}>
          <ArtBlock tone={colors.brandGreenSoft} variant="hero" />
        </View>
        <View style={styles.dotRow}>
          {onboardingSlides.map((item, index) => (
            <View key={item.key} style={[styles.dot, index === activeSlide && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.onboardingTitle}>{slide.title}</Text>
        <View style={styles.onboardingActions}>
          <Pressable
            style={styles.linkButton}
            onPress={onGoToApp}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.linkButtonText}>Skip</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onAdvanceOnboarding}>
            <Text style={styles.primaryButtonText}>
              {activeSlide === onboardingSlides.length - 1 ? 'Get started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splashScreen: {
    flex: 1,
    backgroundColor: colors.brandGreen,
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
  },
  splashWordmark: {
    color: '#fffbe7',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 16,
  },
  splashLink: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  splashLinkText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
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
    backgroundColor: colors.brand,
  },
  onboardingTitle: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 42,
    fontWeight: '600',
    color: '#111827',
  },
  onboardingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  linkButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    minHeight: 42,
  },
  linkButtonText: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  interestContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    flexGrow: 1,
    flexBasis: 'auto',
    alignSelf: 'flex-start',
  },
  interestChipActive: {
    backgroundColor: '#4F46E5',
  },
  interestChipText: {
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'left',
  },
  interestChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noteCard: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 0,
    marginBottom: 18,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  noteText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
  },
});
