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
};

type IntroFlowProps = {
  screen: ScreenKey;
  activeSlide: number;
  onGoToApp: () => void;
  onAdvanceOnboarding: () => void;
};

export function IntroFlow({
  screen,
  activeSlide,
  onGoToApp,
  onAdvanceOnboarding,
}: IntroFlowProps) {
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

  const renderOutlineButton = (label: string, onPress: () => void, withIcon = false) => (
    <Pressable
      style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.outlineButtonText}>{label}</Text>
      {withIcon ? <Feather name="chevron-right" size={22} color={palette.blackSoft} /> : null}
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

  const slide = onboardingSlides[activeSlide] ?? onboardingSlides[0];
  const finalSlide = activeSlide === onboardingSlides.length - 1;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.onboardingContainer}>
        {renderLogo('onboarding')}
        {renderDots()}
        <Text style={styles.onboardingTitle}>{slide.title}</Text>
        <Text style={styles.onboardingText}>{slide.description}</Text>
        <View style={styles.onboardingActions}>
          {renderOutlineButton('Skip', onGoToApp)}
          {renderOutlineButton(finalSlide ? 'Get started' : 'Next', onAdvanceOnboarding, true)}
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
    width: '86%',
    maxWidth: 344,
  },
  splashElephant: {
    width: 288,
    maxWidth: '84%',
    height: 207,
  },
  splashWordmark: {
    width: 343,
    maxWidth: '100%',
    height: 229,
    marginTop: -50,
  },
  splashLoader: {
    marginTop: 18,
  },
  onboardingContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 29,
    paddingTop: 64,
    paddingBottom: 31,
  },
  onboardingLogo: {
    alignItems: 'center',
    width: 236,
    maxWidth: '80%',
    minHeight: 214,
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
    marginTop: 6,
    marginBottom: 34,
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
    width: '100%',
    maxWidth: 321,
    color: palette.black,
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '400',
    textAlign: 'center',
  },
  onboardingText: {
    width: '100%',
    maxWidth: 321,
    marginTop: 16,
    color: palette.black,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
  onboardingActions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 42,
  },
  outlineButton: {
    minWidth: 100,
    minHeight: 49,
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
  outlineButtonText: {
    color: palette.blackSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
