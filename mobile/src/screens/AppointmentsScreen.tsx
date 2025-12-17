import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { appointmentStyles as styles } from '../styles/AppointmentStyles';
import AppointmentDetailScreen, { AppointmentData } from './AppointmentDetailScreen';

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
// TE VERWIJDEREN MOCK DATA
const MOCK_APPOINTMENTS: Record<TabType, AppointmentData[]> = {
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
            address: 'Keizersgracht 123, Amsterdam',
            description: 'Franse les voor beginners. We gaan werken aan uitspraak en basisgrammatica.',
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
            description: 'React Native les. We gaan werken aan navigatie en state management.',
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
            description: 'Wiskunde bijles voor examens.',
        },
    ],
    past: [
        {
            id: '4',
            title: 'Kookles',
            subtitle: 'met Peter Visser',
            date: '2 november 2024',
            time: '19:00 - 20:30',
            location: 'fysiek',
            status: 'confirmed',
            initials: 'PV',
            address: 'Oud-Zuid, Amsterdam',
        },
        {
            id: '5',
            title: 'Frans les',
            subtitle: 'met Maria Santos',
            date: '28 oktober 2024',
            time: '15:00 - 16:00',
            location: 'fysiek',
            status: 'confirmed',
            initials: 'MS',
            address: 'Centrum, Amsterdam',
            fee: 25,
        },
    ],
};

function AppointmentsScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewingAppointment, setReviewingAppointment] = useState<AppointmentData | null>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const isPastTab = activeTab === 'past';

    const openReviewModal = (appointment: AppointmentData) => {
        setReviewingAppointment(appointment);
        setRating(0);
        setReviewText('');
        setReviewModalVisible(true);
    };

    const submitReview = () => {
        if (rating === 0) {
            Alert.alert('Fout', 'Selecteer een beoordeling');
            return;
        }
        Alert.alert('Bedankt!', 'Je beoordeling is verzonden.');
        setReviewModalVisible(false);
        setReviewingAppointment(null);
    };

    if (selectedAppointment) {
        return (
            <AppointmentDetailScreen
                appointment={selectedAppointment}
                onBack={() => setSelectedAppointment(null)}
                onCancel={isPastTab ? undefined : () => {
                    Alert.alert(
                        'Afspraak annuleren',
                        'Weet je zeker dat je deze afspraak wilt annuleren?',
                        [
                            { text: 'Nee', style: 'cancel' },
                            {
                                text: 'Ja, annuleren',
                                style: 'destructive',
                                onPress: () => setSelectedAppointment(null)
                            },
                        ]
                    );
                }}
                onReschedule={isPastTab ? undefined : () => {
                    Alert.alert('Afspraak verzetten', 'Deze functie komt binnenkort beschikbaar.');
                }}
            />
        );
    }

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

    const renderAppointmentCard = (appointment: AppointmentData) => {
        const getStatusStyle = () => {
            if (isPastTab) return styles.statusCompleted;
            return appointment.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending;
        };

        const getStatusTextStyle = () => {
            if (isPastTab) return styles.statusCompletedText;
            return appointment.status === 'confirmed' ? styles.statusConfirmedText : styles.statusPendingText;
        };

        const getStatusLabel = () => {
            if (isPastTab) return 'Voltooid';
            return appointment.status === 'confirmed' ? 'Bevestigd' : 'In afwachting';
        };

        return (
            <TouchableOpacity
                key={appointment.id}
                style={styles.card}
                onPress={() => setSelectedAppointment(appointment)}
                activeOpacity={0.7}
            >
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
                    <View style={[styles.statusBadge, getStatusStyle()]}>
                        <Text style={[styles.statusText, getStatusTextStyle()]}>
                            {getStatusLabel()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                        </View>
                        <Text style={styles.detailText}>{appointment.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="time-outline" size={16} color="#94A3B8" />
                        </View>
                        <Text style={styles.detailText}>{appointment.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="location-outline" size={16} color="#94A3B8" />
                        </View>
                        <Text style={styles.detailText}>
                            {appointment.address || (appointment.location === 'fysiek' ? 'Fysiek' : 'Online')}
                        </Text>
                    </View>
                    {appointment.fee && (
                        <View style={styles.feeContainer}>
                            <Text style={styles.feeText}>€{appointment.fee}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardActions}>
                    {isPastTab ? (
                        <TouchableOpacity
                            style={styles.reviewButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                openReviewModal(appointment);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.reviewButtonText}>Beoordeling achterlaten</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#64748B', fontSize: 14 }}>Bekijk details</Text>
                            <Ionicons name="chevron-forward" size={16} color="#64748B" style={{ marginLeft: 4 }} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const appointments = MOCK_APPOINTMENTS[activeTab];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mijn afspraken</Text>
            </View>

            <View style={styles.tabContainer}>
                {TABS.map(renderTab)}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {appointments.length > 0 ? (
                    appointments.map(renderAppointmentCard)
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Geen afspraken gevonden</Text>
                    </View>
                )}
            </ScrollView>

            {/* Review Modal */}
            <Modal
                visible={reviewModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalBackButton}
                                onPress={() => setReviewModalVisible(false)}
                            >
                                <Ionicons name="arrow-back" size={24} color="#1F2937" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                Beoordeel {reviewingAppointment?.subtitle.replace('met ', '').replace('Met ', '')}
                            </Text>
                        </View>
                        <Text style={styles.modalSubtitle}>
                            Deel je ervaring met de {reviewingAppointment?.title}
                        </Text>

                        <Text style={styles.ratingLabel}>Geef een beoordeling</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? 'star' : 'star-outline'}
                                        size={32}
                                        color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.reviewLabel}>Jouw review</Text>
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Vertel over je ervaring..."
                            placeholderTextColor="#9CA3AF"
                            value={reviewText}
                            onChangeText={setReviewText}
                            multiline
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={submitReview}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitButtonText}>Verstuur beoordeling</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default AppointmentsScreen;
