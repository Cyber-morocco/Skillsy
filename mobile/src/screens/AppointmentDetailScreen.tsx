import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { appointmentDetailStyles as styles } from '../styles/AppointmentDetailStyles';
import { Appointment } from '../types';
import { scheduleMatchColors } from '../styles/ScheduleMatchStyles';
import { updateAppointmentStatus, updateAppointmentConfirmations, updateAppointmentPaymentStatus } from '../services/appointmentService';
import { Avatar } from '../components/Avatar';
import { auth } from '../config/firebase';

interface AppointmentDetailScreenProps {
    route?: {
        params: {
            appointment: Appointment;
        }
    };
    navigation?: any;
    // Keeping these for potential direct use, but we'll prioritize route.params
    appointment?: Appointment;
    onBack?: () => void;
}

export default function AppointmentDetailScreen({
    route,
    navigation,
    appointment: directAppointment,
    onBack: directOnBack,
}: AppointmentDetailScreenProps) {
    const appointment = route?.params?.appointment || directAppointment;
    const [cancelling, setCancelling] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const isMeAsTutor = appointment?.tutorId === auth.currentUser?.uid;
    const otherAvatar = isMeAsTutor ? appointment?.studentAvatar : appointment?.tutorAvatar;
    const otherName = isMeAsTutor ? appointment?.studentName : appointment?.tutorName;

    if (!appointment) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>Geen afspraak gegevens gevonden.</Text>
            </SafeAreaView>
        );
    }

    const handleBack = () => {
        if (navigation) {
            navigation.goBack();
        } else if (directOnBack) {
            directOnBack();
        }
    };

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await updateAppointmentStatus(appointment.id, 'cancelled');
            Alert.alert('Geannuleerd', 'De afspraak is geannuleerd.');
            handleBack();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            Alert.alert('Fout', 'Kon de afspraak niet annuleren.');
        } finally {
            setCancelling(false);
        }
    };

    const handleConfirmLesson = async () => {
        setConfirming(true);
        try {
            const role = isMeAsTutor ? 'tutor' : 'student';
            await updateAppointmentConfirmations(appointment.id, role);

            // Check if both now confirmed
            const updatedConfirmations = {
                ...appointment.confirmations,
                studentConfirmed: role === 'student' ? true : appointment.confirmations?.studentConfirmed,
                tutorConfirmed: role === 'tutor' ? true : appointment.confirmations?.tutorConfirmed
            };

            if (updatedConfirmations.studentConfirmed && updatedConfirmations.tutorConfirmed) {
                // Release funds and complete
                await updateAppointmentPaymentStatus(appointment.id, 'released');
                await updateAppointmentStatus(appointment.id, 'completed');
                Alert.alert('Les Voltooid!', 'Beide partijen hebben bevestigd. Het geld is vrijgegeven naar de docent.');
                handleBack();
            } else {
                Alert.alert('Bevestigd', 'Je hebt de les bevestigd. Zodra de andere partij ook bevestigt, wordt de les afgerond en de betaling vrijgegeven.');
            }
        } catch (error) {
            console.error('Error confirming lesson:', error);
            Alert.alert('Fout', 'Kon de bevestiging niet verwerken.');
        } finally {
            setConfirming(false);
        }
    };

    const isConfirmed = appointment.status === 'confirmed';
    const isPast = appointment.status === 'completed' || appointment.status === 'cancelled';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Afspraak details</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.mainCard}>
                    <View style={styles.cardHeader}>
                        <Avatar
                            uri={otherAvatar}
                            name={otherName || 'Gebruiker'}
                            size={64}
                            style={styles.avatarLarge}
                        />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{appointment.title}</Text>
                            <Text style={styles.subtitle}>{appointment.subtitle}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            appointment.status === 'confirmed' ? styles.statusConfirmed :
                                appointment.status === 'pending' ? styles.statusPending : styles.statusPast
                        ]}>
                            <Text style={[
                                styles.statusText,
                                appointment.status === 'confirmed' ? styles.statusConfirmedText :
                                    appointment.status === 'pending' ? styles.statusPendingText : styles.statusPastText
                            ]}>
                                {appointment.status === 'confirmed' ? 'Bevestigd' :
                                    appointment.status === 'pending' ? 'In afwachting' :
                                        appointment.status === 'completed' ? 'Voltooid' : 'Geannuleerd'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Datum & Tijd</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Datum</Text>
                            <Text style={styles.detailValue}>{appointment.date}</Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Tijd</Text>
                            <Text style={styles.detailValue}>{appointment.time}</Text>
                        </View>
                    </View>
                </View>

                {appointment.type === 'swap' && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Skill Swap (Ruilen)</Text>
                        <View style={styles.detailRow}>
                            <Ionicons name="swap-horizontal" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Ruil-vaardigheid van {appointment.studentName}</Text>
                                <Text style={styles.detailValue}>{appointment.swapSkillName || 'Onbekend'}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="school-outline" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Tegenprestatie van {appointment.tutorName}</Text>
                                <Text style={styles.detailValue}>{appointment.title}</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Locatie</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Type</Text>
                            <Text style={styles.detailValue}>
                                {appointment.location === 'fysiek' ? 'Fysieke afspraak' : 'Online sessie'}
                            </Text>
                        </View>
                    </View>
                    {appointment.location === 'fysiek' && appointment.address && (
                        <View style={styles.detailRow}>
                            <Ionicons name="home-outline" size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Adres</Text>
                                <Text style={styles.detailValue}>{appointment.address}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={[styles.sectionCard, appointment.type !== 'swap' && appointment.paymentStatus === 'none' && { borderColor: '#F59E0B', borderWidth: 1 }]}>
                    <Text style={styles.sectionTitle}>Betaling & Escrow</Text>
                    {appointment.type !== 'swap' && appointment.paymentStatus === 'none' && (
                        <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="warning-outline" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#F59E0B', fontSize: 13, flex: 1, fontWeight: '600' }}>
                                LET OP: Je moet de les betalen vóór het begin van de cursus, anders wordt deze automatisch geannuleerd.
                            </Text>
                        </View>
                    )}
                    <View style={styles.feeBox}>
                        <View>
                            <Text style={styles.feeLabel}>{appointment.type === 'swap' ? 'Transactie' : 'Totaalbedrag'}</Text>
                            <Text style={styles.feeAmount}>{appointment.type === 'swap' ? 'Skill Swap' : `€${appointment.price || appointment.fee || 0}`}</Text>
                        </View>
                        <View style={[
                            { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
                            appointment.paymentStatus === 'escrow' ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } :
                                appointment.paymentStatus === 'released' ? { backgroundColor: 'rgba(16, 185, 129, 0.1)' } :
                                    { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                        ]}>
                            <Ionicons
                                name={appointment.paymentStatus === 'released' ? "checkmark-circle" : "shield-checkmark-outline"}
                                size={16}
                                color={appointment.paymentStatus === 'released' ? "#10B981" : appointment.paymentStatus === 'escrow' ? "#3B82F6" : "#94A3B8"}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={{
                                fontSize: 12,
                                fontWeight: '800',
                                color: appointment.type === 'swap' ? scheduleMatchColors.primary : (appointment.paymentStatus === 'released' ? "#10B981" : appointment.paymentStatus === 'escrow' ? "#3B82F6" : "#94A3B8")
                            }}>
                                {appointment.type === 'swap' ? 'RUIL' :
                                    (appointment.paymentStatus === 'released' ? 'BETAALD' :
                                        appointment.paymentStatus === 'escrow' ? 'IN ESCROW' : 'NIET BETAALD')}
                            </Text>
                        </View>
                    </View>
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 12, fontStyle: 'italic' }}>
                        {appointment.type === 'swap'
                            ? 'Bij een Skill Swap worden geen geldbedragen uitgewisseld. Beide partijen bevestigen de les na afloop voor hun reputatie.'
                            : (appointment.paymentStatus === 'escrow'
                                ? 'Het bedrag wordt veilig vastgehouden en pas vrijgegeven nadat beide partijen de les als voltooid hebben gemarkeerd.'
                                : appointment.paymentStatus === 'released'
                                    ? 'De betaling is succesvol verwerkt en overgemaakt naar de docent.'
                                    : 'De student moet de afspraak nog betalen vóór aanvang van de les.')}
                    </Text>
                </View>

                {isConfirmed && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Bevestiging Voltooiing</Text>
                        <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                                <Text style={{ color: '#F8FAFC', fontSize: 14 }}>Student: {appointment.studentName}</Text>
                                <Ionicons
                                    name={appointment.confirmations?.studentConfirmed ? "checkmark-circle" : "time-outline"}
                                    size={24}
                                    color={appointment.confirmations?.studentConfirmed ? "#10B981" : "#94A3B8"}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                                <Text style={{ color: '#F8FAFC', fontSize: 14 }}>Docent: {appointment.tutorName}</Text>
                                <Ionicons
                                    name={appointment.confirmations?.tutorConfirmed ? "checkmark-circle" : "time-outline"}
                                    size={24}
                                    color={appointment.confirmations?.tutorConfirmed ? "#10B981" : "#94A3B8"}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {appointment.description && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Beschrijving</Text>
                        <Text style={styles.description}>{appointment.description}</Text>
                    </View>
                )}

                {isConfirmed && (
                    <View style={styles.actionsSection}>
                        <TouchableOpacity
                            style={[
                                { flex: 1, backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
                                ((isMeAsTutor && appointment.confirmations?.tutorConfirmed) || (!isMeAsTutor && appointment.confirmations?.studentConfirmed)) && { opacity: 0.5 }
                            ]}
                            onPress={handleConfirmLesson}
                            disabled={confirming || (isMeAsTutor ? appointment.confirmations?.tutorConfirmed : appointment.confirmations?.studentConfirmed)}
                        >
                            {confirming ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                                        {((isMeAsTutor && appointment.confirmations?.tutorConfirmed) || (!isMeAsTutor && appointment.confirmations?.studentConfirmed))
                                            ? 'Al Bevestigd'
                                            : 'Les Bevestigen'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {!((isMeAsTutor && appointment.confirmations?.tutorConfirmed) || (!isMeAsTutor && appointment.confirmations?.studentConfirmed)) && (
                            <TouchableOpacity
                                style={[styles.cancelButton, { marginTop: 12 }]}
                                onPress={() => Alert.alert('Annuleren', 'Weet je zeker dat je deze afspraak wilt annuleren?', [
                                    { text: 'Nee' },
                                    { text: 'Ja', onPress: handleCancel }
                                ])}
                                activeOpacity={0.8}
                                disabled={cancelling}
                            >
                                <Text style={styles.cancelButtonText}>Afspraak Annuleren</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}
