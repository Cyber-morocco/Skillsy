
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
import { auth, db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { addLearnSkill } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
    };
};

// Exact list from screenshot Step 3
const PREDEFINED_INTERESTS = [
    "Frans", "Engels", "Spaans",
    "Duits", "Nederlands",
    "Programmeren", "Python",
    "JavaScript", "Web Development",
    "Koken", "Bakken",
    "Italiaans koken",
    "Vegetarisch koken", "Yoga",
    "Fitness", "Dans", "Meditatie"
];

const ProfileCreationStep3: React.FC<NavProps> = ({ navigation }) => {
    const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
    const [customInterest, setCustomInterest] = useState('');
    const [saving, setSaving] = useState(false);

    const toggleInterest = (interest: string) => {
        const newSelected = new Set(selectedInterests);
        if (newSelected.has(interest)) {
            newSelected.delete(interest);
        } else {
            newSelected.add(interest);
        }
        setSelectedInterests(newSelected);
    };

    const addCustomInterest = () => {
        if (customInterest.trim()) {
            const newSelected = new Set(selectedInterests);
            newSelected.add(customInterest.trim());
            setSelectedInterests(newSelected);
            setCustomInterest('');
        }
    };

    const handleFinish = async () => {
        if (!auth.currentUser) return;
        setSaving(true);
        try {
            const promises = Array.from(selectedInterests).map(subject => {
                return addLearnSkill({
                    subject,
                });
            });
            await Promise.all(promises);

            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                profileComplete: true,
                updatedAt: serverTimestamp(),
            });

        } catch (error: any) {
            console.error(error);
            Alert.alert('Fout', 'Kon profiel niet afronden.');
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
                                <View style={{ height: 4, flex: 1, backgroundColor: authColors.accent, borderRadius: 2 }} />
                            </View>
                            <Text style={{ color: authColors.muted, fontSize: 13, fontWeight: '500' }}>Stap 3 van 3</Text>
                        </View>

                        <View style={[styles.card, { padding: 20, borderRadius: 24, minHeight: '60%' }]}>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, fontWeight: '700', color: authColors.text, marginBottom: 6 }}>
                                    Wat wil je leren? 📚
                                </Text>
                                <Text style={{ fontSize: 14, color: authColors.muted, lineHeight: 20 }}>
                                    Kies vaardigheden die je wilt ontwikkelen
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                                {Array.from(selectedInterests).filter(s => !PREDEFINED_INTERESTS.includes(s)).map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => toggleInterest(s)}
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            backgroundColor: 'rgba(124, 58, 237, 0.15)',
                                            borderWidth: 1,
                                            borderColor: authColors.accent,
                                        }}
                                    >
                                        <Text style={{ color: authColors.text, fontWeight: '600', fontSize: 14 }}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                                {PREDEFINED_INTERESTS.map((title) => {
                                    const isSelected = selectedInterests.has(title);
                                    return (
                                        <TouchableOpacity
                                            key={title}
                                            onPress={() => toggleInterest(title)}
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
                                                {title}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Add Custom Skill Input */}
                            <View style={{ flexDirection: 'row', marginBottom: 24, gap: 10, alignItems: 'center' }}>
                                <TextInput
                                    placeholder="Eigen interesse toevoegen"
                                    placeholderTextColor={authColors.muted}
                                    value={customInterest}
                                    onChangeText={setCustomInterest}
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
                                    onPress={addCustomInterest}
                                    style={{
                                        backgroundColor: authColors.accent,
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        opacity: customInterest.trim() ? 1 : 0.6
                                    }}
                                    disabled={!customInterest.trim()}
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
