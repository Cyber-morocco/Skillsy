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
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

type AuthScreenProps = {
  navigation?: {
    navigate?: (screen: string) => void;
  };
};

const LoginScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('E-mailadres vereist', 'Vul je e-mailadres in om een wachtwoordreset aan te vragen.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      Alert.alert('E-mail verzonden', 'Controleer je inbox voor instructies om je wachtwoord te resetten.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Kon reset-link niet verzenden';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Geen account gevonden met dit e-mailadres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Ongeldig e-mailadres';
      }

      Alert.alert('Fout', errorMessage);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    } catch (error: any) {
      let errorMessage = 'Er is een fout opgetreden';

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Ongeldig e-mailadres';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Geen account gevonden met dit e-mailadres';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Onjuist wachtwoord';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'E-mailadres of wachtwoord onjuist';
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert('Inlogfout', errorMessage);
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
              <Text style={styles.cardTitle}>Log in</Text>
              <Text style={styles.cardSubtitle}>
                Log in om verder te bouwen aan je skills en voortgang.
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
              <Text style={styles.socialButtonText}>log in met Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Of</Text>
              <View style={styles.dividerLine} />
            </View>

            <AppInput
              label="E-mailadres"
              placeholder="jij@voorbeeld.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <AppInput
              label="Wachtwoord"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.inlineRow}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.link}>wachtwoord vergeten</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Inloggen</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.mutedInfo}>
              Door in te loggen ga je akkoord met onze voorwaarden en privacy
              policy.
            </Text>
          </View>

          <View style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>Nog geen account?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Signup')}>
              <Text style={styles.link}>Account aanmaken</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
