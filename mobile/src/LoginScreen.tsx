import React, { useState } from 'react';
import {
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
import { authColors, authStyles as styles } from './styles/authStyles';

type AuthScreenProps = {
  navigation?: {
    navigate?: (screen: string) => void;
  };
};

const LoginScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    // TODO: wire up with backend auth flow
    console.log('Logging in with:', { email, password });
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
            <Text style={styles.title}>Welkom terug</Text>
            <Text style={styles.subtitle}>
              Log in om verder te bouwen aan je skills en voortgang.
            </Text>
          </View>

          <View style={styles.card}>
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
                <TouchableOpacity>
                  <Text style={styles.link}>Wachtwoord vergeten?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocused,
                ]}
                placeholder="••••••••"
                placeholderTextColor={authColors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.primaryButtonText}>Inloggen</Text>
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

