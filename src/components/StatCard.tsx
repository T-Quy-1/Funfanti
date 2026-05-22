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
  backgroundColor = colors.surface,
  textColor = colors.text,
  accentColor = colors.brandGreen,
  trend,
  trendValue,
}: StatCardProps) {
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
      { backgroundColor },
    ]}>
      {/* Icon and title area */}
      <View style={styles.header}>
        <View style={[styles.iconBubble, { backgroundColor: `${accentColor}1A` }]}>
          <Feather name={iconName} size={16} color={accentColor} />
        </View>
        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
      </View>

      {/* Value area */}
      <View style={styles.valueContainer}>
        <View style={styles.mainValue}>
          <Text style={[styles.value, { color: accentColor }]}>
            {value}
          </Text>
          {unit && (
            <Text style={[styles.unit, { color: textColor }]}>
              {unit}
            </Text>
          )}
        </View>

        {/* Trend badge */}
        {trend && trendValue && (
          <View style={[
            styles.trendBadge,
            { borderColor: getTrendColor() }
          ]}>
            <Text style={[styles.trendSymbol, { color: getTrendColor() }]}>
              {getTrendSymbol()}
            </Text>
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
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
    borderRadius: borderRadius.lg,
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
