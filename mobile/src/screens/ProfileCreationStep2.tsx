
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors, authStyles as styles } from '../styles/authStyles';
import { addSkills } from '../services/userService';
import { Skill } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
    };
};

// Exact list from screenshot Step 2
const PREDEFINED_SKILLS = [
    "Fitness", "Dans", "Meditatie",
    "Gitaar", "Piano", "Zang",
    "Muziektheorie", "Fotografie",
    "Tekenen", "Schilderen",
    "Grafisch ontwerp", "Timmeren",
    "Tuinieren", "Breien", "Naaien",
    "Wiskunde", "Natuurkunde",
    "Scheikunde", "Bijles"
];

const ProfileCreationStep2: React.FC<NavProps> = ({ navigation }) => {
    const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
    const [customSkill, setCustomSkill] = useState('');
    const [saving, setSaving] = useState(false);

    const toggleSkill = (skill: string) => {
        const newSelected = new Set(selectedSkills);
        if (newSelected.has(skill)) {
            newSelected.delete(skill);
        } else {
            newSelected.add(skill);
        }
        setSelectedSkills(newSelected);
    };

    const addCustomSkill = () => {
        if (customSkill.trim()) {
            const newSelected = new Set(selectedSkills);
            newSelected.add(customSkill.trim());
            setSelectedSkills(newSelected);
            setCustomSkill('');
        }
    };

    const handleNext = async () => {
        setSaving(true);
        try {
            const skills = Array.from(selectedSkills).map(subject => ({
                subject,
                level: 'Beginner' as const,
                price: 'Op aanvraag'
            }));

            await addSkills(skills);
            navigation.navigate('ProfileCreationStep3');
        } catch (error) {
            console.error(error);
            Alert.alert('Fout', 'Er ging iets mis bij het opslaan.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 }}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            {/* Progress Bar */}
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                                <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                                <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                                <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                            </View>
                            <Text style={{ color: authColors.muted, fontSize: 13, fontWeight: '500' }}>Stap 2 van 3</Text>
                        </View>

                        <View style={[styles.card, { padding: 20, borderRadius: 24, minHeight: '60%' }]}>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, fontWeight: '700', color: authColors.text, marginBottom: 6 }}>
                                    Wat kun je aanleren? 🎓
                                </Text>
                                <Text style={{ fontSize: 14, color: authColors.muted, lineHeight: 20 }}>
                                    Selecteer alle vaardigheden die je kunt delen
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                                {Array.from(selectedSkills).filter(s => !PREDEFINED_SKILLS.includes(s)).map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => toggleSkill(s)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            backgroundColor: 'rgba(124, 58, 237, 0.15)', // Active accent tint
                                            borderWidth: 1,
                                            borderColor: authColors.accent,
                                        }}
                                    >
                                        <Text style={{ color: authColors.text, fontWeight: '600', fontSize: 14 }}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                                {PREDEFINED_SKILLS.map((skill) => {
                                    const isSelected = selectedSkills.has(skill);
                                    return (
                                        <TouchableOpacity
                                            key={skill}
                                            onPress={() => toggleSkill(skill)}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 12,
                                                backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.03)',
                                                borderWidth: 1,
                                                borderColor: isSelected ? authColors.accent : 'rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            <Text style={{
                                                color: isSelected ? '#fff' : authColors.text,
                                                fontWeight: isSelected ? '600' : '400',
                                                fontSize: 14
                                            }}>
                                                {skill}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Add Custom Skill Input */}
                            <View style={{ flexDirection: 'row', marginBottom: 24, gap: 10, alignItems: 'center' }}>
                                <TextInput
                                    placeholder="Eigen vaardigheid toevoegen"
                                    placeholderTextColor={authColors.muted}
                                    value={customSkill}
                                    onChangeText={setCustomSkill}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 14,
                                        color: authColors.text,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={addCustomSkill}
                                    style={{
                                        backgroundColor: authColors.accent,
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        opacity: customSkill.trim() ? 1 : 0.6
                                    }}
                                    disabled={!customSkill.trim()}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Toevoegen</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 20,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <Text style={{ color: authColors.text, fontWeight: '600' }}>‹ Vorige</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        backgroundColor: authColors.accent,
                                        paddingVertical: 12,
                                        paddingHorizontal: 32,
                                        borderRadius: 12,
                                        opacity: saving ? 0.7 : 1
                                    }}
                                    onPress={handleNext}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Volgende ›</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default ProfileCreationStep2;
