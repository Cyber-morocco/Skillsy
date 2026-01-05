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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors, authStyles as styles } from '../styles/authStyles';
import { AppInput } from '../components/AppInput';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
    const [zipCode, setZipCode] = useState('');
    const [city, setCity] = useState('');
    const [saving, setSaving] = useState(false);

    const geocodeAddress = async (street: string, city: string, zipCode: string): Promise<{ lat: number; lng: number } | null> => {
        try {
            const address = `${street}, ${zipCode} ${city}`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
                { headers: { 'User-Agent': 'Skillsy-App/1.0' } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
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

                        <AppInput
                            label="Wat is je naam?"
                            placeholder="Je naam..."
                            value={name}
                            onChangeText={setName}
                        />

                        <AppInput
                            label="Vertel iets over jezelf"
                            placeholder="Ik ben een gepassioneerde leraar en wil graag mijn kennis delen..."
                            multiline
                            numberOfLines={4}
                            value={bio}
                            onChangeText={setBio}
                            style={{ height: 100, textAlignVertical: 'top', paddingTop: 12 }}
                        />

                        <View style={{ marginBottom: 20, marginTop: 16 }}>
                            <Text style={[styles.label, { fontSize: 18, marginBottom: 6 }]}>Locatie</Text>
                            <Text style={{ color: authColors.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
                                We delen je exacte adres niet. Alleen je wijk of buurt wordt getoond.
                            </Text>

                            <AppInput
                                label="Straatnaam"
                                placeholder="Bijv. Amsterdam Centrum"
                                value={street}
                                onChangeText={setStreet}
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <AppInput
                                    label="Postcode"
                                    placeholder="Bijv. 1030"
                                    value={zipCode}
                                    onChangeText={setZipCode}
                                    containerStyle={{ flex: 0.48 }}
                                />
                                <AppInput
                                    label="Stad"
                                    placeholder="Bijv. Schaarbeek"
                                    value={city}
                                    onChangeText={setCity}
                                    containerStyle={{ flex: 0.48 }}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' }}
                                    disabled={saving}
                                >
                                    <Text style={{ color: authColors.text, fontWeight: '600' }}>‹ Vorige</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.primaryButton, { marginTop: 0, paddingVertical: 12, paddingHorizontal: 32 }, saving && { opacity: 0.7 }]}
                                    onPress={async () => {
                                        if (!auth.currentUser) {
                                            Alert.alert('Erreur', 'Utilisateur non connecté');
                                            return;
                                        }

                                        setSaving(true);
                                        try {
                                            const coords = await geocodeAddress(street, city, zipCode);

                                            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                                displayName: name.trim() || auth.currentUser.displayName,
                                                bio: bio.trim(),
                                                location: {
                                                    street: street.trim(),
                                                    zipCode: zipCode.trim(),
                                                    city: city.trim(),
                                                    lat: coords?.lat || 50.8503,
                                                    lng: coords?.lng || 4.3517,
                                                },
                                                profileComplete: true,
                                                updatedAt: serverTimestamp(),
                                            });
                                        } catch (error: any) {
                                            Alert.alert('Erreur', error.message || 'Impossible de sauvegarder le profil');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Volgende ›</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileCreationStep1;
