import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appointmentStyles as styles } from '../styles/AppointmentStyles';

type TabType = 'upcoming' | 'pending' | 'past';

interface TabData {
    key: TabType;
    label: string;
    count: number;
}

interface Appointment {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    time: string;
    location: 'fysiek' | 'online';
    status: 'confirmed' | 'pending';
    avatar?: string;
    initials: string;
    fee?: number;
}

const TABS: TabData[] = [
    { key: 'upcoming', label: 'Aankomend', count: 2 },
    { key: 'pending', label: 'In afwachting', count: 1 },
    { key: 'past', label: 'Voorbij', count: 2 },
];

// TE VERWIJDEREN MOCK DATA 
const MOCK_APPOINTMENTS: Record<TabType, Appointment[]> = {
    upcoming: [
        {
            id: '1',
            title: 'Frans',
            subtitle: 'Met Emma Janssen',
            date: '18 november 2024',
            time: '10:00 - 11:00',
            location: 'fysiek',
            status: 'confirmed',
            initials: 'EJ',
        },
        {
            id: '2',
            title: 'Programmeren',
            subtitle: 'met Thomas Berg',
            date: '15 november 2024',
            time: '10:00 - 11:00',
            location: 'online',
            status: 'confirmed',
            initials: 'TB',
            fee: 30,
        },
    ],
    pending: [
        {
            id: '3',
            title: 'Wiskunde',
            subtitle: 'Met Lisa de Vries',
            date: '20 november 2024',
            time: '14:00 - 15:00',
            location: 'online',
            status: 'pending',
            initials: 'LV',
            fee: 25,
        },
    ],
    past: [
        {
            id: '4',
            title: 'Engels',
            subtitle: 'Met Jan Smit',
            date: '10 november 2024',
            time: '09:00 - 10:00',
            location: 'fysiek',
            status: 'confirmed',
            initials: 'JS',
        },
        {
            id: '5',
            title: 'Piano',
            subtitle: 'Met Maria Garcia',
            date: '5 november 2024',
            time: '16:00 - 17:00',
            location: 'fysiek',
            status: 'confirmed',
            initials: 'MG',
            fee: 40,
        },
    ],
};

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

    const renderAppointmentCard = (appointment: Appointment) => {
        const isConfirmed = appointment.status === 'confirmed';

        return (
            <View key={appointment.id} style={styles.card}>
                {/* Header with avatar and status */}
                <View style={styles.cardHeader}>
                    {appointment.avatar ? (
                        <Image source={{ uri: appointment.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{appointment.initials}</Text>
                        </View>
                    )}
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{appointment.title}</Text>
                        <Text style={styles.cardSubtitle}>{appointment.subtitle}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        isConfirmed ? styles.statusConfirmed : styles.statusPending
                    ]}>
                        <Text style={[
                            styles.statusText,
                            isConfirmed ? styles.statusConfirmedText : styles.statusPendingText
                        ]}>
                            {isConfirmed ? 'Bevestigd' : 'In afwachting'}
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text style={styles.detailIconText}>📅</Text>
                        </View>
                        <Text style={styles.detailText}>{appointment.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text style={styles.detailIconText}>🕐</Text>
                        </View>
                        <Text style={styles.detailText}>{appointment.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text style={styles.detailIconText}>📍</Text>
                        </View>
                        <Text style={styles.detailText}>
                            {appointment.location === 'fysiek' ? 'Fysiek' : 'Online'}
                        </Text>
                    </View>
                    {appointment.fee && (
                        <View style={styles.feeContainer}>
                            <Text style={styles.feeText}>Vergoeding: €{appointment.fee}</Text>
                        </View>
                    )}
                </View>

                {/* Action button */}
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7}>
                        <Text style={styles.cancelButtonText}>Annuleren</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const appointments = MOCK_APPOINTMENTS[activeTab];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mijn afspraken</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {TABS.map(renderTab)}
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {appointments.length > 0 ? (
                    appointments.map(renderAppointmentCard)
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Geen afspraken gevonden
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

export default AppointmentsScreen;
