import { Image, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type ArtBlockProps = {
  tone: string;
  variant: 'hero' | 'card' | 'quiz';
  imageUrl?: string;
};

export function ArtBlock({ tone, variant, imageUrl }: ArtBlockProps) {
  return (
    <View style={[styles.base, styles[variant], { backgroundColor: tone }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
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
  icon: {
    width: 68,
    height: 68,
  },
});
