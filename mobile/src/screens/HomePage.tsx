import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors } from '../styles/authStyles';
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Buurt Feed</Text>
          <Text style={styles.subtitle}>
            Deel je vragen, successen en materialen met je buurt
          </Text>
        </View>

        <TouchableOpacity style={styles.newPostButton}>
          <Ionicons name="add" size={24} color={authColors.text} style={styles.icon} />
          <Text style={styles.buttonText}>Nieuw Bericht Plaatsen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: authColors.muted,
    lineHeight: 22,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.accent,
    paddingVertical: 16,
    borderRadius: 20, // Matching the primaryButton radius from authStyles
    shadowColor: authColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: authColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
