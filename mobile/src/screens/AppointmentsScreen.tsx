
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';

type Tab = 'upcoming' | 'pending' | 'past';

interface AppointmentConfig {
    id: string;
    subject: string;
    personName: string;
    date: string;
    time: string;
    location: string;
    locationType: 'Fysiek' | 'Online';
    price?: string;
    status: 'Bevestigd' | 'In afwachting' | 'Voltooid' | 'Geannuleerd';
    avatarUrl?: string; // In real app, this would be a URL
}

const DUMMY_UPCOMING: AppointmentConfig[] = [
    {
        id: '1',
        subject: 'Frans',
        personName: 'Met Emma Janssen',
        date: '18 november 2024',
        time: '10:00 - 11:00',
        locationType: 'Fysiek',
        location: 'Fysiek',
        status: 'Bevestigd',
    },
    {
        id: '2',
        subject: 'Programmeren',
        personName: 'met Thomas Berg',
        date: '15 november 2024',
        time: '10:00 - 11:00',
        locationType: 'Online',
        location: 'Online',
        price: 'Vergoeding: €30',
        status: 'Bevestigd',
        avatarUrl: 'https://i.pravatar.cc/150?u=Thomas' // Placeholder if we had one
    }
];

export default function AppointmentsScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');

    // Counts - hardcoded for this step as per screenshot
    const COUNTS = {
        upcoming: 2,
        pending: 1,
        past: 2
    };

    const renderTab = (tab: Tab, label: string) => {
        const isActive = activeTab === tab;
        return (
            <TouchableOpacity
                onPress={() => {
                    if (tab !== 'upcoming') {
                        Alert.alert('Info', 'Deze stap doen we later! Eerst stap 1 goedkeuren.');
                        // Usually setActiveTab(tab) here, but user asked for Step 1 first.
                        // Actually, switching tabs is fine UI-wise, but we only implement content for Upcoming.
                        // Let's implement switching but empty content for others to signify "Not done yet".
                        setActiveTab(tab);
                    } else {
                        setActiveTab(tab);
                    }
                }}
                style={[
                    styles.tab,
                    isActive && styles.activeTab
                ]}
            >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {label} ({COUNTS[tab]})
                </Text>
            </TouchableOpacity>
        );
    };

    const renderUpcomingCard = (item: AppointmentConfig) => {
        return (
            <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                        {/* Placeholder Avatar */}
                        <Image
                            source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.personName.split(' ').slice(1).join('+')}&background=random` }}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.subjectText}>{item.subject}</Text>
                        <Text style={styles.personText}>{item.personName}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={authColors.muted} style={styles.icon} />
                        <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={authColors.muted} style={styles.icon} />
                        <Text style={styles.detailText}>{item.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={authColors.muted} style={styles.icon} />
                        <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                    {item.price && (
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>{item.price}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Mijn afspraken</Text>
            </View>

            <View style={styles.tabsContainer}>
                {renderTab('upcoming', 'Aankomend')}
                {renderTab('pending', 'In afwachting')}
                {renderTab('past', 'Voorbij')}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === 'upcoming' ? (
                    DUMMY_UPCOMING.map(renderUpcomingCard)
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>
                            Stap 2 komt hierna...
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: authColors.background,
    },
    header: {
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: authColors.text,
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    tabText: {
        fontSize: 13,
        color: authColors.muted,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#fff', // Card background is white in screenshot, usually. But for Dark Mode app?
        // User asked: "change color to how the site looks now".
        // Site is Dark Mode (authColors.card = #101936).
        // Let's use authColors.card or a slightly lighter/darker variant.
        // Screenshot shows WHITE cards. User said "verander de kleur naar hoe de site er nu al uit ziet" -> Dark Mode.
        backgroundColor: authColors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e1e1e1',
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    subjectText: {
        fontSize: 16,
        fontWeight: '700',
        color: authColors.text,
        marginBottom: 2,
    },
    personText: {
        fontSize: 14,
        color: authColors.muted,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(34, 197, 94, 0.15)', // Green tint
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4ade80', // Green
    },
    detailsContainer: {
        marginBottom: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        width: 16, // Fixed width for alignment
    },
    detailText: {
        fontSize: 14,
        color: authColors.muted,
    },
    priceContainer: {
        marginTop: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    priceText: {
        fontSize: 13,
        fontWeight: '600',
        color: authColors.text,
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: authColors.text,
    },
    placeholderContainer: {
        padding: 40,
        alignItems: 'center',
    },
    placeholderText: {
        color: authColors.muted,
        fontSize: 16,
    }
});
