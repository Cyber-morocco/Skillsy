import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
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
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [street, setStreet] = useState('');

    const [focusedField, setFocusedField] = useState<string | null>(null);

    const getInputStyle = (field: string) => [
        styles.input,
        focusedField === field && styles.inputFocused,
    ];

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
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 16 }}>
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2, marginRight: 8 }} />
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginRight: 8 }} />
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        </View>
                        <Text style={{ color: authColors.muted, fontSize: 14 }}>Stap 1 van 3</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 22, fontWeight: '700', color: authColors.text, marginBottom: 8 }}>
                                Welkom bij Skillsy! 👋
                            </Text>
                            <Text style={{ fontSize: 15, color: authColors.muted, lineHeight: 22 }}>
                                Laten we beginnen met je profiel
                            </Text>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Wat is je naam?</Text>
                            <TextInput
                                style={getInputStyle('name')}
                                placeholder="Je naam..."
                                placeholderTextColor={authColors.placeholder}
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Vertel iets over jezelf</Text>
                            <TextInput
                                style={[getInputStyle('bio'), { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                                placeholder="Ik ben een gepassioneerde leraar en wil graag mijn kennis delen..."
                                placeholderTextColor={authColors.placeholder}
                                multiline
                                numberOfLines={4}
                                value={bio}
                                onChangeText={setBio}
                                onFocus={() => setFocusedField('bio')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        <View style={{ marginBottom: 20, marginTop: 16 }}>
                            <Text style={[styles.label, { fontSize: 18, marginBottom: 6 }]}>Locatie</Text>
                            <Text style={{ color: authColors.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
                                We delen je exacte adres niet. Alleen je wijk of buurt wordt getoond.
                            </Text>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Straatnaam</Text>
                                <TextInput
                                    style={getInputStyle('street')}
                                    placeholder="Bijv. Amsterdam Centrum"
                                    placeholderTextColor={authColors.placeholder}
                                    value={street}
                                    onChangeText={setStreet}
                                    onFocus={() => setFocusedField('street')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>


                        </View>


                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileCreationStep1;
