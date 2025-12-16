import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { appointmentStyles as styles, appointmentColors } from '../styles/AppointmentStyles';

type TabType = 'upcoming' | 'pending' | 'past';

interface TabData {
    key: TabType;
    label: string;
    count: number;
}

const TABS: TabData[] = [
    { key: 'upcoming', label: 'Aankomend', count: 2 },
    { key: 'pending', label: 'In afwachting', count: 1 },
    { key: 'past', label: 'Voorbij', count: 2 },
];

function AppointmentsScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');

    const renderTab = (tab: TabData) => {
        const isActive = activeTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                        {tab.label}
                    </Text>
                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                        <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                            {tab.count}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mijn afspraken</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {TABS.map(renderTab)}
            </View>

            {/* Content - Empty state for now */}
            <ScrollView style={styles.content}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Geen afspraken gevonden
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

export default AppointmentsScreen;
