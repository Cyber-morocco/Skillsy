import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, TouchableOpacity } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.headerBackground} />

      <View style={styles.content}>
        
        <View style={styles.topRow}>
          <TouchableOpacity activeOpacity={0.85} style={styles.squareButton}>
            <Text style={styles.squareButtonText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} style={styles.squareButtonWide}>
            <Text style={styles.squareButtonText}>Beschikbaarheid</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} style={styles.squareButtonWide}>
            <Text style={styles.squareButtonText}>Edit</Text>
          </TouchableOpacity>
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
    height: 180,
    backgroundColor: '#b832ff',
  },
  content: {
    flex: 1,
    marginTop: -140,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginBottom: 16,
  } as const,
  squareButton: {
    height: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  squareButtonWide: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  squareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24253d',
  },
});
