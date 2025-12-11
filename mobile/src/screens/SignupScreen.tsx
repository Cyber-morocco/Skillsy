import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { authColors, authStyles as styles } from '../styles/authStyles';
import { AppInput } from '../components/AppInput';

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

  const handleSignup = () => {
    console.log('Signing up:', { fullName, email, password, confirmPassword });
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
          <View style={styles.headingContainer}>
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
              {/* We use AppInput but want to preserve the custom label row with helper text above,
                   so we might just pass 'style' or leave it blank and key off label.
                   To simplify, we can use AppInput without label prop and render label manually,
                   OR just update AppInput to support RightLabel, BUT for now I will manual render label */}
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
              style={styles.primaryButton}
              onPress={handleSignup}
            >
              <Text style={styles.primaryButtonText}>Account maken</Text>
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


