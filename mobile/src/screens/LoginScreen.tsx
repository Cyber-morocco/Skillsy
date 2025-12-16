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

const LoginScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
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
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.8}
                onPress={() => setRememberMe((prev) => !prev)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    rememberMe && { backgroundColor: authColors.accent },
                  ]}
                />
                <Text style={styles.checkboxLabel}>onthoud me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.link}>wachtwoord vergeten</Text>
              </TouchableOpacity>
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
