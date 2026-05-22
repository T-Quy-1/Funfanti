import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { onboardingSlides } from '../data/funfantiContent';
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
      <Image source={logoElephant} style={variant === 'splash' ? styles.splashElephant : styles.onboardingElephant} resizeMode="contain" />
      <Image source={logoWordmark} style={variant === 'splash' ? styles.splashWordmark : styles.onboardingWordmark} resizeMode="contain" />
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotRow}>
      {onboardingSlides.map((item, index) => (
        <View key={item.key} style={[styles.dot, index === activeSlide && styles.dotActive]} />
      ))}
    </View>
  );

  const renderOutlineButton = (label: string, onPress: () => void, withIcon = false, disabled = false) => (
    <Pressable
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outlineButton,
        disabled && styles.outlineButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.outlineButtonText, disabled && styles.outlineButtonTextDisabled]}>{label}</Text>
      {withIcon ? <Feather name="chevron-right" size={22} color={disabled ? '#8A8A8A' : palette.blackSoft} /> : null}
    </Pressable>
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
                    styles.interestCard,
                    { backgroundColor: active ? palette.selected : palette.chip },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onSelectInterest(interest)}
                >
                  <Text style={styles.interestCardText}>{interest}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.interestActionRow}>
            {renderOutlineButton('Next', onContinue, true, !hasEnoughInterests)}
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
        <Text style={styles.onboardingText}>{slide.description}</Text>
        <View style={styles.onboardingActions}>
          {renderOutlineButton('Skip', onGoToApp)}
          {renderOutlineButton(activeSlide === onboardingSlides.length - 1 ? 'Next' : 'Next', onAdvanceOnboarding, true)}
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
  onboardingText: {
    width: 321,
    marginTop: 16,
    color: palette.black,
    fontSize: 18,
    lineHeight: 27,
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
  },
  outlineButton: {
    minWidth: 100,
    height: 49,
    borderWidth: 1,
    borderColor: palette.blackSoft,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 16,
    paddingRight: 8,
  },
  outlineButtonDisabled: {
    borderColor: '#C7C7C7',
    backgroundColor: '#F4F4F4',
  },
  outlineButtonText: {
    color: palette.blackSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  outlineButtonTextDisabled: {
    color: '#8A8A8A',
  },
  interestContainer: {
    minHeight: 852,
    paddingTop: 93,
    paddingHorizontal: 15,
    paddingBottom: 31,
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
  interestCard: {
    height: 56,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  interestCardText: {
    color: palette.blackSoft,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  interestActionRow: {
    alignItems: 'flex-end',
    marginTop: 21,
  },
  pressed: {
    opacity: 0.72,
  },
});
