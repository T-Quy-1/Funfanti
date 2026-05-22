import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function PrimaryButton({ 
  label, 
  onPress, 
  variant = 'primary',
  size = 'md'
}: PrimaryButtonProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        styles[size],
        pressed && styles.pressed
      ]} 
      onPress={onPress}
    >
      <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 0,
  },
  primary: {
    backgroundColor: colors.brand,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  secondary: {
    backgroundColor: colors.brandGreenSoft,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  sm: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  md: {},
  text: {
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  text_primary: {
    color: colors.surface,
    fontSize: 16,
  },
  text_secondary: {
    color: colors.brand,
    fontSize: 16,
  },
  text_outline: {
    color: colors.brand,
    fontSize: 16,
  },
  text_sm: {
    fontSize: 14,
  },
  text_lg: {
    fontSize: 17,
    fontWeight: '600',
  },
  text_md: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
