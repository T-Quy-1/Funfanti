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
  { key: 'quiz', label: 'My Course', icon: 'book-open' },
  { key: 'discover', label: 'Question Sets', icon: 'help-circle' },
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
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => onSelect(item.key)}
            >
              <Feather
                name={item.icon}
                size={active ? 27 : 24}
                color={active ? colors.brand : colors.surface}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.brand,
    borderTopWidth: 0,
    borderRadius: 360,
    height: 76,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowOpacity: 0,
    elevation: 0,
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    height: 60,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  navItemActive: {
    flex: 1.46,
    backgroundColor: colors.surface,
  },
  navItemPressed: {
    opacity: 0.8,
  },
  navLabel: {
    color: colors.surface,
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0,
  },
  navLabelActive: {
    color: colors.brand,
    fontWeight: '500',
  },
});
