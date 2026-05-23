import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const primary = '#269D54';
const surface = '#FFFFFF';
export const BOTTOM_NAV_HEIGHT = 76;
export const BOTTOM_NAV_BOTTOM_OFFSET = 20;
export const BOTTOM_NAV_CONTENT_PADDING = 96;

type BottomNavProps = {
  activeTab: 'home' | 'discover' | 'quiz' | 'profile';
  onSelect: (tab: 'home' | 'discover' | 'quiz' | 'profile') => void;
};

const navItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'quiz', label: 'Saved', icon: 'bookmark' },
  { key: 'discover', label: 'Question Sets', icon: 'help-circle' },
  { key: 'profile', label: 'Profile', icon: 'user' },
] as const;

export function BottomNav({ activeTab, onSelect }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.whiteBand} />
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
                size={active ? 26 : 24}
                color={active ? primary : surface}
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
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: BOTTOM_NAV_BOTTOM_OFFSET,
  },
  whiteBand: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: BOTTOM_NAV_BOTTOM_OFFSET + Math.round(BOTTOM_NAV_HEIGHT / 2),
    backgroundColor: surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    zIndex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: primary,
    borderTopWidth: 0,
    borderRadius: 360,
    height: BOTTOM_NAV_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowOpacity: 0,
    elevation: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  navItem: {
    flex: 1,
    height: 58,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navItemActive: {
    flex: 1.36,
    backgroundColor: surface,
  },
  navItemPressed: {
    opacity: 0.8,
  },
  navLabel: {
    color: surface,
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
  },
  navLabelActive: {
    color: primary,
    fontWeight: '600',
  },
});
