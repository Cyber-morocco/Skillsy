import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { authColors, authStyles as styles } from '../styles/authStyles';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
    };
};

const ProfileCreationStep1: React.FC<NavProps> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* HEADER / PROGRESS */}
                    {/* Dit is het eerste stuk: De voortgangsbalk en stapindicator */}
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 16 }}>
                            {/* Huidige stap (actief) */}
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2, marginRight: 8 }} />
                            {/* Stap 2 (inactief) */}
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginRight: 8 }} />
                            {/* Stap 3 (inactief) */}
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        </View>
                        <Text style={{ color: authColors.muted, fontSize: 14 }}>Stap 1 van 3</Text>
                    </View>

                    <View style={styles.card}>
                        {/* TITLE */}
                        {/* Titel en subtitel sectie */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 22, fontWeight: '700', color: authColors.text, marginBottom: 8 }}>
                                Welkom bij Skillsy! 👋
                            </Text>
                            <Text style={{ fontSize: 15, color: authColors.muted, lineHeight: 22 }}>
                                Laten we beginnen met je profiel
                            </Text>
                        </View>

                        {/* De rest volgt later... */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileCreationStep1;
