import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile' | 'availability';

interface NavBarItem {
  name: NavName;
  label: string;
  icon: string;
  type?: 'ionicons' | 'material';
}

interface BottomNavBarProps {
  activeScreen: NavName;
  onNavigate: (screen: NavName) => void;
  badges?: Partial<Record<NavName, number>>;
}

const NAV_ITEMS: NavBarItem[] = [
  { name: 'home', label: 'Home', icon: 'home', type: 'ionicons' },
  { name: 'explore', label: 'Ontdekken', icon: 'map-marker', type: 'material' },
  { name: 'appointments', label: 'Afspraken', icon: 'calendar', type: 'ionicons' },
  { name: 'messages', label: 'Berichten', icon: 'chatbubble', type: 'ionicons' },
  { name: 'profile', label: 'Profiel', icon: 'person', type: 'ionicons' },
];

function renderIcon(item: NavBarItem, isActive: boolean) {
  const size = isActive ? 28 : 22;
  const color = isActive ? '#FFFFFF' : '#9AA4B2';
  if (item.type === 'material') {
    return <MaterialCommunityIcons name={item.icon as any} size={size} color={color} />;
  }
  return <Ionicons name={item.icon as any} size={size} color={color} />;
}

export default function BottomNavBar({ activeScreen, onNavigate, badges }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.name;
          const badgeCount = badges?.[item.name] ?? 0;

          return (
            <TouchableOpacity
              key={item.name}
              style={styles.navItemWrapper}
              onPress={() => onNavigate(item.name)}
              activeOpacity={0.8}
            >
              <View style={[styles.navItem, isActive && styles.navItemActive]}>
                {isActive && <View style={styles.glowEffect} />}
                <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                  {renderIcon(item, isActive)}
                </View>
                {badgeCount > 0 && (
                  <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                      {badgeCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0D1A',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navBar: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0F1629',
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  navItemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItem: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  navItemActive: {
    marginTop: -30,
  },
  glowEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    opacity: 0.4,
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconCircleActive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: {
    backgroundColor: '#EF4444',
  },
  badgeInactive: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
