import React, { useState, useEffect } from 'react';
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
import { signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadProfileImage } from '../services/userService';
import { Image } from 'react-native';

type NavProps = {
    navigation: {
        navigate: (screen: string) => void;
        goBack: () => void;
        canGoBack: () => boolean;
    };
};

const ProfileCreationStep1: React.FC<NavProps> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [street, setStreet] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [city, setCity] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser?.displayName) {
            setName(auth.currentUser.displayName);
        }
        setLoading(false);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Fout', 'Uitloggen mislukt');
        }
    };

    const searchAddress = async (text: string) => {
        setStreet(text);
        if (text.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            // Photon API is much faster and better suited for autocomplete
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`
            );
            const data = await response.json();
            setSuggestions(data.features || []);
            setShowSuggestions((data.features || []).length > 0);
        } catch (error) {
            console.error('Photon API error:', error);
        }
    };

    const selectSuggestion = (feature: any) => {
        const { properties, geometry } = feature;

        // Extract address components from Photon GeoJSON
        const streetName = properties.street || properties.name || '';
        const houseNumber = properties.housenumber ? ` ${properties.housenumber}` : '';
        const fullStreet = `${streetName}${houseNumber}`.trim();

        setStreet(fullStreet);
        setZipCode(properties.postcode || '');
        setCity(properties.city || '');

        // Store coordinates directly from the suggestion [lng, lat]
        if (geometry && geometry.coordinates) {
            setCoords({
                lat: geometry.coordinates[1],
                lng: geometry.coordinates[0]
            });
        }

        setSuggestions([]);
        setShowSuggestions(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Fout', 'Camera toestemming is vereist');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                            <ActivityIndicator size="large" color={authColors.accent} />
                        </View>
                    ) : (
                        <>
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
                                        Laten we beginnen met je profiel (foto is optioneel)
                                    </Text>
                                </View>

                                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                    <TouchableOpacity
                                        onPress={pickImage}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: 50,
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {image ? (
                                            <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <Ionicons name="camera" size={32} color={authColors.muted} />
                                        )}
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                                        <TouchableOpacity onPress={pickImage}>
                                            <Text style={{ color: authColors.accent, fontSize: 13, fontWeight: '600' }}>Kies foto</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={takePhoto}>
                                            <Text style={{ color: authColors.accent, fontSize: 13, fontWeight: '600' }}>Maak foto</Text>
                                        </TouchableOpacity>
                                        {image && (
                                            <TouchableOpacity onPress={() => setImage(null)}>
                                                <Text style={{ color: '#ff4444', fontSize: 13, fontWeight: '600' }}>Verwijder</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                <AppInput
                                    label="Kies een username"
                                    placeholder="Gebruikersnaam..."
                                    value={name}
                                    onChangeText={setName}
                                    autoComplete="username"
                                    importantForAutofill="yes"
                                    textContentType="username"
                                    editable={true}
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

                                    <View style={{ zIndex: 1000 }}>
                                        <AppInput
                                            label="Adres of Straat"
                                            placeholder="Typ je adres..."
                                            value={street}
                                            onChangeText={searchAddress}
                                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        />
                                        {showSuggestions && (
                                            <ScrollView
                                                style={[styles.autocompleteDropdown, { maxHeight: 200 }]}
                                                nestedScrollEnabled={true}
                                                keyboardShouldPersistTaps="handled"
                                            >
                                                {suggestions.map((item, index) => {
                                                    const { properties } = item;
                                                    const mainText = properties.street
                                                        ? `${properties.street}${properties.housenumber ? ' ' + properties.housenumber : ''}`
                                                        : properties.name;
                                                    const subText = `${properties.postcode || ''} ${properties.city || ''} ${properties.country || ''}`.trim();

                                                    return (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={styles.suggestionItem}
                                                            onPress={() => selectSuggestion(item)}
                                                        >
                                                            <Text style={styles.suggestionText}>{mainText}</Text>
                                                            {subText ? (
                                                                <Text style={styles.suggestionSubtext}>{subText}</Text>
                                                            ) : null}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        )}
                                    </View>

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
                                            onPress={handleLogout}
                                            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' }}
                                            disabled={saving}
                                        >
                                            <Text style={{ color: authColors.text, fontWeight: '600' }}>
                                                ‹ Terug
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.primaryButton, { marginTop: 0, paddingVertical: 12, paddingHorizontal: 32 }, saving && { opacity: 0.7 }]}
                                            onPress={async () => {
                                                if (!auth.currentUser) {
                                                    Alert.alert('Fout', 'Niet ingelogd');
                                                    return;
                                                }

                                                if (!name.trim() || !street.trim() || !zipCode.trim() || !city.trim()) {
                                                    Alert.alert('Fout', 'Vul alle verplichte velden in');
                                                    return;
                                                }

                                                setSaving(true);
                                                try {
                                                    let finalCoords = coords;

                                                    // Fallback to geocoding if coords were not set by autocomplete
                                                    if (!finalCoords) {
                                                        finalCoords = await geocodeAddress(street, city, zipCode);
                                                    }

                                                    if (!finalCoords) {
                                                        Alert.alert(
                                                            'Adres niet gevonden',
                                                            'We konden dit adres niet verifiëren. Controleer of de straatnaam, postcode en stad correct zijn.'
                                                        );
                                                        setSaving(false);
                                                        return;
                                                    }

                                                    let photoURL = null;
                                                    if (image) {
                                                        photoURL = await uploadProfileImage(image);
                                                    }

                                                    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                                        displayName: name.trim(),
                                                        bio: bio.trim(),
                                                        photoURL: photoURL,
                                                        location: {
                                                            street: street.trim(),
                                                            zipCode: zipCode.trim(),
                                                            city: city.trim(),
                                                            lat: finalCoords.lat,
                                                            lng: finalCoords.lng,
                                                        },
                                                        updatedAt: serverTimestamp(),
                                                    });

                                                    navigation.navigate('ProfileCreationStep2');
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
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
};

export default ProfileCreationStep1;
