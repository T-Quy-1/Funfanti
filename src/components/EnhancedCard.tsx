import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

interface EnhancedCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  gradientColors?: string[];
  backgroundColor?: string;
  toneIndex?: number;
  isFeatured?: boolean;
  accentColor?: string;
  imageUrl?: string;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function EnhancedCard({
  title,
  subtitle,
  description,
  gradientColors,
  backgroundColor,
  toneIndex = 0,
  isFeatured = false,
  accentColor = colors.brandGreen,
  imageUrl,
  badge,
  badgeColor = colors.brandGreen,
  onPress,
  children,
  style,
  size = 'md',
  variant = 'elevated',
}: EnhancedCardProps) {
  const paddingMap = {
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.xl,
  };

  const borderRadiusSize = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  const pastelPalette = ['#ECFDF5', '#F5F3FF', '#FFF7ED', '#F0F9FF'];
  const resolvedBackground = isFeatured
    ? colors.brand
    : backgroundColor ?? pastelPalette[toneIndex % pastelPalette.length];
  const resolvedTextColor = isFeatured ? '#FFFFFF' : '#111827';
  const resolvedMutedColor = isFeatured ? 'rgba(255,255,255,0.8)' : '#9CA3AF';
  const resolvedGradient = gradientColors ?? (isFeatured ? ['#4F46E5', '#22D3EE'] : undefined);

  const containerStyle = {
    padding: paddingMap[size],
    borderRadius: borderRadiusSize[size],
    backgroundColor: resolvedBackground,
    ...(variant === 'outlined' && {
      borderWidth: 0,
    }),
    shadowOpacity: 0,
    elevation: 0,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[containerStyle, style]}
    >
      {resolvedGradient ? (
        <LinearGradient
          colors={resolvedGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientOverlay, { borderRadius: borderRadiusSize[size] }]}
        />
      ) : null}

      {/* Image background if provided */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.cardImage,
            { borderRadius: borderRadiusSize[size] }
          ]}
        />
      )}

      {/* Badge */}
      {badge && (
        <View style={[
          styles.badge,
          { backgroundColor: badgeColor }
        ]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: resolvedTextColor }]} numberOfLines={2}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, { color: resolvedMutedColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text style={[styles.description, { color: resolvedMutedColor }]} numberOfLines={3}>
            {description}
          </Text>
        )}
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: colors.surfaceAlt,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface,
    letterSpacing: 0.3,
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
