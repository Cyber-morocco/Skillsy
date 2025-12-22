import React from 'react';
import {
    StatusBar,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scheduleMatchStyles as styles, scheduleMatchColors } from '../styles/ScheduleMatchStyles';

interface PersonAvailability {
    name: string;
    times: string[];
}

interface DayAvailability {
    day: string;
    people: PersonAvailability[];
}

interface ScheduleMatchScreenProps {
    contactName: string;
    contactInitials: string;
    contactColor: string;
    contactSubtitle?: string;
    onBack: () => void;
    onMatch?: (day: string) => void;
}

// TE VERWIJDEREN MOCK DATA
const MOCK_AVAILABILITY: DayAvailability[] = [
    {
        day: 'Maandag',
        people: [
            { name: 'Sophie Martin', times: ['14:00 - 18:00'] },
            { name: 'Emma Janssen', times: ['09:00 - 12:00', '15:00 - 18:00'] },
        ],
    },
    {
        day: 'Dinsdag',
        people: [
            { name: 'Sophie Martin', times: ['10:00 - 12:00', '14:00 - 17:00'] },
            { name: 'Emma Janssen', times: ['10:00 - 16:00'] },
        ],
    },
    {
        day: 'Vrijdag',
        people: [
            { name: 'Sophie Martin', times: ['10:00 - 13:00'] },
            { name: 'Emma Janssen', times: ['10:00 - 14:00'] },
        ],
    },
    {
        day: 'Zaterdag',
        people: [
            { name: 'Sophie Martin', times: ['09:00 - 12:00'] },
            { name: 'Emma Janssen', times: ['10:00 - 13:00'] },
        ],
    },
];

export default function ScheduleMatchScreen({
    contactName,
    contactInitials,
    contactColor,
    contactSubtitle,
    onBack,
    onMatch,
}: ScheduleMatchScreenProps) {

    const handleMatch = (day: string) => {
        if (onMatch) {
            onMatch(day);
        } else {
            Alert.alert(
                'Match gevonden!',
                `Je hebt ${day} geselecteerd. We sturen een bevestiging naar ${contactName}.`,
                [{ text: 'OK', onPress: onBack }]
            );
        }
    };

    const renderDayCard = (dayData: DayAvailability) => (
        <View key={dayData.day} style={styles.dayCard}>
            <View style={styles.dayCardHeader}>
                <Text style={styles.dayName}>{dayData.day}</Text>
                <TouchableOpacity
                    style={styles.matchButton}
                    onPress={() => handleMatch(dayData.day)}
                >
                    <Text style={styles.matchButtonText}>Match</Text>
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {MOCK_AVAILABILITY.map(renderDayCard)}
                <View style={{ height: 20 }} />
            </ScrollView>

        </SafeAreaView>
    );
}

