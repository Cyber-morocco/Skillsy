import React from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { appointmentDetailStyles as styles } from '../styles/AppointmentDetailStyles';

export interface AppointmentData {
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
    address?: string;
    description?: string;
    tutorPhone?: string;
    tutorEmail?: string;
}

interface AppointmentDetailScreenProps {
    appointment: AppointmentData;
    onBack: () => void;
    onCancel?: () => void;
    onReschedule?: () => void;
}

export default function AppointmentDetailScreen({
    appointment,
    onBack,
    onCancel,
    onReschedule,
}: AppointmentDetailScreenProps) {
    const isConfirmed = appointment.status === 'confirmed';
    const isPast = !onCancel && !onReschedule;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
                            isPast ? styles.statusConfirmed : (isConfirmed ? styles.statusConfirmed : styles.statusPending)
                        ]}>
                            <Text style={[
                                styles.statusText,
                                isPast ? styles.statusConfirmedText : (isConfirmed ? styles.statusConfirmedText : styles.statusPendingText)
                            ]}>
                                {isPast ? 'Voltooid' : (isConfirmed ? 'Bevestigd' : 'In afwachting')}
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
                        {onReschedule && (
                            <TouchableOpacity
                                style={styles.rescheduleButton}
                                onPress={onReschedule}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.rescheduleButtonText}>Verzetten</Text>
                            </TouchableOpacity>
                        )}
                        {onCancel && (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Annuleren</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}
