
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
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
    swapRequest?: string;
    status: 'Bevestigd' | 'In afwachting' | 'Voltooid' | 'Geannuleerd';
    avatarUrl?: string;
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
        avatarUrl: 'https://i.pravatar.cc/150?u=Thomas'
    }
];

const DUMMY_PENDING: AppointmentConfig[] = [
    {
        id: '3',
        subject: 'Spaanse les',
        personName: 'met Lisa Vermeer',
        date: '18 november 2024',
        time: '16:00 - 17:00',
        locationType: 'Fysiek',
        location: 'West, Amsterdam',
        price: 'Vergoeding: €22',
        status: 'In afwachting',
        avatarUrl: 'https://i.pravatar.cc/150?u=Lisa'
    }
];

const DUMMY_PAST: AppointmentConfig[] = [
    {
        id: '4',
        subject: 'Kookles',
        personName: 'met Peter Visser',
        date: '2 november 2024',
        time: '19:00 - 20:30',
        locationType: 'Fysiek',
        location: 'Oud-Zuid, Amsterdam',
        swapRequest: 'Ruil voor: Yogales',
        status: 'Voltooid',
        avatarUrl: 'https://i.pravatar.cc/150?u=Peter'
    },
    {
        id: '5',
        subject: 'Frans les',
        personName: 'met Maria Santos',
        date: '28 oktober 2024',
        time: '15:00 - 16:00',
        locationType: 'Fysiek',
        location: 'Centrum, Amsterdam',
        price: '€25',
        status: 'Voltooid',
        avatarUrl: 'https://i.pravatar.cc/150?u=Maria'
    }
];

import { Review } from '../types';

interface AppointmentsScreenProps {
    onViewProfile?: (user: any) => void;
    onSubmitReview?: (review: Review, userId: string) => void;
}

export default function AppointmentsScreen({ onViewProfile, onSubmitReview }: AppointmentsScreenProps) {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentConfig | null>(null);

    const [ratings, setRatings] = useState({
        q1: 0,
        q2: 0,
        q3: 0
    });

    const COUNTS = {
        upcoming: DUMMY_UPCOMING.length,
        pending: DUMMY_PENDING.length,
        past: DUMMY_PAST.length
    };

    const handleOpenReview = (item: AppointmentConfig) => {
        setSelectedAppointment(item);
        setRatings({ q1: 0, q2: 0, q3: 0 }); 
        setReviewModalVisible(true);
    };

    const handleSubmitReview = () => {
        if (ratings.q1 === 0 || ratings.q2 === 0 || ratings.q3 === 0) {
            Alert.alert('Nog niet klaar', 'Beantwoord alstublieft alle vragen.');
            return;
        }

        const averageRating = (ratings.q1 + ratings.q2 + ratings.q3) / 3;

        const newReview: Review = {
            id: Date.now().toString(),
            reviewerName: 'Jij (Huidige Gebruiker)', 
            rating: averageRating,
            questions: ratings,
            createdAt: new Date(),
        };

        if (selectedAppointment && onSubmitReview) {
            onSubmitReview(newReview, selectedAppointment.personName);
        }

        Alert.alert('Bedankt!', 'Je beoordeling is verstuurd.');
        setReviewModalVisible(false);
    };

    const setRatingForQuestion = (question: 'q1' | 'q2' | 'q3', value: number) => {
        setRatings(prev => ({ ...prev, [question]: value }));
    };

    const renderTab = (tab: Tab, label: string) => {
        const isActive = activeTab === tab;
        return (
            <TouchableOpacity
                onPress={() => setActiveTab(tab)}
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


    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Bevestigd':
                return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
            case 'In afwachting':
                return { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15' };
            case 'Voltooid':
                return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' };
            default:
                return { bg: 'rgba(148, 163, 184, 0.15)', text: authColors.muted };
        }
    };

    const renderCard = (item: AppointmentConfig, type: Tab) => {
        const statusStyle = getStatusStyle(item.status);

        const dummyUser = {
            id: item.personName,
            displayName: item.personName.replace(/^(met|Met)\s+/, ''),
            photoURL: item.avatarUrl,
            bio: 'Docent bij Skillsy',
            location: { city: 'Amsterdam' }
        };

        return (
            <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
                        onPress={() => onViewProfile?.(dummyUser)}
                    >
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.personName.split(' ').slice(1).join('+')}&background=random` }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.subjectText}>{item.subject}</Text>
                            <Text style={styles.personText}>{item.personName}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
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

                    {item.swapRequest && (
                        <View style={[styles.priceContainer, { backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}>
                            <Text style={[styles.priceText, { color: '#c084fc' }]}>{item.swapRequest}</Text>
                        </View>
                    )}
                    {item.price && !item.swapRequest && (
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>{item.price}</Text>
                        </View>
                    )}
                </View>

                {type === 'upcoming' && (
                    <TouchableOpacity style={styles.outlineButton}>
                        <Text style={styles.outlineButtonText}>Annuleren</Text>
                    </TouchableOpacity>
                )}

                {type === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity style={[styles.outlineButton, { flex: 1 }]}>
                            <Text style={styles.outlineButtonText}>Afwijzen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.solidButton, { flex: 1 }]}>
                            <Text style={styles.solidButtonText}>Accepteren</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {type === 'past' && (
                    <TouchableOpacity
                        style={styles.outlineButton}
                        onPress={() => handleOpenReview(item)}
                    >
                        <Text style={styles.outlineButtonText}>Beoordeling achterlaten</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderQuestionStars = (questionKey: 'q1' | 'q2' | 'q3', questionText: string) => (
        <View style={{ marginBottom: 24 }}>
            <Text style={styles.questionText}>{questionText}</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRatingForQuestion(questionKey, star)}>
                        <Ionicons
                            name={ratings[questionKey] >= star ? "star" : "star-outline"}
                            size={32}
                            color="#FCD34D"
                            style={{ marginRight: 8 }}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const isSubmitDisabled = ratings.q1 === 0 || ratings.q2 === 0 || ratings.q3 === 0;

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
                {activeTab === 'upcoming' && DUMMY_UPCOMING.map(item => renderCard(item, 'upcoming'))}
                {activeTab === 'pending' && DUMMY_PENDING.map(item => renderCard(item, 'pending'))}
                {activeTab === 'past' && DUMMY_PAST.map(item => renderCard(item, 'past'))}
            </ScrollView>

            {/* REVIEW MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={reviewModalVisible}
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={styles.closeButton}>
                                    <Ionicons name="arrow-back" size={24} color={authColors.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                                <Text style={styles.modalTitle}>
                                    Beoordeel {selectedAppointment?.personName.replace(/^(met|Met)\s+/, '')}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    {selectedAppointment?.subject}
                                </Text>

                                {renderQuestionStars('q1', 'Was de uitleg duidelijk en aangepast aan jouw niveau?')}
                                {renderQuestionStars('q2', 'Kwam de persoon afspraken en verwachtingen na?')}
                                {renderQuestionStars('q3', 'Zou je opnieuw met deze persoon willen samenwerken?')}

                                <TouchableOpacity
                                    style={[styles.submitButton, { opacity: isSubmitDisabled ? 0.6 : 1 }]}
                                    onPress={handleSubmitReview}
                                    disabled={isSubmitDisabled}
                                >
                                    <Text style={styles.submitButtonText}>Verstuur beoordeling</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        fontSize: 12,
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
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
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
        width: 16,
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
    outlineButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    outlineButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: authColors.text,
    },
    solidButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: authColors.accent, // Purple
    },
    solidButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },

    // MODAL STYLES
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: authColors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: authColors.text,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: authColors.muted,
        marginBottom: 32,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: authColors.text,
        marginBottom: 12,
        lineHeight: 22,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    textArea: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        color: authColors.text,
        fontSize: 15,
        minHeight: 120,
        marginBottom: 32,
    },
    submitButton: {
        backgroundColor: authColors.accent,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});
