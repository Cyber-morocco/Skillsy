import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBackground} />

      <View style={styles.content}>

        <View style={styles.topRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Ionicons name="arrow-back" size={20} color="#24253d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButtonWide}>
            <Ionicons name="calendar-outline" size={18} color="#24253d" />
            <Text style={styles.squareButtonText}>Beschikbaarheid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButtonWide}>
            <Ionicons name="create-outline" size={18} color="#24253d" />
            <Text style={styles.squareButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>



        <View style={styles.profileInfo}>
          <View style={styles.profileImage} />

          <Text style={styles.nameText}>Sophie Bakker</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>Centrum, Amsterdam</Text>
          </View>

          <View style={styles.reviewsContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.reviewsText}>4.9 (15 reviews)</Text>
            <Text style={styles.punt}>•</Text>
            <Ionicons name="laptop-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.reviewsText}>Lid sinds Maart 2024</Text>
          </View>

          <Text style={styles.aboutText}>
            Gepassioneerd lerares met een liefde voor talen en koken.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 430,
    backgroundColor: '#b832ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  squareButton: {
    height: 44,
    minWidth: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  squareButtonWide: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
  },
  squareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24253d',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  reviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  punt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

