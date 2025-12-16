import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { authColors, authStyles as styles } from '../styles/authStyles';
import { AppInput } from '../components/AppInput';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
    };
};

const ProfileCreationStep2: React.FC<NavProps> = ({ navigation }) => {
    const [role, setRole] = React.useState('');
    const [skills, setSkills] = React.useState('');

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
                            { }
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2, marginRight: 8 }} />
                            { }
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2, marginRight: 8 }} />
                            { }
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        </View>
                        <Text style={{ color: authColors.muted, fontSize: 14 }}>Stap 2 van 3</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 22, fontWeight: '700', color: authColors.text, marginBottom: 8 }}>
                                Wat zijn je skills? 🛠️
                            </Text>
                            <Text style={{ fontSize: 15, color: authColors.muted, lineHeight: 22 }}>
                                Vertel ons waar je goed in bent.
                            </Text>
                        </View>

                        <AppInput
                            label="Huidige functie"
                            placeholder="Bijv. Software Developer, Loodgieter..."
                            value={role}
                            onChangeText={setRole}
                        />

                        <AppInput
                            label="Vaardigheden"
                            placeholder="Bijv. React Native, Houtbewerking..."
                            value={skills}
                            onChangeText={setSkills}
                        />



                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 32,
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: 'rgba(148,163,184,0.2)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: authColors.text, fontWeight: '600', fontSize: 16 }}>‹ Vorige</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.primaryButton, { marginTop: 0, paddingVertical: 12, paddingHorizontal: 32 }]}
                                onPress={() => {

                                    console.log('Next step');
                                }}
                            >
                                <Text style={styles.primaryButtonText}>Volgende ›</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileCreationStep2;
