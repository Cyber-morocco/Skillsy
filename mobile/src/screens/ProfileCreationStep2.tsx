
import React, { useState, useEffect, useRef } from 'react';
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
import { ROOT_CATEGORIES, RootCategory } from '../constants/categories';
import { resolveSkillIntelligence, SkillResolutionResult, AbilityLevelLabels } from '../services/skillIntelligenceService';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
    };
};

const ProfileCreationStep2: React.FC<NavProps> = ({ navigation }) => {
    const [selectedSkills, setSelectedSkills] = useState<Array<{ subject: string, rootId: string, level: number }>>([]);
    const [customSkill, setCustomSkill] = useState('');
    const [abilityLevel, setAbilityLevel] = useState<1 | 2 | 3>(1);
    const [intelligenceResult, setIntelligenceResult] = useState<SkillResolutionResult | null>(null);
    const [saving, setSaving] = useState(false);
    const [loadingIntelligence, setLoadingIntelligence] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (customSkill.length < 3) {
            setIntelligenceResult(null);
            setLoadingIntelligence(false);
            return;
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        setLoadingIntelligence(true);
        typingTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await resolveSkillIntelligence(customSkill);
                setIntelligenceResult(result);
            } catch (error) {
                console.error("Intelligence error:", error);
            } finally {
                setLoadingIntelligence(false);
            }
        }, 600);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [customSkill]);

    const addStructuredSkill = () => {
        if (!customSkill.trim()) return;

        let rootId = 'overig';
        let finalSubject = customSkill.trim();

        if (intelligenceResult?.type === 'auto_map' && intelligenceResult.match) {
            rootId = intelligenceResult.match.concept.rootId;
            finalSubject = intelligenceResult.match.concept.label;
        } else if (intelligenceResult?.type === 'discovery' && intelligenceResult.proposed) {
            rootId = intelligenceResult.proposed.rootId;
        }

        setSelectedSkills(prev => [...prev, {
            subject: finalSubject,
            rootId: rootId,
            level: abilityLevel
        }]);

        setCustomSkill('');
        setIntelligenceResult(null);
    };

    const removeSkill = (index: number) => {
        setSelectedSkills(prev => prev.filter((_, i) => i !== index));
    };

    const handleNext = async () => {
        if (selectedSkills.length === 0) {
            Alert.alert('Wacht even', 'Voeg minimaal één vaardigheid toe.');
            return;
        }
        setSaving(true);
        try {
            const skillsToSave: Partial<Skill>[] = selectedSkills.map(s => ({
                subject: s.subject,
                level: (s.level === 1 ? 'Beginner' : s.level === 2 ? 'Gevorderd' : 'Expert') as any,
                price: 'Op aanvraag',
                rootId: s.rootId
            }));

            await addSkills(skillsToSave as Skill[]);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ marginBottom: 32 }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                            <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        </View>
                        <Text style={{ color: authColors.muted, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>Stap 2 van 3</Text>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 28, fontWeight: '800', color: authColors.text, marginBottom: 8 }}>
                            Wat zijn jouw talenten? 🚀
                        </Text>
                        <Text style={{ fontSize: 16, color: authColors.muted, lineHeight: 24 }}>
                            Voeg de vaardigheden toe waarin je les wilt geven. De AI helpt je ze te categoriseren.
                        </Text>
                    </View>

                    <View style={[styles.card, { padding: 20, borderRadius: 24, marginBottom: 20 }]}>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: authColors.text, fontSize: 15, fontWeight: '600', marginBottom: 10 }}>Zoek of typ een vaardigheid</Text>
                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    placeholder="Bijv. Gitaarles, Python, Frans..."
                                    placeholderTextColor={authColors.placeholder}
                                    value={customSkill}
                                    onChangeText={setCustomSkill}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderRadius: 16,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        fontSize: 16,
                                        color: authColors.text,
                                        borderWidth: 1,
                                        borderColor: customSkill ? authColors.accent : 'rgba(255,255,255,0.1)'
                                    }}
                                />
                                {loadingIntelligence && (
                                    <View style={{ position: 'absolute', right: 16, top: 16 }}>
                                        <ActivityIndicator size="small" color={authColors.accent} />
                                    </View>
                                )}
                            </View>

                            {intelligenceResult?.type === 'auto_map' && intelligenceResult.match && (
                                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(124, 58, 237, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                                    <Ionicons name="checkmark-circle" size={16} color={authColors.accent} />
                                    <Text style={{ color: authColors.text, fontSize: 13, marginLeft: 8 }}>
                                        Gevonden: <Text style={{ fontWeight: '700' }}>{intelligenceResult.match.concept.label}</Text>
                                    </Text>
                                </View>
                            )}

                            {intelligenceResult?.type === 'discovery' && intelligenceResult.proposed && (
                                <View style={{ marginTop: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>✨ Nieuwe vaardigheid herkend</Text>
                                    <Text style={{ color: authColors.muted, fontSize: 13 }}>In categorie: <Text style={{ color: authColors.text, fontWeight: '600' }}>{intelligenceResult.proposed.rootLabel}</Text></Text>
                                </View>
                            )}
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: authColors.text, marginBottom: 12 }}>Jouw niveau:</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {[1, 2, 3].map((num) => (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => setAbilityLevel(num as any)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            backgroundColor: abilityLevel === num ? authColors.accent : 'rgba(255,255,255,0.03)',
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: abilityLevel === num ? authColors.accent : 'rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', opacity: abilityLevel === num ? 1 : 0.6 }}>
                                            {num === 1 ? 'Basis' : num === 2 ? 'Gemiddeld' : 'Expert'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={addStructuredSkill}
                            style={{
                                backgroundColor: customSkill.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                                borderRadius: 16,
                                paddingVertical: 14,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: customSkill.trim() ? 'rgba(255,255,255,0.2)' : 'transparent'
                            }}
                            disabled={!customSkill.trim()}
                        >
                            <Text style={{ color: customSkill.trim() ? '#fff' : authColors.muted, fontWeight: '700' }}>+ Voeg toe</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ color: authColors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
                            Gereed om te delen ({selectedSkills.length})
                        </Text>

                        {selectedSkills.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Ionicons name="sparkles-outline" size={32} color="rgba(255,255,255,0.2)" />
                                <Text style={{ color: 'rgba(255,255,255,0.3)', marginTop: 12, textAlign: 'center' }}>Je hebt nog geen vaardigheden toegevoegd</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {selectedSkills.map((s, i) => {
                                    const catColor = ROOT_CATEGORIES.find(c => c.id === s.rootId)?.color || authColors.muted;
                                    return (
                                        <View
                                            key={i}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                paddingLeft: 14,
                                                paddingRight: 8,
                                                paddingVertical: 10,
                                                borderRadius: 16,
                                                borderWidth: 1,
                                                borderColor: 'rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: catColor, marginRight: 10 }} />
                                            <View>
                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{s.subject}</Text>
                                                <Text style={{ color: authColors.muted, fontSize: 10, marginTop: 2 }}>
                                                    {s.level === 1 ? 'Basis' : s.level === 2 ? 'Gemiddeld' : 'Expert'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => removeSkill(i)}
                                                style={{ marginLeft: 12, padding: 4 }}
                                            >
                                                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.2)" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 30 }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ padding: 16 }}
                        >
                            <Text style={{ color: authColors.muted, fontWeight: '600' }}>Terug</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                backgroundColor: authColors.accent,
                                paddingVertical: 16,
                                paddingHorizontal: 40,
                                borderRadius: 20,
                                opacity: selectedSkills.length > 0 ? 1 : 0.5
                            }}
                            onPress={handleNext}
                            disabled={selectedSkills.length === 0 || saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Volgende</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileCreationStep2;
