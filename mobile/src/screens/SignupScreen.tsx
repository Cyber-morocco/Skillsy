import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors, authStyles as styles } from '../styles/authStyles';
import { AppInput } from '../components/AppInput';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

type AuthScreenProps = {
  navigation?: {
    navigate?: (screen: string) => void;
  };
};

const SignupScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName.trim() });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: fullName.trim(),
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigation?.navigate?.('ProfileCreationStep1');
    } catch (error: any) {
      let errorMessage = 'Er is een fout opgetreden';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Dit e-mailadres is al in gebruik';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ongeldig e-mailadres';
          break;
        case 'auth/weak-password':
          errorMessage = 'Wachtwoord is te zwak';
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert('Registratiefout', errorMessage);
    } finally {
      setLoading(false);
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
          <View style={styles.headingContainer}>
            <TouchableOpacity
              onPress={() => navigation?.navigate ? navigation.navigate('PrePagina') : null}
              style={{ position: 'absolute', left: 24, top: 24, zIndex: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.brandPill}>
              <Text style={styles.brandPillText}>Skillsy</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sign up</Text>
              <Text style={styles.cardSubtitle}>
                sign up om onze app te verkennen
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.socialButton}
              onPress={() => { }}
            >
              <Image
                source={require('../../../assets/google-logo.png')}
                style={styles.socialButtonIcon}
              />
              <Text style={styles.socialButtonText}>Sign up met Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Of</Text>
              <View style={styles.dividerLine} />
            </View>

            <AppInput
              label="Naam"
              placeholder="Volledige naam"
              value={fullName}
              onChangeText={setFullName}
            />

            <AppInput
              label="E-mailadres"
              placeholder="jij@voorbeeld.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Wachtwoord</Text>
                <Text style={styles.helperText}>Min. 8 tekens</Text>
              </View>
              <AppInput
                placeholder="Sterk wachtwoord"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <AppInput
              label="Bevestig wachtwoord"
              placeholder="Herhaal wachtwoord"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Account maken</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.mutedInfo}>
              Door je aan te melden accepteer je onze algemene voorwaarden en
              privacyverklaring.
            </Text>
          </View>

          <View style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>Heb je al een account?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Login')}>
              <Text style={styles.link}>Inloggen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
