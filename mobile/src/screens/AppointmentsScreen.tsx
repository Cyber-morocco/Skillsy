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
import { subscribeToAppointments, updateAppointmentStatus, updateAppointmentReviewStatus, updateAppointmentPaymentStatus } from '../services/appointmentService';
import { saveReview } from '../services/userService';
import { auth } from '../config/firebase';
import { Avatar } from '../components/Avatar';

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
    const [submittingReview, setSubmittingReview] = useState(false);

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
        const isMeAsTutor = item.tutorId === auth.currentUser?.uid;
        const isReviewed = isMeAsTutor ? item.reviewedByTutor : item.reviewedByStudent;

        if (isReviewed) return;

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
            setSubmittingReview(true);
            try {
                const isMeAsTutor = selectedAppointment.tutorId === auth.currentUser?.uid;
                const recipientId = isMeAsTutor ? selectedAppointment.studentId : selectedAppointment.tutorId;

                await saveReview({
                    userId: recipientId,
                    fromName: auth.currentUser?.displayName || 'Gebruiker',
                    rating: averageRating,
                });

                await updateAppointmentReviewStatus(selectedAppointment.id, isMeAsTutor ? 'tutor' : 'student');

                if (onSubmitReview) {
                    onSubmitReview({
                        id: Date.now().toString(),
                        userId: recipientId,
                        fromUserId: auth.currentUser?.uid || '',
                        fromName: auth.currentUser?.displayName || 'Gebruiker',
                        rating: averageRating,
                        createdAt: new Date(),
                    }, recipientId);
                }

                setReviewModalVisible(false);
                Alert.alert('Bedankt!', 'Je review is opgeslagen.');
            } catch (error) {
                console.error('Error saving review:', error);
                Alert.alert('Fout', 'Kon de review niet opslaan.');
            } finally {
                setSubmittingReview(false);
            }
        }
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
    }; const handleSimulatePayment = async (id: string) => {
        try {
            await updateAppointmentPaymentStatus(id, 'escrow');
            Alert.alert('Betaling geslaagd!', 'Het geld wordt veilig vastgehouden in escrow tot de les is voltooid.');
        } catch (error) {
            console.error('Error simulating payment:', error);
            Alert.alert('Fout', 'Kon de betaling niet verwerken.');
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
                    const isReviewed = isMeAsTutor ? item.reviewedByTutor : item.reviewedByStudent;
                    if (item.status === 'completed' && !isReviewed) {
                        handleOpenReview(item);
                    } else if (navigation) {
                        navigation.navigate('AppointmentDetail', { appointment: item });
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.personContainer}>
                        <Avatar
                            uri={isMeAsTutor ? item.studentAvatar : item.tutorAvatar}
                            name={otherName}
                            size={44}
                            style={styles.avatarPlaceholder}
                        />
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.subjectText} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.personNameText} numberOfLines={1}>Afspraak met {otherName}</Text>
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
                        <Text style={styles.detailText}>{item.time} ({item.duration || 1}u)</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={authColors.muted} />
                        <Text style={styles.detailText}>{item.address || item.location}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: item.type === 'swap' ? '#7C3AED' : '#22C55E', fontWeight: '800', fontSize: 18 }}>
                            {item.type === 'swap' ? 'Ruil' : `€${item.price || 0}`}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={[
                        { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
                        item.type === 'swap' ? { backgroundColor: 'rgba(124, 58, 237, 0.1)' } :
                            (item.paymentStatus === 'escrow' ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } :
                                item.paymentStatus === 'released' ? { backgroundColor: 'rgba(16, 185, 129, 0.1)' } :
                                    { backgroundColor: 'rgba(255, 255, 255, 0.05)' })
                    ]}>
                        <Ionicons
                            name={item.type === 'swap' ? "swap-horizontal" : (item.paymentStatus === 'released' ? "checkmark-circle" : "shield-checkmark-outline")}
                            size={14}
                            color={item.type === 'swap' ? "#7C3AED" : (item.paymentStatus === 'released' ? "#10B981" : item.paymentStatus === 'escrow' ? "#3B82F6" : "#94A3B8")}
                            style={{ marginRight: 4 }}
                        />
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: item.type === 'swap' ? "#7C3AED" : (item.paymentStatus === 'released' ? "#10B981" : item.paymentStatus === 'escrow' ? "#3B82F6" : "#94A3B8")
                        }}>
                            {item.type === 'swap' ? 'GEEN BETALING NODIG' :
                                (item.paymentStatus === 'released' ? 'BETAALD' :
                                    item.paymentStatus === 'escrow' ? 'IN ESCROW' : 'NIET BETAALD')}
                        </Text>
                    </View>
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
                        {(!isMeAsTutor && item.type === 'pay' && (item.paymentStatus === 'none' || item.paymentStatus === 'pending')) ? (
                            <TouchableOpacity
                                style={[styles.acceptButton, { backgroundColor: '#3B82F6' }]}
                                onPress={() => handleSimulatePayment(item.id)}
                            >
                                <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.acceptButtonText}>Nu Betalen (€{item.price})</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => handleUpdateAppointmentStatus(item.id, 'cancelled')}
                                >
                                    <Text style={styles.cancelButtonText}>Annuleren</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.acceptButton, (item.type === 'pay' && (item.paymentStatus === 'none' || item.paymentStatus === 'pending') && !isMeAsTutor) && { opacity: 0.5 }]}
                                    onPress={() => {
                                        if (item.type === 'pay' && (item.paymentStatus === 'none' || item.paymentStatus === 'pending') && !isMeAsTutor) {
                                            Alert.alert('Betaal eerst', 'Je moet de afspraak eerst betalen voordat je deze kunt afronden.');
                                            return;
                                        }
                                        if (navigation) {
                                            navigation.navigate('AppointmentDetail', { appointment: item });
                                        } else {
                                            // Safety check for fallback completion
                                            if (item.dateKey && item.endTimeMinutes) {
                                                const [year, month, day] = item.dateKey.split('-').map(Number);
                                                const appointmentEnd = new Date(year, month - 1, day);
                                                appointmentEnd.setMinutes(item.endTimeMinutes);
                                                if (new Date() < appointmentEnd) {
                                                    Alert.alert('Te vroeg', 'Je kunt de afspraak pas afronden nadat deze is afgelopen.');
                                                    return;
                                                }
                                            }
                                            handleUpdateAppointmentStatus(item.id, 'completed');
                                        }
                                    }}
                                >
                                    <Text style={styles.acceptButtonText}>Details & Afronden</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                {item.status === 'completed' && (
                    <View style={styles.actionButtons}>
                        {((isMeAsTutor && !item.reviewedByTutor) || (!isMeAsTutor && !item.reviewedByStudent)) ? (
                            <TouchableOpacity style={styles.reviewButton} onPress={() => handleOpenReview(item)}>
                                <Ionicons name="star-outline" size={16} color={authColors.accent} />
                                <Text style={styles.reviewButtonText}>Review achterlaten</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.reviewButton, { borderColor: 'rgba(148, 163, 184, 0.2)' }]}>
                                <Ionicons name="checkmark-circle-outline" size={16} color={authColors.muted} />
                                <Text style={[styles.reviewButtonText, { color: authColors.muted }]}>Review gegeven</Text>
                            </View>
                        )}
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
                                        style={[styles.modalSubmitButton, submittingReview && { opacity: 0.7 }]}
                                        onPress={handleSubmitReview}
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? (
                                            <ActivityIndicator size="small" color={authColors.text} />
                                        ) : (
                                            <Text style={styles.modalSubmitText}>Verzenden</Text>
                                        )}
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
        marginRight: 8,
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
