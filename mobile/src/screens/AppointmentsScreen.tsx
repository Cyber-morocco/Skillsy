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
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';
import { Review, Appointment } from '../types';
import { subscribeToAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { saveReview } from '../services/userService';
import { auth } from '../config/firebase';

type Tab = 'upcoming' | 'past';

interface AppointmentsScreenProps {
    onViewProfile?: (user: any) => void;
    onSubmitReview?: (review: Review, userId: string) => void;
    reviewedUsers?: string[];
    navigation?: any;
}

export default function AppointmentsScreen({ onViewProfile, onSubmitReview, reviewedUsers = [], navigation }: AppointmentsScreenProps) {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [ratings, setRatings] = useState({
        q1: 0,
        q2: 0,
        q3: 0
    });

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = subscribeToAppointments(user.uid, (fetched) => {
                setAppointments(fetched);
                setLoading(false);
                setRefreshing(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error('Error subscribing to appointments:', error);
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        // The subscription handles updates, but we can reset loading if it got stuck
        if (auth.currentUser) {
            setLoading(true);
            const user = auth.currentUser;
            subscribeToAppointments(user.uid, (fetched) => {
                setAppointments(fetched);
                setLoading(false);
                setRefreshing(false);
            });
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (activeTab === 'upcoming') return app.status === 'confirmed';
        if (activeTab === 'past') return app.status === 'completed' || app.status === 'cancelled';
        return false;
    });

    const counts = {
        upcoming: appointments.filter(app => app.status === 'confirmed').length,
        past: appointments.filter(app => app.status === 'completed' || app.status === 'cancelled').length
    };

    const handleOpenReview = (item: Appointment) => {
        setSelectedAppointment(item);
        setRatings({ q1: 0, q2: 0, q3: 0 });
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async () => {
        if (ratings.q1 === 0 || ratings.q2 === 0 || ratings.q3 === 0) {
            Alert.alert('Nog niet klaar', 'Beantwoord alstublieft alle vragen.');
            return;
        }

        const averageRating = (ratings.q1 + ratings.q2 + ratings.q3) / 3;

        if (selectedAppointment) {
            try {
                await saveReview({
                    userId: selectedAppointment.tutorId,
                    fromName: auth.currentUser?.displayName || 'Gebruiker',
                    rating: averageRating,
                });

                if (onSubmitReview) {
                    onSubmitReview({
                        id: Date.now().toString(),
                        userId: selectedAppointment.tutorId,
                        fromName: auth.currentUser?.displayName || 'Gebruiker',
                        rating: averageRating,
                        createdAt: new Date(),
                    }, selectedAppointment.tutorId);
                }
            } catch (error) {
                console.error('Error saving review:', error);
                Alert.alert('Fout', 'Kon de review niet opslaan.');
                return;
            }
        }

        setReviewModalVisible(false);
        Alert.alert('Bedankt!', 'Je review is opgeslagen.');
    };

    const getStatusText = (status: Appointment['status']) => {
        switch (status) {
            case 'confirmed': return 'Bevestigd';
            case 'pending': return 'In afwachting';
            case 'completed': return 'Voltooid';
            case 'cancelled': return 'Geannuleerd';
            default: return status;
        }
    };

    const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
        try {
            await updateAppointmentStatus(id, status);
        } catch (error) {
            console.error('Error updating appointment status:', error);
            Alert.alert('Fout', 'Kon de status niet bijwerken.');
        }
    };

    const renderAppointmentCard = (item: Appointment) => {
        const isMeAsTutor = item.tutorId === auth.currentUser?.uid;
        const otherName = isMeAsTutor ? item.studentName : item.tutorName;
        const initials = (otherName || '??').split(' ').map(n => n[0]).join('').toUpperCase();

        return (
            <TouchableOpacity
                key={item.id}
                style={styles.appointmentCard}
                onPress={() => {
                    if (item.status === 'completed') {
                        handleOpenReview(item);
                    } else if (navigation) {
                        navigation.navigate('AppointmentDetail', { appointment: item });
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.personContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View>
                            <Text style={styles.subjectText}>{item.title}</Text>
                            <Text style={styles.personNameText}>Afspraak met {otherName}</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        item.status === 'confirmed' ? styles.statusConfirmed :
                            item.status === 'pending' ? styles.statusPending :
                                item.status === 'completed' ? styles.statusPast : styles.statusCancelled
                    ]}>
                        <Text style={[
                            styles.statusText,
                            item.status === 'confirmed' ? styles.statusConfirmedText :
                                item.status === 'pending' ? styles.statusPendingText :
                                    item.status === 'completed' ? styles.statusPastText : styles.statusCancelledText
                        ]}>
                            {getStatusText(item.status)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={authColors.muted} />
                        <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                    <View style={[styles.detailRow, { marginLeft: 20 }]}>
                        <Ionicons name="time-outline" size={16} color={authColors.muted} />
                        <Text style={styles.detailText}>{item.time}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={authColors.muted} />
                    <Text style={styles.detailText}>{item.address || item.location}</Text>
                </View>

                {item.status === 'pending' && !isMeAsTutor && (
                    <View style={styles.actionButtons}>
                        <Text style={{ color: authColors.muted, fontSize: 13, fontStyle: 'italic' }}>
                            Wachten op reactie van {otherName}...
                        </Text>
                    </View>
                )}

                {item.status === 'pending' && isMeAsTutor && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleUpdateAppointmentStatus(item.id, 'cancelled')}
                        >
                            <Text style={styles.cancelButtonText}>Afwijzen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleUpdateAppointmentStatus(item.id, 'confirmed')}
                        >
                            <Text style={styles.acceptButtonText}>Accepteren</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'confirmed' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleUpdateAppointmentStatus(item.id, 'cancelled')}
                        >
                            <Text style={styles.cancelButtonText}>Annuleren</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleUpdateAppointmentStatus(item.id, 'completed')}
                        >
                            <Text style={styles.acceptButtonText}>Afronden</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'completed' && !reviewedUsers.includes(item.tutorId) && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.reviewButton} onPress={() => handleOpenReview(item)}>
                            <Ionicons name="star-outline" size={16} color={authColors.accent} />
                            <Text style={styles.reviewButtonText}>Review achterlaten</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mijn Afspraken</Text>
                <Text style={styles.subtitle}>Beheer je geplande en voltooide afspraken</Text>
            </View>

            <View style={styles.tabContainer}>
                {(['upcoming', 'past'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <View style={styles.tabContent}>
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab === 'upcoming' ? 'Bevestigd' : 'Verleden'}
                            </Text>
                            {counts[tab] > 0 && (
                                <View style={[styles.badge, activeTab === tab && styles.activeBadge]}>
                                    <Text style={[styles.badgeText, activeTab === tab && styles.activeBadgeText]}>
                                        {counts[tab]}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={authColors.accent} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={authColors.accent} />
                    }
                >
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(renderAppointmentCard)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color={authColors.card} />
                            <Text style={styles.emptyText}>Geen afspraken gevonden</Text>
                            <Text style={styles.emptySubtext}>Je hebt momenteel geen afspraken in deze categorie.</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={reviewModalVisible}
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setReviewModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.reviewModal}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewAvatar}>
                                        <Text style={styles.reviewAvatarText}>
                                            {(selectedAppointment?.tutorName || '?')[0]}
                                        </Text>
                                    </View>
                                    <Text style={styles.reviewTitle}>Hoe was je ervaring?</Text>
                                    <Text style={styles.reviewSubtitle}>
                                        Met {selectedAppointment?.tutorId === auth.currentUser?.uid ? (selectedAppointment?.studentName || '...') : selectedAppointment?.tutorName} voor {selectedAppointment?.title}
                                    </Text>
                                </View>

                                <View style={styles.questionContainer}>
                                    {[
                                        { id: 'q1', text: 'Hoe was de kwaliteit van de uitleg?' },
                                        { id: 'q2', text: 'Was de persoon op tijd en professioneel?' },
                                        { id: 'q3', text: 'Zou je deze persoon aanbevelen?' }
                                    ].map((q) => (
                                        <View key={q.id} style={styles.questionItem}>
                                            <Text style={styles.questionText}>{q.text}</Text>
                                            <View style={styles.starRow}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <TouchableOpacity
                                                        key={star}
                                                        onPress={() => setRatings(prev => ({ ...prev, [q.id]: star }))}
                                                    >
                                                        <Ionicons
                                                            name={ratings[q.id as keyof typeof ratings] >= star ? "star" : "star-outline"}
                                                            size={28}
                                                            color={ratings[q.id as keyof typeof ratings] >= star ? "#F59E0B" : authColors.muted}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.reviewActions}>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => setReviewModalVisible(false)}
                                    >
                                        <Text style={styles.modalCancelText}>Annuleren</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalSubmitButton}
                                        onPress={handleSubmitReview}
                                    >
                                        <Text style={styles.modalSubmitText}>Verzenden</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingTop: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: authColors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: authColors.muted,
        lineHeight: 22,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 24,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: authColors.card,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    activeTab: {
        backgroundColor: authColors.accent,
        borderColor: authColors.accent,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: authColors.muted,
    },
    activeTabText: {
        color: authColors.text,
    },
    badge: {
        backgroundColor: authColors.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    activeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: authColors.muted,
    },
    activeBadgeText: {
        color: authColors.text,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    appointmentCard: {
        backgroundColor: authColors.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.15)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    personContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: authColors.accent,
    },
    subjectText: {
        fontSize: 16,
        fontWeight: '700',
        color: authColors.text,
        marginBottom: 2,
    },
    personNameText: {
        fontSize: 14,
        color: authColors.muted,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    statusConfirmed: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    statusConfirmedText: { color: '#10B981' },
    statusPending: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    statusPendingText: { color: '#3B82F6' },
    statusPast: { backgroundColor: 'rgba(148, 163, 184, 0.1)' },
    statusPastText: { color: '#94A3B8' },
    statusCancelled: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    statusCancelledText: { color: '#EF4444' },
    divider: {
        height: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        marginBottom: 16,
    },
    cardDetails: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    detailText: {
        color: authColors.text,
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 14,
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: authColors.accent,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: authColors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    reviewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: authColors.accent,
        gap: 8,
    },
    reviewButtonText: {
        color: authColors.accent,
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: authColors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: authColors.muted,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    reviewModal: {
        backgroundColor: authColors.card,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    reviewHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    reviewAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewAvatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: authColors.accent,
    },
    reviewTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: authColors.text,
        marginBottom: 4,
    },
    reviewSubtitle: {
        fontSize: 14,
        color: authColors.muted,
        textAlign: 'center',
    },
    questionContainer: {
        marginBottom: 24,
    },
    questionItem: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 15,
        color: authColors.text,
        marginBottom: 12,
    },
    starRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    reviewActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalCancelText: {
        color: authColors.muted,
        fontWeight: '600',
    },
    modalSubmitButton: {
        flex: 2,
        backgroundColor: authColors.accent,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalSubmitText: {
        color: authColors.text,
        fontWeight: '600',
    },
});
