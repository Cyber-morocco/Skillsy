import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors } from '../styles/authStyles';
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Alle');
  const tabs = ['Alle', 'Vragen', 'Successen', 'Materiaal'];

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

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
  tabsContainer: {
    marginTop: 24,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: authColors.card,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  activeTab: {
    backgroundColor: authColors.accent,
    borderColor: authColors.accent,
  },
  tabText: {
    color: authColors.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: authColors.text,
  },
});
