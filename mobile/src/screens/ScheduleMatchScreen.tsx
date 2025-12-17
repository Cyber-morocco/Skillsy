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

export default function ScheduleMatchScreen({
    contactName,
    contactInitials,
    contactColor,
    contactSubtitle,
    onBack,
    onMatch,
}: ScheduleMatchScreenProps) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Text style={styles.title}>Pagina</Text>
        </SafeAreaView>
    );
}
