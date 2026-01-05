import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors } from '../styles/authStyles';
import { Ionicons } from '@expo/vector-icons';
import FeedItem from '../components/FeedItem';

const DUMMY_POSTS = [
  {
    id: '1',
    user: {
      name: 'Marco Vermeulen',
      avatar: 'https://i.pravatar.cc/150?img=11',
    },
    date: '25 nov, 10:30',
    type: 'Vraag' as const,
    content: 'Ik zoek iemand die me kan helpen met naaien. Ik wil graag leren hoe ik gordijnen kan maken!',
    likes: 5,
    comments: 3,
  },
  {
    id: '2',
    user: {
      name: 'Lisa De Vries',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    date: '25 nov, 09:15',
    type: 'Succes' as const,
    content: 'Vandaag mijn eerste JavaScript-les gevolgd! Zo blij dat ik nu begrijp hoe functies werken 🎉',
    likes: 12,
    comments: 5,
  },
  {
    id: '3',
    user: {
      name: 'Jan Jansen',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    date: '24 nov, 14:20',
    type: 'Materiaal' as const,
    content: 'Ik heb een oude boormachine over die nog prima werkt. Wie kan ik er blij mee maken?',
    likes: 8,
    comments: 12,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Alle');
  const tabs = ['Alle', 'Vragen', 'Successen', 'Materiaal'];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DUMMY_POSTS}
        renderItem={({ item }) => <FeedItem post={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  headerContainer: {
    marginBottom: 24,
    paddingTop: 24,
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
    borderRadius: 20,
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
