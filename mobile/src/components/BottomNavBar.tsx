import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface NavBarItem {
  name: string;
  label: string;
  icon: string;
  badge?: number;
  type?: 'ionicons' | 'material';
}

interface BottomNavBarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

const NAV_ITEMS: NavBarItem[] = [
  {
    name: 'home',
    label: 'Home',
    icon: 'home',
    type: 'ionicons',
  },
  {
    name: 'explore',
    label: 'Ontdekken',
    icon: 'map-marker',
    type: 'material',
  },
  {
    name: 'appointments',
    label: 'Afspraken',
    icon: 'calendar',
    type: 'ionicons',
    badge: 1,
  },
  {
    name: 'messages',
    label: 'Berichten',
    icon: 'chatbubble',
    type: 'ionicons',
    badge: 3,
  },
  {
    name: 'profile',
    label: 'Profiel',
    icon: 'person',
    type: 'ionicons',
  },
];

export default function BottomNavBar({ activeScreen, onNavigate }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              style={styles.navItem}
              onPress={() => onNavigate(item.name)}
              activeOpacity={0.7}
            >
              {/* Icon with badge */}
              <View style={styles.iconContainer}>
                {item.type === 'material' ? (
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? '#7c3aed' : '#999'}
                  />
                ) : (
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? '#7c3aed' : '#999'}
                  />
                )}

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <View
                    style={[
                      styles.badge,
                      isActive ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 0,
  },
  navBar: {
    flexDirection: 'row',
    height: 80,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeActive: {
    backgroundColor: '#7c3aed',
  },
  badgeInactive: {
    backgroundColor: '#ef4444',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  labelActive: {
    color: '#7c3aed',
  },
  labelInactive: {
    color: '#999',
  },
});
