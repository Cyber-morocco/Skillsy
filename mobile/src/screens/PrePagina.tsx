import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const colors = {
    primary: '#6366f1',
    secondary: '#fff',
    background: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    accent: '#a855f7',
    border: '#e2e8f0',
};

export default function PrePagina() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <View style={styles.newBadge}>
                        <Ionicons name="sparkles" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                        <Text style={styles.newBadgeText}>Nieuw: Nu ook vaardigheden ruilen!</Text>
                    </View>

                    <Text style={styles.title}>
                        Deel je talenten,{'\n'}
                        leer van je buren
                    </Text>

                    <Text style={styles.subtitle}>
                        Ontdek vaardigheden in je buurt. Van koken tot programmeren, van talen tot timmeren. Leer samen, groei samen.
                    </Text>
                </View>

                <View style={styles.authContainer}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Sign up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Log in</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    newBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f3ff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#d8b4fe',
        marginBottom: 24,
    },
    newBadgeText: {
        color: colors.accent,
        fontWeight: '600',
        fontSize: 14,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
    },
    authContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 40,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
    },
});
