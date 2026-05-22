import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName?: React.ComponentProps<typeof Feather>['name'];
  gradient?: string;
  backgroundColor?: string;
  toneIndex?: number;
  isFeatured?: boolean;
  textColor?: string;
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({
  title,
  value,
  unit,
  iconName = 'bar-chart-2',
  gradient,
  backgroundColor,
  toneIndex = 0,
  isFeatured = false,
  textColor = colors.text,
  accentColor = colors.brandGreen,
  trend,
  trendValue,
}: StatCardProps) {
  const pastelPalette = ['#ECFDF5', '#F5F3FF', '#FFF7ED', '#F0F9FF'];
  const resolvedBackground = isFeatured
    ? colors.brand
    : backgroundColor ?? pastelPalette[toneIndex % pastelPalette.length];
  const resolvedTextColor = isFeatured ? '#FFFFFF' : textColor;
  const resolvedAccentColor = isFeatured ? '#FFFFFF' : accentColor;
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getTrendSymbol = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <View style={[
      styles.card,
      { backgroundColor: resolvedBackground },
    ]}>
      {/* Icon and title area */}
      <View style={styles.header}>
        <View style={[styles.iconBubble, { backgroundColor: isFeatured ? 'rgba(255,255,255,0.2)' : `${accentColor}1A` }]}>
          <Feather name={iconName} size={16} color={resolvedAccentColor} />
        </View>
        <Text style={[styles.title, { color: isFeatured ? 'rgba(255,255,255,0.85)' : '#9CA3AF' }]}>
          {title}
        </Text>
      </View>

      {/* Value area */}
      <View style={styles.valueContainer}>
        <View style={styles.mainValue}>
          <Text style={[styles.value, { color: resolvedTextColor }]}>
            {value}
          </Text>
          {unit && (
            <Text style={[styles.unit, { color: isFeatured ? 'rgba(255,255,255,0.8)' : '#9CA3AF' }]}>
              {unit}
            </Text>
          )}
        </View>

        {/* Trend badge */}
        {trend && trendValue && (
          <View style={styles.trendBadge}>
            <Text style={[styles.trendSymbol, { color: isFeatured ? '#FFFFFF' : getTrendColor() }]}>
              {getTrendSymbol()}
            </Text>
            <Text style={[styles.trendValue, { color: isFeatured ? '#FFFFFF' : getTrendColor() }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 24,
    shadowOpacity: 0,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mainValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 0,
    gap: 4,
  },
  trendSymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '500',
  },
});
