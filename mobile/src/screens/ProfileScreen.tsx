import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.headerBackground} />

      <View style={styles.content}>
        
        <Text style={styles.placeholderText}>Profielpagina</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#4a4b63',
  },
});
