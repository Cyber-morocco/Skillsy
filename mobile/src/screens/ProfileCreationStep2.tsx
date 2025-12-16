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
    const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
    const [customSkill, setCustomSkill] = React.useState('');

    const PREDEFINED_SKILLS = [
        'Fitness', 'Dans', 'Meditatie',
        'Gitaar', 'Piano', 'Zang',
        'Muziektheorie', 'Fotografie',
        'Tekenen', 'Schilderen',
        'Grafisch ontwerp', 'Timmeren',
        'Tuinieren', 'Breien', 'Naaien',
        'Wiskunde', 'Natuurkunde',
        'Scheikunde', 'Bijles'
    ];

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const addCustomSkill = () => {
        if (customSkill.trim() && !selectedSkills.includes(customSkill)) {
            setSelectedSkills([...selectedSkills, customSkill]);
            setCustomSkill('');
        }
    };

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
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2, marginRight: 8 }} />
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        </View>
                        <Text style={{ color: authColors.muted, fontSize: 14 }}>Stap 2 van 3</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 22, fontWeight: '700', color: authColors.text, marginBottom: 8 }}>
                                Wat kun je aanleren? 🛠️
                            </Text>
                            <Text style={{ fontSize: 15, color: authColors.muted, lineHeight: 22 }}>
                                Selecteer alle vaardigheden die je kunt delen
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
                            {PREDEFINED_SKILLS.map((skill) => {
                                const isSelected = selectedSkills.includes(skill);
                                return (
                                    <TouchableOpacity
                                        key={skill}
                                        onPress={() => toggleSkill(skill)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            marginRight: 8,
                                            marginBottom: 12,
                                            backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.03)',
                                            borderWidth: 1,
                                            borderColor: isSelected ? authColors.accent : 'rgba(148,163,184,0.2)',
                                        }}
                                    >
                                        <Text style={{
                                            color: isSelected ? authColors.accent : authColors.text,
                                            fontSize: 14,
                                            fontWeight: isSelected ? '600' : '400'
                                        }}>{skill}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
                            <AppInput
                                placeholder="Eigen vaardigheid toevoegen"
                                value={customSkill}
                                onChangeText={setCustomSkill}
                                containerStyle={{ flex: 1, marginBottom: 0, marginRight: 12 }}
                                style={{ height: 50, marginTop: 0 }}
                            />
                            <TouchableOpacity
                                onPress={addCustomSkill}
                                style={{
                                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                                    height: 50,
                                    justifyContent: 'center',
                                    paddingHorizontal: 20,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: authColors.accent
                                }}
                            >
                                <Text style={{ color: authColors.text, fontWeight: '600', fontSize: 14 }}>Toevoegen</Text>
                            </TouchableOpacity>
                        </View>

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
                                    console.log('Selected skills:', selectedSkills);
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
