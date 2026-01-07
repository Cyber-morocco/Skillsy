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
import { updateAppointmentStatus } from '../services/appointmentService';

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
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarTextLarge}>{appointment.initials}</Text>
                        </View>
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

                {appointment.fee && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Betaling</Text>
                        <View style={styles.feeBox}>
                            <Text style={styles.feeLabel}>Vergoeding</Text>
                            <Text style={styles.feeAmount}>€{appointment.fee}</Text>
                        </View>
                    </View>
                )}

                {appointment.description && (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Beschrijving</Text>
                        <Text style={styles.description}>{appointment.description}</Text>
                    </View>
                )}

                {!isPast && (
                    <View style={styles.actionsSection}>
                        <TouchableOpacity
                            style={styles.rescheduleButton}
                            onPress={() => Alert.alert('Verzetten', 'Deze functie komt binnenkort.')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.rescheduleButtonText}>Verzetten</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cancelButton, cancelling && { opacity: 0.6 }]}
                            onPress={() => Alert.alert('Annuleren', 'Weet je zeker dat je deze afspraak wilt annuleren?', [
                                { text: 'Nee' },
                                { text: 'Ja', onPress: handleCancel }
                            ])}
                            activeOpacity={0.8}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Text style={styles.cancelButtonText}>Annuleren</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}
