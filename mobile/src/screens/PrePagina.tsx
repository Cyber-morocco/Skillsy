import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';

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
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

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
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={styles.primaryButtonText}>Sign up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.secondaryButtonText}>Log in</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.featuresContainer}>
                    <FeatureItem
                        icon="location-outline"
                        title="Lokaal leren"
                        description="Vind experts in je eigen buurt en maak persoonlijk contact"
                        color="#a855f7"
                        bgColor="#f3e8ff"
                    />
                    <FeatureItem
                        icon="swap-horizontal-outline"
                        title="Vaardigheden ruilen"
                        description="Ruil je kennis of betaal voor een les - jij beslist"
                        color="#3b82f6"
                        bgColor="#dbeafe"
                    />
                    <FeatureItem
                        icon="heart-outline"
                        title="Vertrouwde community"
                        description="Beoordelingen en reviews voor een veilige ervaring"
                        color="#ec4899" 
                        bgColor="#fce7f3"
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>1,200+</Text>
                        <Text style={styles.statLabel}>Actieve {'\n'}gebruikers</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>350+</Text>
                        <Text style={styles.statLabel}>Vaardigheden</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>5,000+</Text>
                        <Text style={styles.statLabel}>Sessies {'\n'}voltooid</Text>
                    </View>
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
    featuresContainer: {
        width: '100%',
        gap: 20,
        marginBottom: 40,
    },
    featureItem: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: colors.textMuted,
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 16,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.border,
    },
});

function FeatureItem({ icon, title, description, color, bgColor }: any) {
    return (
        <View style={styles.featureItem}>
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}
