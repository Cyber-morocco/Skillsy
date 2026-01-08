
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
    const [step, setStep] = useState<'category' | 'details'>('category');
    const [selectedRoot, setSelectedRoot] = useState<RootCategory | null>(null);
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
        }, 600); // 600ms delay

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [customSkill]);

    const handleSelectCategory = (category: RootCategory) => {
        setSelectedRoot(category);
        setStep('details');
    };

    const handleBackToCategory = () => {
        setStep('category');
        setCustomSkill('');
        setIntelligenceResult(null);
        setLoadingIntelligence(false);
    };

    const addStructuredSkill = () => {
        if (!customSkill.trim() || !selectedRoot) return;

        const finalSubject = intelligenceResult?.type === 'auto_map'
            ? intelligenceResult.match?.concept.label || customSkill.trim()
            : customSkill.trim();

        setSelectedSkills(prev => [...prev, {
            subject: finalSubject,
            rootId: selectedRoot.id,
            level: abilityLevel
        }]);

        handleBackToCategory();
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 }}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                                <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                                <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                                <View style={{ height: 4, flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
                            </View>
                            <Text style={{ color: authColors.muted, fontSize: 13, fontWeight: '500' }}>Stap 2 van 3</Text>
                        </View>

                        <View style={[styles.card, { padding: 20, borderRadius: 24, minHeight: '60%' }]}>
                            {step === 'category' ? (
                                <>
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ fontSize: 20, fontWeight: '700', color: authColors.text, marginBottom: 6 }}>
                                            Wat kun je aanleren? 🎓
                                        </Text>
                                        <Text style={{ fontSize: 14, color: authColors.muted, lineHeight: 20 }}>
                                            Kies eerst een categorie om een vaardigheid toe te voegen
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                                        {ROOT_CATEGORIES.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                onPress={() => handleSelectCategory(cat)}
                                                style={{
                                                    width: '30%',
                                                    aspectRatio: 1,
                                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                                    borderRadius: 16,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderWidth: 1,
                                                    borderColor: 'rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                                                <Text style={{ color: '#fff', fontSize: 10, marginTop: 8, textAlign: 'center' }}>
                                                    {cat.name.nl}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={handleBackToCategory}
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                                    >
                                        <Ionicons name="arrow-back" size={18} color={authColors.accent} />
                                        <Text style={{ color: authColors.accent, marginLeft: 8 }}>Terug naar categorieën</Text>
                                    </TouchableOpacity>

                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: authColors.text, marginBottom: 4 }}>
                                            {selectedRoot?.name.nl}
                                        </Text>
                                        <Text style={{ fontSize: 14, color: authColors.muted }}>
                                            Welke specifieke vaardigheid wil je delen?
                                        </Text>
                                    </View>

                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            placeholder="Bijv. Elektrische Gitaar, Python, Frans..."
                                            placeholderTextColor={authColors.muted}
                                            value={customSkill}
                                            onChangeText={setCustomSkill}
                                            style={{
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                borderRadius: 12,
                                                paddingHorizontal: 16,
                                                paddingVertical: 12,
                                                fontSize: 16,
                                                color: authColors.text,
                                                borderWidth: 1,
                                                borderColor: authColors.accent
                                            }}
                                        />
                                        {loadingIntelligence && (
                                            <ActivityIndicator size="small" color={authColors.accent} style={{ marginTop: 12 }} />
                                        )}

                                        {intelligenceResult?.type === 'nudge' && intelligenceResult.suggestions && !loadingIntelligence && (
                                            <View style={{ marginTop: 12 }}>
                                                <Text style={{ color: authColors.muted, fontSize: 12, marginBottom: 8 }}>
                                                    Bedoel je een van deze?
                                                </Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    {intelligenceResult.suggestions.map((s, i) => (
                                                        <TouchableOpacity
                                                            key={i}
                                                            onPress={() => setCustomSkill(s.concept.label)}
                                                            style={{
                                                                paddingHorizontal: 12,
                                                                paddingVertical: 6,
                                                                borderRadius: 20,
                                                                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                                                                borderWidth: 1,
                                                                borderColor: authColors.accent
                                                            }}
                                                        >
                                                            <Text style={{ color: '#fff', fontSize: 12 }}>{s.concept.label}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        )}

                                        {intelligenceResult?.type === 'discovery' && intelligenceResult.proposed && !loadingIntelligence && (
                                            <View style={{ marginTop: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#10b981' }}>
                                                <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
                                                    ✨ Nieuwe vaardigheid ontdekt! {intelligenceResult.isWebAugmented && " (🌐 Webonderzoek voltooid)"}
                                                </Text>
                                                <Text style={{ color: '#fff', fontSize: 13 }}>
                                                    De AI herkent dit als: <Text style={{ fontWeight: '700' }}>{intelligenceResult.proposed.label}</Text> in de categorie <Text style={{ color: '#10b981' }}>{intelligenceResult.proposed.rootLabel}</Text>.
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: authColors.text, marginBottom: 12 }}>
                                            Jouw niveau:
                                        </Text>
                                        {[1, 2, 3].map((num) => (
                                            <TouchableOpacity
                                                key={num}
                                                onPress={() => setAbilityLevel(num as any)}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    padding: 12,
                                                    borderRadius: 12,
                                                    backgroundColor: abilityLevel === num ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                                                    borderWidth: 1,
                                                    borderColor: abilityLevel === num ? authColors.accent : 'rgba(255,255,255,0.05)',
                                                    marginBottom: 8
                                                }}
                                            >
                                                <View style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    borderWidth: 2,
                                                    borderColor: abilityLevel === num ? authColors.accent : authColors.muted,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginRight: 12
                                                }}>
                                                    {abilityLevel === num && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: authColors.accent }} />}
                                                </View>
                                                <Text style={{ color: abilityLevel === num ? '#fff' : authColors.muted, fontSize: 14 }}>
                                                    {AbilityLevelLabels[num as 1 | 2 | 3]}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        onPress={addStructuredSkill}
                                        style={{
                                            backgroundColor: authColors.accent,
                                            borderRadius: 12,
                                            paddingVertical: 14,
                                            alignItems: 'center',
                                            opacity: customSkill.trim() ? 1 : 0.6
                                        }}
                                        disabled={!customSkill.trim()}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '700' }}>Deze vaardigheid toevoegen</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {selectedSkills.length > 0 && (
                                <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 }}>
                                    <Text style={{ color: authColors.text, fontWeight: '600', marginBottom: 12 }}>
                                        Toegevoegd ({selectedSkills.length}):
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedSkills.map((s, i) => (
                                            <View
                                                key={i}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: 'rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 12, marginRight: 8 }}>{s.subject}</Text>
                                                <TouchableOpacity onPress={() => removeSkill(i)}>
                                                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, alignItems: 'center', paddingBottom: 20 }}>
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
