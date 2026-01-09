
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
        }, 600);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [customInterest]);

    const addStructuredInterest = () => {
        if (!customInterest.trim()) return;

        let rootId = 'overig';
        let finalSubject = customInterest.trim();

        if (intelligenceResult?.type === 'auto_map' && intelligenceResult.match) {
            rootId = intelligenceResult.match.concept.rootId;
            finalSubject = intelligenceResult.match.concept.label;
        } else if (intelligenceResult?.type === 'discovery' && intelligenceResult.proposed) {
            rootId = intelligenceResult.proposed.rootId;
        }

        setSelectedInterests(prev => [...prev, {
            subject: finalSubject,
            rootId: rootId
        }]);

        setCustomInterest('');
        setIntelligenceResult(null);
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
                            <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                        </View>
                        <Text style={{ color: authColors.muted, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>Stap 3 van 3</Text>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 28, fontWeight: '800', color: authColors.text, marginBottom: 8 }}>
                            Wat wil je leren? 📚
                        </Text>
                        <Text style={{ fontSize: 16, color: authColors.muted, lineHeight: 24 }}>
                            Zoek naar dingen die je wilt leren. Wij matchen je met de juiste experts.
                        </Text>
                    </View>

                    <View style={[styles.card, { padding: 20, borderRadius: 24, marginBottom: 20 }]}>
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: authColors.text, fontSize: 15, fontWeight: '600', marginBottom: 10 }}>Zoek of typ een onderwerp</Text>
                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    placeholder="Bijv. Piano, Spaans, Koken..."
                                    placeholderTextColor={authColors.placeholder}
                                    value={customInterest}
                                    onChangeText={setCustomInterest}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderRadius: 16,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        fontSize: 16,
                                        color: authColors.text,
                                        borderWidth: 1,
                                        borderColor: customInterest ? authColors.accent : 'rgba(255,255,255,0.1)'
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
                                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>✨ Nieuwe interesse herkend</Text>
                                    <Text style={{ color: authColors.muted, fontSize: 13 }}>In categorie: <Text style={{ color: authColors.text, fontWeight: '600' }}>{intelligenceResult.proposed.rootLabel}</Text></Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={addStructuredInterest}
                            style={{
                                backgroundColor: customInterest.trim() ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                                borderRadius: 16,
                                paddingVertical: 14,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: customInterest.trim() ? 'rgba(255,255,255,0.2)' : 'transparent'
                            }}
                            disabled={!customInterest.trim()}
                        >
                            <Text style={{ color: customInterest.trim() ? '#fff' : authColors.muted, fontWeight: '700' }}>+ Voeg toe</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={{ color: authColors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
                            Jouw interesses ({selectedInterests.length})
                        </Text>

                        {selectedInterests.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Ionicons name="school-outline" size={32} color="rgba(255,255,255,0.2)" />
                                <Text style={{ color: 'rgba(255,255,255,0.3)', marginTop: 12, textAlign: 'center' }}>Voeg onderwerpen toe die je wilt leren</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {selectedInterests.map((s, i) => {
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
                                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{s.subject}</Text>
                                            <TouchableOpacity
                                                onPress={() => removeInterest(i)}
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
                                opacity: selectedInterests.length > 0 ? 1 : 0.5,
                            }}
                            onPress={handleFinish}
                            disabled={selectedInterests.length === 0 || saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Klaar! 🎉</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileCreationStep3;
