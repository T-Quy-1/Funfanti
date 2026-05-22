import { Image, Platform, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

const funfantiLogoAsset = require('../../funfanti.svg');

type FunfantiLogoProps = {
  size?: number;
};

export function FunfantiLogo({ size = 48 }: FunfantiLogoProps) {
  if (Platform.OS === 'web') {
    return (
      <Image
        source={funfantiLogoAsset}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
    );
  }

  const resolvedSource = Image.resolveAssetSource(funfantiLogoAsset);

  return <SvgUri uri={resolvedSource.uri} width={size} height={size} />;
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});