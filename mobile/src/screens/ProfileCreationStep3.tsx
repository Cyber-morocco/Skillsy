
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
import { auth, db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { addLearnSkill } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';
import { ROOT_CATEGORIES, RootCategory } from '../constants/categories';
import { resolveSkillIntelligence, SkillResolutionResult } from '../services/skillIntelligenceService';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
    };
};

const ProfileCreationStep3: React.FC<NavProps> = ({ navigation }) => {
    const [step, setStep] = useState<'category' | 'details'>('category');
    const [selectedRoot, setSelectedRoot] = useState<RootCategory | null>(null);
    const [selectedInterests, setSelectedInterests] = useState<Array<{ subject: string, rootId: string }>>([]);
    const [customInterest, setCustomInterest] = useState('');
    const [intelligenceResult, setIntelligenceResult] = useState<SkillResolutionResult | null>(null);
    const [loadingIntelligence, setLoadingIntelligence] = useState(false);
    const [saving, setSaving] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (customInterest.length < 3) {
            setIntelligenceResult(null);
            setLoadingIntelligence(false);
            return;
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        setLoadingIntelligence(true);
        typingTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await resolveSkillIntelligence(customInterest);
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
    }, [customInterest]);

    const handleSelectCategory = (category: RootCategory) => {
        setSelectedRoot(category);
        setStep('details');
    };

    const handleBackToCategory = () => {
        setStep('category');
        setCustomInterest('');
        setIntelligenceResult(null);
        setLoadingIntelligence(false);
    };

    const addStructuredInterest = () => {
        if (!customInterest.trim() || !selectedRoot) return;

        const finalSubject = intelligenceResult?.type === 'auto_map'
            ? intelligenceResult.match?.concept.label || customInterest.trim()
            : customInterest.trim();

        setSelectedInterests(prev => [...prev, {
            subject: finalSubject,
            rootId: selectedRoot.id
        }]);

        handleBackToCategory();
    };

    const removeInterest = (index: number) => {
        setSelectedInterests(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinish = async () => {
        if (!auth.currentUser) return;
        if (selectedInterests.length === 0) {
            Alert.alert('Wacht even', 'Voeg minimaal één interesse toe.');
            return;
        }
        setSaving(true);
        try {
            const promises = selectedInterests.map(item => {
                return addLearnSkill({
                    subject: item.subject,
                    rootId: item.rootId
                });
            });
            await Promise.all(promises);

            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                profileComplete: true,
                updatedAt: serverTimestamp(),
            });

            navigation.navigate('MainTabs');

        } catch (error: any) {
            console.error(error);
            Alert.alert('Fout', 'Kon profiel niet afronden.');
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
                                <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                            </View>
                            <Text style={{ color: authColors.muted, fontSize: 13, fontWeight: '500' }}>Stap 3 van 3</Text>
                        </View>

                        <View style={[styles.card, { padding: 20, borderRadius: 24, minHeight: '60%' }]}>
                            {step === 'category' ? (
                                <>
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={{ fontSize: 20, fontWeight: '700', color: authColors.text, marginBottom: 6 }}>
                                            Wat wil je leren? 📚
                                        </Text>
                                        <Text style={{ fontSize: 14, color: authColors.muted, lineHeight: 20 }}>
                                            Kies eerst een categorie om een interesse toe te voegen
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
                                            Wat zou je graag willen leren in deze categorie?
                                        </Text>
                                    </View>

                                    <View style={{ marginBottom: 20 }}>
                                        <TextInput
                                            placeholder="Bijv. Piano, Spaans, Koken..."
                                            placeholderTextColor={authColors.muted}
                                            value={customInterest}
                                            onChangeText={setCustomInterest}
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
                                                            onPress={() => setCustomInterest(s.concept.label)}
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
                                                    ✨ Nieuwe interesse ontdekt! {intelligenceResult.isWebAugmented && " (🌐 Webonderzoek voltooid)"}
                                                </Text>
                                                <Text style={{ color: '#fff', fontSize: 13 }}>
                                                    De AI herkent dit als: <Text style={{ fontWeight: '700' }}>{intelligenceResult.proposed.label}</Text> in de categorie <Text style={{ color: '#10b981' }}>{intelligenceResult.proposed.rootLabel}</Text>.
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        onPress={addStructuredInterest}
                                        style={{
                                            backgroundColor: authColors.accent,
                                            borderRadius: 12,
                                            paddingVertical: 14,
                                            alignItems: 'center',
                                            opacity: customInterest.trim() ? 1 : 0.6
                                        }}
                                        disabled={!customInterest.trim()}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '700' }}>Deze interesse toevoegen</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {selectedInterests.length > 0 && (
                                <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 }}>
                                    <Text style={{ color: authColors.text, fontWeight: '600', marginBottom: 12 }}>
                                        Toegevoegd ({selectedInterests.length}):
                                    </Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedInterests.map((s, i) => (
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
                                                <TouchableOpacity onPress={() => removeInterest(i)}>
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
                                    onPress={handleFinish}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Klaar! 🎉</Text>
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

export default ProfileCreationStep3;
