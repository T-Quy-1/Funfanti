import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { FunfantiLogo } from './FunfantiLogo';

const localAssetMap: Record<string, number> = {
  splash: require('../../assets/splash-icon.png'),
  icon: require('../../assets/icon.png'),
  adaptive: require('../../assets/adaptive-icon.png'),
};

type ArtBlockProps = {
  tone: string;
  variant: 'hero' | 'card' | 'quiz';
  imageUrl?: string;
  showLogo?: boolean;
};

export function ArtBlock({ tone, variant, imageUrl, showLogo = true }: ArtBlockProps) {
  const logoSize = variant === 'hero' ? 64 : 40;
  const fallbackAsset = localAssetMap.splash;
  const localAsset = imageUrl ? localAssetMap[imageUrl] : undefined;
  const remoteAsset = imageUrl && /^https?:\/\//.test(imageUrl) ? { uri: imageUrl } : undefined;
  const resolvedSource = localAsset ?? remoteAsset ?? fallbackAsset;

  return (
    <View style={[styles.base, styles[variant], { backgroundColor: tone }]}>
      {resolvedSource ? (
        <Image source={resolvedSource} style={styles.image} resizeMode="cover" />
      ) : null}
      <View style={styles.gradientOverlay} />
      {showLogo ? (
        <View style={[StyleSheet.absoluteFillObject, styles.logoOverlay]}>
          <FunfantiLogo size={logoSize} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  hero: {
    aspectRatio: 16 / 10,
    minHeight: 220,
    borderRadius: 28,
  },
  card: {
    width: 88,
    aspectRatio: 1,
    borderRadius: 20,
  },
  quiz: {
    width: '100%',
    aspectRatio: 16 / 10,
    minHeight: 200,
    borderRadius: 24,
    marginBottom: 20,
  },
  logoOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 68,
    height: 68,
  },
});
