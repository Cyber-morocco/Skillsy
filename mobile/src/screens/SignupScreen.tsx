import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authColors, authStyles as styles } from '../styles/authStyles';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = () => {
    // TODO: replace with actual sign-up flow
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
              onPress={() => {
                // TODO: hook up Google sign-up
              }}
            >
              <Image
                source={require('../../assets/google-logo.png')}
                style={styles.socialButtonIcon}
              />
              <Text style={styles.socialButtonText}>Sign up met Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Of</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Naam</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'fullName' && styles.inputFocused,
                ]}
                placeholder="Volledige naam"
                placeholderTextColor={authColors.placeholder}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>E-mailadres</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused,
                ]}
                placeholder="jij@voorbeeld.com"
                placeholderTextColor={authColors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Wachtwoord</Text>
                <Text style={styles.helperText}>Min. 8 tekens</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocused,
                ]}
                placeholder="Sterk wachtwoord"
                placeholderTextColor={authColors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Bevestig wachtwoord</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'confirmPassword' && styles.inputFocused,
                ]}
                placeholder="Herhaal wachtwoord"
                placeholderTextColor={authColors.placeholder}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

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

