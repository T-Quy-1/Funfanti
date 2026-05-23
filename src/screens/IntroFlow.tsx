import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { onboardingSlides } from '../data/funfantiContent';
import { colors } from '../theme/colors';
import type { ScreenKey } from '../data/funfantiContent';

const logoElephant = require('../../assets/funfanti-elephant.png');
const logoWordmark = require('../../assets/funfanti-wordmark.png');

const palette = {
  primary: '#269D54',
  black: '#020202',
  blackSoft: '#161616',
  white: '#FFFFFF',
  selected: '#D3F1D9',
  chip: '#EEF4C2',
};

type IntroFlowProps = {
  screen: ScreenKey;
  activeSlide: number;
  selectedInterests: string[];
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
  selectedInterests,
  interests,
  onSelectInterest,
  onGoToApp,
  onAdvanceOnboarding,
  onContinue,
}: IntroFlowProps) {
  const minimumInterestCount = 3;
  const selectedInterestCount = selectedInterests.length;
  const hasEnoughInterests = selectedInterestCount >= minimumInterestCount;
  const remainingInterestCount = Math.max(minimumInterestCount - selectedInterestCount, 0);

  const renderLogo = (variant: 'splash' | 'onboarding' = 'onboarding') => (
    <View style={variant === 'splash' ? styles.splashLogo : styles.onboardingLogo}>
      <Image
        source={logoElephant}
        style={variant === 'splash' ? styles.splashElephant : styles.onboardingElephant}
        resizeMode="contain"
      />
      <Image
        source={logoWordmark}
        style={variant === 'splash' ? styles.splashWordmark : styles.onboardingWordmark}
        resizeMode="contain"
      />
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotRow}>
      {onboardingSlides.map((item, index) => (
        <View key={item.key} style={[styles.dot, index === activeSlide && styles.dotActive]} />
      ))}
    </View>
  );

  if (screen === 'splash') {
    return (
      <Pressable style={styles.splashScreen} onPress={onGoToApp}>
        {renderLogo('splash')}
        <ActivityIndicator color="rgba(255,255,255,0.75)" size="large" style={styles.splashLoader} />
      </Pressable>
    );
  }

  if (screen === 'interests') {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.interestContainer}>
          <Text style={styles.interestTitle}>What interests you?</Text>
          <Text style={styles.interestSubtitle}>
            Pick at least 3 topics to get started. You can always change these or create your own later.
          </Text>
          <Text style={[styles.interestRequirement, hasEnoughInterests && styles.interestRequirementReady]}>
            {hasEnoughInterests ? `${selectedInterestCount} selected` : `Pick ${remainingInterestCount} more`}
          </Text>

          <View style={styles.interestList}>
            {interests.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.interestChip,
                    { backgroundColor: active ? '#4F46E5' : '#F3F4F6' },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onSelectInterest(interest)}
                >
                  <Text style={[styles.interestChipText, active && styles.interestChipTextActive]}>
                    {interest}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.interestActionRow}>
            <Pressable
              accessibilityState={{ disabled: !hasEnoughInterests }}
              disabled={!hasEnoughInterests}
              style={({ pressed }) => [
                styles.primaryButton,
                !hasEnoughInterests && styles.primaryButtonDisabled,
                pressed && hasEnoughInterests && styles.pressed,
              ]}
              onPress={onContinue}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  const slide = onboardingSlides[activeSlide] ?? onboardingSlides[0];

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.onboardingContainer}>
        {renderLogo('onboarding')}
        {renderDots()}
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
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.white,
  },
  splashScreen: {
    flex: 1,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    alignItems: 'center',
    width: 344,
    height: 382,
    marginTop: 88,
  },
  splashElephant: {
    width: 288,
    height: 207,
  },
  splashWordmark: {
    width: 343,
    height: 229,
    marginTop: -50,
  },
  splashLoader: {
    marginTop: 0,
  },
  onboardingContainer: {
    minHeight: 852,
    alignItems: 'center',
    paddingHorizontal: 29,
    paddingTop: 142,
    paddingBottom: 31,
  },
  onboardingLogo: {
    alignItems: 'center',
    width: 236,
    height: 263,
  },
  onboardingElephant: {
    width: 197,
    height: 141,
  },
  onboardingWordmark: {
    width: 233,
    height: 155,
    marginTop: -35,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 0,
    marginBottom: 45,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: palette.black,
    backgroundColor: palette.white,
  },
  dotActive: {
    backgroundColor: palette.black,
  },
  onboardingTitle: {
    width: 321,
    color: palette.black,
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '400',
    textAlign: 'center',
  },
  onboardingActions: {
    position: 'absolute',
    left: 29,
    right: 29,
    bottom: 31,
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
    flex: 1,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
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
  interestTitle: {
    color: palette.black,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '400',
    textAlign: 'center',
  },
  interestSubtitle: {
    alignSelf: 'center',
    width: 321,
    marginTop: 8,
    color: palette.black,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  interestRequirement: {
    marginTop: 10,
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  interestRequirementReady: {
    color: palette.primary,
  },
  interestList: {
    gap: 13,
    marginTop: 19,
  },
  interestActionRow: {
    alignItems: 'flex-end',
    marginTop: 21,
  },
  pressed: {
    opacity: 0.72,
  },
});
