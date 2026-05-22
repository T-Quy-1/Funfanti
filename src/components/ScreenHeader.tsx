import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { LogoBrand } from './LogoBrand';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBrand?: boolean;
};

export function ScreenHeader({ title, subtitle, showBrand = true }: ScreenHeaderProps) {
  return (
    <View style={styles.headerBlock}>
      {showBrand && (
        <View style={styles.brandRow}>
          <LogoBrand size="sm" showName={false} showTagline={false} />
        </View>
      )}
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 28,
    color: '#111827',
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    marginTop: spacing.md,
    color: '#9CA3AF',
    lineHeight: 18,
    fontSize: 12,
    fontWeight: '400',
  },
});
