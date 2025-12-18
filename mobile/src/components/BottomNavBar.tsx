import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile';

interface NavBarItem {
    name: NavName;
    icon: string;
    type: 'ionicons' | 'material';
}

interface BottomNavBarProps {
    activeScreen: NavName;
    onNavigate: (screen: NavName) => void;
}

const NAV_ITEMS: NavBarItem[] = [
    { name: 'home', icon: 'home', type: 'ionicons' },
    { name: 'explore', icon: 'search', type: 'ionicons' },
    { name: 'appointments', icon: 'calendar', type: 'ionicons' },
    { name: 'messages', icon: 'chatbubble', type: 'ionicons' },
    { name: 'profile', icon: 'person', type: 'ionicons' },
];

export default function BottomNavBar({ activeScreen, onNavigate }: BottomNavBarProps) {
    const renderIcon = (item: NavBarItem, isActive: boolean) => {
        const color = isActive ? '#fff' : '#64748B';
        const size = isActive ? 26 : 24;

        if (item.type === 'material') {
            return (
                <MaterialCommunityIcons
                    name={item.icon as any}
                    size={size}
                    color={color}
                />
            );
        }
        return (
            <Ionicons
                name={item.icon as any}
                size={size}
                color={color}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                {NAV_ITEMS.map((item) => {
                    const isActive = activeScreen === item.name;

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
});
