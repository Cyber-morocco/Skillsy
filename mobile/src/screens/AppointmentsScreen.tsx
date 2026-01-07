import React, { useState, useEffect } from 'react';
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
    Keyboard,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';
import { Review, Appointment } from '../types';
import { subscribeToAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { auth } from '../config/firebase';

type Tab = 'upcoming' | 'pending' | 'past';

interface AppointmentsScreenProps {
    onViewProfile?: (user: any) => void;
    onSubmitReview?: (review: Review, userId: string) => void;
    reviewedUsers?: string[];
}

export default function AppointmentsScreen({ onViewProfile, onSubmitReview, reviewedUsers = [] }: AppointmentsScreenProps) {

    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [ratings, setRatings] = useState({
        q1: 0,
        q2: 0,
        q3: 0
    });

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const unsubscribe = subscribeToAppointments(currentUser.uid, (data) => {
            setAppointments(data);
        });

        return () => unsubscribe();
    }, []);

    const upcomingAppointments = appointments.filter(a => a.status === 'confirmed');
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    const COUNTS = {
        upcoming: upcomingAppointments.length,
        pending: pendingAppointments.length,
        past: pastAppointments.length
    };

    const handleUpdateStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
        try {
            await updateAppointmentStatus(id, status);
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Fout', 'Kon status niet bijwerken.');
        }
    };

    const handleOpenReview = (item: Appointment) => {
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
            userId: selectedAppointment?.tutorId || '', // Assuming review is for tutor
            fromName: auth.currentUser?.displayName || 'Gebruiker',
            rating: averageRating,
            comment: 'Review via afspraken', // Or add comment input
            createdAt: new Date(),
        };

        const targetName = selectedAppointment?.tutorName || 'Persoon';

        if (selectedAppointment && onSubmitReview) {
            onSubmitReview(newReview, selectedAppointment.tutorId); // Pass ID instead of name ideally, but keeping sig
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
            case 'confirmed':
                return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', label: 'Bevestigd' };
            case 'pending':
                return { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', label: 'In afwachting' };
            case 'completed':
                return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', label: 'Voltooid' };
            case 'cancelled':
                return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Geannuleerd' };
            default:
                return { bg: 'rgba(148, 163, 184, 0.15)', text: authColors.muted, label: status };
        }
    };

    const renderCard = (item: Appointment, type: Tab) => {
        const statusStyle = getStatusStyle(item.status);
        const isMe = item.studentId === auth.currentUser?.uid;
        const otherName = isMe ? item.tutorName : item.studentName;
        const otherAvatar = isMe ? item.tutorAvatar : item.studentAvatar;

        const dummyUser = {
            id: isMe ? item.tutorId : item.studentId,
            displayName: otherName,
            photoURL: otherAvatar,
            bio: 'Gebruiker bij Skillsy',
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
                                source={{ uri: otherAvatar || `https://ui-avatars.com/api/?name=${otherName?.split(' ').join('+')}&background=random` }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.subjectText}>{item.title}</Text>
                            <Text style={styles.personText}>{item.subtitle}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
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
                    {item.fee && (
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>€{item.fee}</Text>
                        </View>
                    )}
                </View>

                {type === 'upcoming' && (
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            style={styles.outlineButton}
                            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                        >
                            <Text style={styles.outlineButtonText}>Annuleren</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.solidButton}
                            onPress={() => handleUpdateStatus(item.id, 'completed')}
                        >
                            <Text style={styles.solidButtonText}>Afronden</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {type === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={[styles.outlineButton, { flex: 1 }]}
                            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                        >
                            <Text style={styles.outlineButtonText}>Afwijzen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.solidButton, { flex: 1 }]}
                            onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                        >
                            <Text style={styles.solidButtonText}>Accepteren</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {type === 'past' && item.status === 'completed' && (
                    <TouchableOpacity
                        style={[
                            styles.outlineButton,
                            reviewedUsers.includes(item.tutorId) && { backgroundColor: 'rgba(148, 163, 184, 0.1)', borderColor: 'transparent' }
                        ]}
                        onPress={() => !reviewedUsers.includes(item.tutorId) && handleOpenReview(item)}
                        disabled={reviewedUsers.includes(item.tutorId)}
                    >
                        <Text style={[
                            styles.outlineButtonText,
                            reviewedUsers.includes(item.tutorId) && { color: authColors.muted }
                        ]}>
                            {reviewedUsers.includes(item.tutorId) ? 'Beoordeeld' : 'Beoordeling achterlaten'}
                        </Text>
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

            <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={false} />}>
                {activeTab === 'upcoming' && upcomingAppointments.length === 0 && (
                    <Text style={{ textAlign: 'center', color: authColors.muted, marginTop: 20 }}>Geen aankomende afspraken</Text>
                )}
                {activeTab === 'upcoming' && upcomingAppointments.map(item => renderCard(item, 'upcoming'))}

                {activeTab === 'pending' && pendingAppointments.map(item => renderCard(item, 'pending'))}
                {activeTab === 'past' && pastAppointments.map(item => renderCard(item, 'past'))}
            </ScrollView>

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
                                    Beoordeel {selectedAppointment?.tutorName?.replace(/^(met|Met)\s+/, '')}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    {selectedAppointment?.title}
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
