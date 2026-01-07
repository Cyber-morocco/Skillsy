import React, { useState, useEffect } from 'react';
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
import { scheduleMatchStyles as styles, scheduleMatchColors } from '../styles/ScheduleMatchStyles';
import { fetchUserAvailability } from '../services/userService';
import { createAppointment } from '../services/appointmentService';
import { auth } from '../config/firebase';
import { AvailabilityDay } from '../types';

interface PersonAvailability {
    name: string;
    times: string[];
}

interface DayAvailability {
    day: string;
    people: PersonAvailability[];
}

interface ScheduleMatchScreenProps {
    contactId: string;
    contactName: string;
    contactInitials: string;
    contactColor: string;
    contactSubtitle?: string;
    onBack: () => void;
    onMatch?: (day: string, time: string) => void;
}

export default function ScheduleMatchScreen({
    contactId,
    contactName,
    contactInitials,
    contactColor,
    contactSubtitle,
    onBack,
    onMatch,
}: ScheduleMatchScreenProps) {
    const [loading, setLoading] = useState(true);
    const [availabilityData, setAvailabilityData] = useState<DayAvailability[]>([]);

    useEffect(() => {
        const loadAvailability = async () => {
            try {
                const currentUserId = auth.currentUser?.uid;
                if (!currentUserId) return;

                const [myAvail, contactAvail] = await Promise.all([
                    fetchUserAvailability(currentUserId),
                    fetchUserAvailability(contactId)
                ]);

                const combined: DayAvailability[] = myAvail.map((myDay, index) => {
                    const contactDay = contactAvail[index];
                    const people: PersonAvailability[] = [];

                    if (myDay.enabled) {
                        people.push({
                            name: 'Jij',
                            times: [`${myDay.start} - ${myDay.end}`]
                        });
                    }

                    if (contactDay.enabled) {
                        people.push({
                            name: contactName,
                            times: [`${contactDay.start} - ${contactDay.end}`]
                        });
                    }

                    return {
                        day: myDay.name,
                        people
                    };
                }).filter(day => day.people.length > 0); // Only show days where at least one is available

                setAvailabilityData(combined);
            } catch (error) {
                console.error('Error loading availability:', error);
                Alert.alert('Fout', 'Kon beschikbaarheid niet laden.');
            } finally {
                setLoading(false);
            }
        };

        loadAvailability();
    }, [contactId, contactName]);

    const handleMatch = async (dayData: DayAvailability) => {
        // Simple logic: pick the first available time slot overlapping or just the contact's slot
        const mySlot = dayData.people.find(p => p.name === 'Jij');
        const contactSlot = dayData.people.find(p => p.name === contactName);

        const timeToMatch = contactSlot ? contactSlot.times[0] : (mySlot ? mySlot.times[0] : '10:00 - 11:00');

        try {
            const currentUserId = auth.currentUser?.uid;
            if (!currentUserId) return;

            // Calculate the next occurrence of this day
            const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
            const targetDayIndex = dayNames.indexOf(dayData.day);
            const today = new Date();
            const todayIndex = today.getDay();
            let daysUntil = targetDayIndex - todayIndex;
            if (daysUntil <= 0) daysUntil += 7; // Next week if today or past

            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysUntil);
            const formattedDate = targetDate.toLocaleDateString('nl-BE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            await createAppointment({
                tutorId: contactId,
                studentId: currentUserId,
                participantIds: [currentUserId, contactId],
                tutorName: contactName,
                studentName: auth.currentUser?.displayName || 'Gebruiker',
                title: contactSubtitle || 'Skill Swap',
                subtitle: `Afspraak met ${contactName}`,
                date: formattedDate,
                time: timeToMatch,
                location: 'fysiek',
                status: 'pending',
                initials: contactInitials,
            });

            if (onMatch) {
                onMatch(dayData.day, timeToMatch);
            } else {
                Alert.alert(
                    'Match verzonden!',
                    `Je hebt ${formattedDate} om ${timeToMatch} geselecteerd. We sturen een verzoek naar ${contactName}.`,
                    [{ text: 'OK', onPress: onBack }]
                );
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            Alert.alert('Fout', 'Kon afspraak niet inplannen.');
        }
    };

    const renderDayCard = (dayData: DayAvailability) => {
        const isMutual = dayData.people.length > 1;

        return (
            <View key={dayData.day} style={[styles.dayCard, isMutual && { borderColor: scheduleMatchColors.primary, borderWidth: 1 }]}>
                <View style={styles.dayCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.dayName}>{dayData.day}</Text>
                        {isMutual && (
                            <View style={{ backgroundColor: scheduleMatchColors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
                                <Text style={{ color: '#000', fontSize: 10, fontWeight: '700' }}>MUTUAL</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.matchButton, !isMutual && { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}
                        onPress={() => handleMatch(dayData)}
                    >
                        <Text style={[styles.matchButtonText, !isMutual && { color: scheduleMatchColors.textSecondary }]}>
                            Match
                        </Text>
                    </TouchableOpacity>
                </View>

                {dayData.people.map((person, index) => (
                    <View key={index} style={styles.personSlot}>
                        <Ionicons
                            name="time-outline"
                            size={16}
                            color={scheduleMatchColors.textSecondary}
                            style={styles.clockIcon}
                        />
                        <View style={styles.slotInfo}>
                            <Text style={styles.personName}>{person.name}</Text>
                            <Text style={styles.timeSlot}>{person.times.join(', ')}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={scheduleMatchColors.text} />
                </TouchableOpacity>
                <View style={[styles.contactAvatar, { backgroundColor: contactColor }]}>
                    <Text style={styles.contactInitials}>{contactInitials}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.contactName}>{contactName}</Text>
                    {contactSubtitle && (
                        <Text style={styles.contactSubtitle}>{contactSubtitle}</Text>
                    )}
                </View>
            </View>

            <View style={styles.titleSection}>
                <Text style={styles.title}>Beschikbaarheid vergelijken</Text>
                <Text style={styles.subtitle}>Vind een moment dat voor jullie beiden werkt</Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={scheduleMatchColors.primary} />
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {availabilityData.length > 0 ? (
                        availabilityData.map(renderDayCard)
                    ) : (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: scheduleMatchColors.textSecondary, textAlign: 'center' }}>
                                Geen overlappende beschikbaarheid gevonden. Pas je weekplanning aan in je profiel.
                            </Text>
                        </View>
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>
            )}

        </SafeAreaView>
    );
}
