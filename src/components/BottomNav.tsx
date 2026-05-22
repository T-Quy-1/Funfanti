import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type BottomNavProps = {
  activeTab: 'home' | 'discover' | 'quiz' | 'profile';
  onSelect: (tab: 'home' | 'discover' | 'quiz' | 'profile') => void;
};

const navItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'discover', label: 'Explore', icon: 'search' },
  { key: 'quiz', label: 'Quiz', icon: 'help-circle' },
  { key: 'profile', label: 'Profile', icon: 'user' },
] as const;

export function BottomNav({ activeTab, onSelect }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
              onPress={() => onSelect(item.key)}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Feather
                  name={item.icon}
                  size={18}
                  color={active ? colors.brand : '#9CA3AF'}
                />
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
              <View style={[styles.activeDot, active ? styles.activeDotActive : styles.activeDotInactive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    shadowOpacity: 0,
    elevation: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navItemPressed: {
    opacity: 0.8,
  },
  iconWrap: {
    transform: [{ scale: 1 }],
  },
  iconWrapActive: {
    transform: [{ scale: 1.08 }],
  },
  navLabel: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  navLabelActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand,
    opacity: 0,
  },
  activeDotActive: {
    opacity: 1,
  },
  activeDotInactive: {
    opacity: 0,
  },
});
