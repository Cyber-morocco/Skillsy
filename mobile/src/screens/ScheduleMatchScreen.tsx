import React, { useState, useEffect } from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scheduleMatchStyles as styles, scheduleMatchColors } from '../styles/ScheduleMatchStyles';
import { fetchUserAvailability, fetchOtherUserSpecificDates, subscribeToOtherUserProfile, fetchOtherUserSkills } from '../services/userService';
import { createAppointment, fetchAppointmentsByDate, isOverlapping } from '../services/appointmentService';
import { auth } from '../config/firebase';
import { AvailabilityDay, UserProfile, Skill, Appointment } from '../types';

interface PersonAvailability {
    name: string;
    times: { start: string, end: string }[];
}

interface MatchEntry {
    date: Date;
    formattedDate: string;
    dayName: string;
    people: PersonAvailability[];
}

interface ScheduleMatchScreenProps {
    contactId: string;
    contactName: string;
    contactInitials: string;
    contactColor: string;
    contactSubtitle?: string;
    onBack: () => void;
    onMatch?: (day: string, time: string, duration: number, price: number, type: 'pay' | 'swap', swapSkillName?: string, tutorSkillName?: string, dateKey?: string) => void;
    initialData?: {
        duration?: number;
        price?: number;
        type?: 'pay' | 'swap';
        swapSkillName?: string;
        tutorSkillName?: string;
    };
}

export default function ScheduleMatchScreen({
    contactId,
    contactName,
    contactInitials,
    contactColor,
    contactSubtitle,
    onBack,
    onMatch,
    initialData,
}: ScheduleMatchScreenProps) {
    const [loading, setLoading] = useState(true);
    const [rawAvailability, setRawAvailability] = useState<{
        me: { mode: string, weekly: AvailabilityDay[], specific: any[] },
        other: { mode: string, weekly: AvailabilityDay[], specific: any[] }
    } | null>(null);
    const [matchedDates, setMatchedDates] = useState<MatchEntry[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<MatchEntry | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedDuration, setSelectedDuration] = useState(initialData?.duration || 1);
    const [proposedPrice, setProposedPrice] = useState('');
    const [tutorSkills, setTutorSkills] = useState<Skill[]>([]);
    const [mySkills, setMySkills] = useState<Skill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [selectedMySkill, setSelectedMySkill] = useState<Skill | null>(null);
    const [matchType, setMatchType] = useState<'pay' | 'swap'>(initialData?.type || 'pay');
    const [existingAppointments, setExistingAppointments] = useState<{ [dateKey: string]: Appointment[] }>({});

    useEffect(() => {
        const loadAllAvailability = async () => {
            try {
                const myId = auth.currentUser?.uid;
                if (!myId) return;

                // Fetch skills and availability
                const [myWeekly, otherWeekly, mySpecific, otherSpecific, skills, studentSkills] = await Promise.all([
                    fetchUserAvailability(myId),
                    fetchUserAvailability(contactId),
                    fetchOtherUserSpecificDates(myId),
                    fetchOtherUserSpecificDates(contactId),
                    fetchOtherUserSkills(contactId),
                    fetchOtherUserSkills(myId)
                ]);

                setTutorSkills(skills);
                setMySkills(studentSkills);
                if (skills.length > 0) {
                    const initialTutorSkill = initialData?.tutorSkillName
                        ? skills.find(s => s.subject === initialData.tutorSkillName) || skills[0]
                        : skills[0];
                    setSelectedSkill(initialTutorSkill);
                    setProposedPrice(initialTutorSkill.price || '25');
                }
                if (studentSkills.length > 0) {
                    const initialSkill = initialData?.swapSkillName
                        ? studentSkills.find(s => s.subject === initialData.swapSkillName) || studentSkills[0]
                        : studentSkills[0];
                    setSelectedMySkill(initialSkill);
                }

                // We need to get the availabilityMode from profile snapshots or fetch them
                // For simplicity here, let's assume availabilityMode is fetched with profile
                const getMode = (profile: any) => profile?.availabilityMode || 'weekly';

                // We'll use a temporary hack or extend userService to get mode directly
                // Actually, let's just use the presence of specific dates as a hint or default to weekly
                // But better to use the profile.

                setRawAvailability({
                    me: { mode: 'weekly', weekly: myWeekly, specific: mySpecific },
                    other: { mode: 'weekly', weekly: otherWeekly, specific: otherSpecific }
                });

                // Real implementation: subscribe to both profiles to get their modes
                const unsubMe = subscribeToOtherUserProfile(myId, (p) => {
                    setRawAvailability(prev => prev ? { ...prev, me: { ...prev.me, mode: p.availabilityMode || 'weekly' } } : null);
                });
                const unsubOther = subscribeToOtherUserProfile(contactId, (p) => {
                    setRawAvailability(prev => prev ? { ...prev, other: { ...prev.other, mode: p.availabilityMode || 'weekly' } } : null);
                });

                setLoading(false);
                return () => { unsubMe(); unsubOther(); };
            } catch (error) {
                console.error('Error loading availability:', error);
                setLoading(false);
            }
        };

        const loadExistingAppointments = async () => {
            const myId = auth.currentUser?.uid;
            if (!myId) return;

            const dates: string[] = [];
            const today = new Date();
            for (let i = 0; i < 14; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                dates.push(d.toISOString().split('T')[0]);
            }

            const appointmentsMap: { [dateKey: string]: Appointment[] } = {};

            // This is a bit heavy (2 requests per day per user). 
            // Better would be a bulk fetch for 14 days.
            // But let's stick to the current service structure or optimize.
            // Let's do a single promise per user for all 14 days if possible.
            // Actually, fetchAppointmentsByDate already Existe.

            await Promise.all(dates.map(async (dateKey) => {
                const [myApps, otherApps] = await Promise.all([
                    fetchAppointmentsByDate(myId, dateKey),
                    fetchAppointmentsByDate(contactId, dateKey)
                ]);
                appointmentsMap[dateKey] = [...myApps, ...otherApps];
            }));

            setExistingAppointments(appointmentsMap);
        };

        loadAllAvailability();
        loadExistingAppointments();
    }, [contactId]);

    // Live filtering when duration or rawAvailability changes
    useEffect(() => {
        if (!rawAvailability) return;

        const generateMatches = () => {
            const matches: MatchEntry[] = [];
            const today = new Date();
            const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dayName = dayNames[date.getDay()];
                const dateKey = date.toISOString().split('T')[0];

                const getSlotsForUser = (user: any) => {
                    if (user.mode === 'specific') {
                        const specific = user.specific.find((s: any) => s.date.toISOString().split('T')[0] === dateKey);
                        return specific ? [{ start: specific.start, end: specific.end }] : [];
                    } else {
                        const weekly = user.weekly.find((w: any) => w.name === dayName);
                        return weekly && weekly.enabled ? [{ start: weekly.start, end: weekly.end }] : [];
                    }
                };

                const mySlots = getSlotsForUser(rawAvailability.me);
                const otherSlots = getSlotsForUser(rawAvailability.other);

                if (mySlots.length > 0 || otherSlots.length > 0) {
                    matches.push({
                        date,
                        dayName,
                        formattedDate: date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' }),
                        people: [
                            { name: 'Jij', times: mySlots },
                            { name: contactName, times: otherSlots }
                        ]
                    });
                }
            }

            // Filter live only those that HAVE a valid overlap for the duration
            const validMatches = matches.filter(m => calculateOverlaps(m).length > 0);
            setMatchedDates(validMatches);
        };

        generateMatches();
    }, [rawAvailability, selectedDuration, existingAppointments]);

    const calculateOverlaps = (entry: MatchEntry): string[] => {
        const mySlot = entry.people[0].times[0];
        const otherSlot = entry.people[1].times[0];

        if (!mySlot || !otherSlot) return [];

        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        const dateKey = entry.date.toISOString().split('T')[0];
        const dayAppointments = existingAppointments[dateKey] || [];

        const myStart = parseTime(mySlot.start);
        const myEnd = parseTime(mySlot.end);
        const otherStart = parseTime(otherSlot.start);
        const otherEnd = parseTime(otherSlot.end);

        const start = Math.max(myStart, otherStart);
        const end = Math.min(myEnd, otherEnd);
        const durationMins = selectedDuration * 60;

        if (start + durationMins > end) return [];

        const slots: string[] = [];
        let current = start;
        while (current + durationMins <= end) {
            const format = (mins: number) => {
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            };

            const currentEnd = current + durationMins;

            // Check if this specific slot overlaps with an existing appointment
            if (!isOverlapping(current, currentEnd, dayAppointments)) {
                slots.push(`${format(current)} - ${format(currentEnd)}`);
            }

            current += 30; // 30 min steps
        }
        return slots;
    };

    const handleMatchPress = (entry: MatchEntry) => {
        const slots = calculateOverlaps(entry);
        setAvailableSlots(slots);
        setSelectedMatch(entry);
        setModalVisible(true);
    };

    const confirmMatch = async (timeSlot: string) => {
        if (!selectedMatch) return;

        if (matchType === 'pay') {
            const price = parseFloat(proposedPrice);
            if (isNaN(price) || price <= 0) {
                Alert.alert('Fout', 'Voer un geldig bedrag in.');
                return;
            }
            if (price > 15) {
                Alert.alert('Limiët bereikt', 'De maximum prijs voor een les is €15.');
                return;
            }
        }

        setModalVisible(false);

        try {
            const myId = auth.currentUser?.uid;
            if (!myId) return;

            const fullFormattedDate = selectedMatch.date.toLocaleDateString('nl-BE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });

            const dateKey = selectedMatch.date.toISOString().split('T')[0];
            const [startStr, endStr] = timeSlot.split(' - ');
            const parseTime = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };

            await createAppointment({
                tutorId: contactId,
                studentId: myId,
                participantIds: [myId, contactId],
                tutorName: contactName,
                studentName: auth.currentUser?.displayName || 'Gebruiker',
                title: selectedSkill?.subject || contactSubtitle || 'Skill Swap',
                subtitle: `Les ${selectedSkill?.subject || ''} met ${contactName}`,
                date: fullFormattedDate,
                dateKey: dateKey,
                time: timeSlot,
                startTimeMinutes: parseTime(startStr),
                endTimeMinutes: parseTime(endStr),
                duration: selectedDuration,
                price: matchType === 'pay' ? (parseFloat(proposedPrice) || 0) : 0,
                type: matchType,
                swapSkillId: matchType === 'swap' ? selectedMySkill?.id : undefined,
                swapSkillName: matchType === 'swap' ? selectedMySkill?.subject : undefined,
                location: 'fysiek',
                status: 'pending',
                paymentStatus: 'none',
                confirmations: {
                    studentConfirmed: false,
                    tutorConfirmed: false
                },
                initials: contactInitials,
            });

            if (onMatch) {
                onMatch(fullFormattedDate, timeSlot, selectedDuration, matchType === 'pay' ? (parseFloat(proposedPrice) || 0) : 0, matchType, selectedMySkill?.subject, selectedSkill?.subject, dateKey);
            } else {
                const message = matchType === 'pay'
                    ? `Verzoek verzonden naar ${contactName} voor ${fullFormattedDate}.`
                    : `Ruilverzoek voor ${selectedMySkill?.subject} verzonden naar ${contactName} voor ${fullFormattedDate}.`;
                Alert.alert('Match verzonden!', message, [{ text: 'OK', onPress: onBack }]);
            }
        } catch (error) {
            console.error('Error creating match:', error);
            Alert.alert('Fout', 'Kon afspraak niet inplannen.');
        }
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
                    {contactSubtitle && <Text style={styles.contactSubtitle}>{contactSubtitle}</Text>}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Hoe wil je matchen?</Text>
                </View>

                <View style={{ flexDirection: 'row', paddingHorizontal: 0, gap: 10, marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => setMatchType('pay')}
                        style={{
                            flex: 1, paddingVertical: 12, borderRadius: 12,
                            backgroundColor: matchType === 'pay' ? scheduleMatchColors.primary : 'rgba(255,255,255,0.05)',
                            alignItems: 'center', borderWidth: 1,
                            borderColor: matchType === 'pay' ? scheduleMatchColors.primary : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <Ionicons name="card-outline" size={20} color={matchType === 'pay' ? '#000' : '#F8FAFC'} />
                        <Text style={{ color: matchType === 'pay' ? '#000' : '#F8FAFC', fontWeight: '700', marginTop: 4 }}>Betalen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setMatchType('swap')}
                        style={{
                            flex: 1, paddingVertical: 12, borderRadius: 12,
                            backgroundColor: matchType === 'swap' ? scheduleMatchColors.primary : 'rgba(255,255,255,0.05)',
                            alignItems: 'center', borderWidth: 1,
                            borderColor: matchType === 'swap' ? scheduleMatchColors.primary : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <Ionicons name="repeat-outline" size={20} color={matchType === 'swap' ? '#000' : '#F8FAFC'} />
                        <Text style={{ color: matchType === 'swap' ? '#000' : '#F8FAFC', fontWeight: '700', marginTop: 4 }}>Ruilen (Swap)</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.titleSection, { paddingHorizontal: 0 }]}>
                    <Text style={styles.title}>Wat wil je leren?</Text>
                    <Text style={styles.subtitle}>Kies een vaardigheid van {contactName}</Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0, gap: 10 }}>
                        {tutorSkills.map((skill) => (
                            <TouchableOpacity
                                key={skill.id}
                                onPress={() => {
                                    setSelectedSkill(skill);
                                }}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    backgroundColor: selectedSkill?.id === skill.id ? scheduleMatchColors.primary : 'rgba(255,255,255,0.05)',
                                    borderWidth: 1,
                                    borderColor: selectedSkill?.id === skill.id ? scheduleMatchColors.primary : 'rgba(255,255,255,0.1)',
                                    minWidth: 100,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: selectedSkill?.id === skill.id ? '#000' : '#F8FAFC', fontWeight: '700', fontSize: 14 }}>
                                    {skill.subject}
                                </Text>
                                <Text style={{ color: selectedSkill?.id === skill.id ? 'rgba(0,0,0,0.6)' : '#94A3B8', fontSize: 11, marginTop: 2 }}>
                                    {skill.level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {matchType === 'swap' && (
                    <>
                        <View style={[styles.titleSection, { paddingHorizontal: 0 }]}>
                            <Text style={styles.title}>Wat bied je aan?</Text>
                            <Text style={styles.subtitle}>Kies een vaardigheid om terug te leren</Text>
                        </View>

                        <View style={{ marginBottom: 24 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 0, gap: 10 }}>
                                {mySkills.map((skill) => (
                                    <TouchableOpacity
                                        key={skill.id}
                                        onPress={() => setSelectedMySkill(skill)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            borderRadius: 12,
                                            backgroundColor: selectedMySkill?.id === skill.id ? scheduleMatchColors.primary : 'rgba(255,255,255,0.05)',
                                            borderWidth: 1,
                                            borderColor: selectedMySkill?.id === skill.id ? scheduleMatchColors.primary : 'rgba(255,255,255,0.1)',
                                            minWidth: 100,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{ color: selectedMySkill?.id === skill.id ? '#000' : '#F8FAFC', fontWeight: '700', fontSize: 14 }}>
                                            {skill.subject}
                                        </Text>
                                        <Text style={{ color: selectedMySkill?.id === skill.id ? 'rgba(0,0,0,0.6)' : '#94A3B8', fontSize: 11, marginTop: 2 }}>
                                            {skill.level}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </>
                )}

                <View style={{ paddingHorizontal: 0, marginBottom: 24 }}>
                    <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Hoe lang?</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {[0.5, 1, 1.5, 2].map((dur) => (
                            <TouchableOpacity
                                key={dur}
                                onPress={() => setSelectedDuration(dur)}
                                style={{
                                    flex: 1, paddingVertical: 10, borderRadius: 12,
                                    backgroundColor: selectedDuration === dur ? scheduleMatchColors.primary : 'rgba(255,255,255,0.05)',
                                    alignItems: 'center', borderWidth: 1,
                                    borderColor: selectedDuration === dur ? scheduleMatchColors.primary : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <Text style={{ color: selectedDuration === dur ? '#000' : '#F8FAFC', fontWeight: '800' }}>{dur}u</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {loading ? (
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={scheduleMatchColors.primary} />
                    </View>
                ) : (
                    <>
                        {matchedDates.map((item, idx) => (
                            <View key={idx} style={[styles.dayCard, { borderColor: scheduleMatchColors.primary, borderWidth: 1 }]}>
                                <View style={styles.dayCardHeader}>
                                    <View>
                                        <Text style={styles.dayName}>{item.dayName}</Text>
                                        <Text style={{ color: scheduleMatchColors.textSecondary, fontSize: 13 }}>{item.formattedDate}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.matchButton} onPress={() => handleMatchPress(item)}>
                                        <Text style={styles.matchButtonText}>Kies Tijd</Text>
                                    </TouchableOpacity>
                                </View>
                                {item.people.map((p, pi) => (
                                    <View key={pi} style={p.times.length === 0 ? { opacity: 0.3 } : styles.personSlot}>
                                        <Ionicons name="time-outline" size={14} color={scheduleMatchColors.textSecondary} />
                                        <Text style={{ marginLeft: 6, color: scheduleMatchColors.textSecondary, fontSize: 13 }}>
                                            {p.name}: {p.times.length > 0 ? `${p.times[0].start} - ${p.times[0].end}` : 'Niet beschikbaar'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                        {matchedDates.length === 0 && (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ color: scheduleMatchColors.textSecondary, textAlign: 'center' }}>
                                    Geen overlappende tijden gevonden voor {selectedDuration} uur.
                                </Text>
                            </View>
                        )}
                        <View style={{ height: 40 }} />
                    </>
                )}
            </ScrollView>

            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{ flex: 1 }} />
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{ backgroundColor: '#111827', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' }}>
                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Inplannen</Text>
                                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                                            <Ionicons name="close-circle" size={32} color="#fff" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ marginBottom: 24, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                                        <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Wanneer</Text>
                                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{selectedMatch?.dayName} {selectedMatch?.formattedDate}</Text>
                                    </View>

                                    {matchType === 'pay' ? (
                                        <View style={{ marginBottom: 24 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>Jouw Prijs (€)</Text>
                                                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                                    <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '800' }}>MAX €15</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                                <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: '700', marginRight: 8 }}>€</Text>
                                                <TextInput
                                                    style={{ flex: 1, color: '#F8FAFC', fontSize: 24, fontWeight: '700', height: 60 }}
                                                    keyboardType="numeric"
                                                    value={proposedPrice}
                                                    onChangeText={setProposedPrice}
                                                    placeholder="0"
                                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                                    selectTextOnFocus={true}
                                                    autoFocus
                                                />
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={{ marginBottom: 24, backgroundColor: 'rgba(124, 58, 237, 0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' }}>
                                            <Text style={{ color: '#7C3AED', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Transactie</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="repeat" size={20} color="#7C3AED" style={{ marginRight: 8 }} />
                                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Gratis (Skill Swap)</Text>
                                            </View>
                                        </View>
                                    )}

                                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase' }}>Kies een starttijd</Text>
                                    <FlatList
                                        data={availableSlots}
                                        keyExtractor={(item) => item}
                                        numColumns={2}
                                        columnWrapperStyle={{ gap: 12 }}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={{ flex: 1, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' }}
                                                onPress={() => confirmMatch(item)}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>{item.split(' - ')[0]}</Text>
                                                <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>tot {item.split(' - ')[1]}</Text>
                                            </TouchableOpacity>
                                        )}
                                        showsVerticalScrollIndicator={false}
                                        style={{ marginBottom: 20 }}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
