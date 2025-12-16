import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomePage from './mobile/src/screens/HomePage';
import ExploreMapScreen from './mobile/src/screens/ExploreMapScreen';
import AppointmentsScreen from './mobile/src/screens/AppointmentsScreen';
import ProfileScreen from './mobile/src/screens/ProfileScreen';
import BottomNavBar from './mobile/src/components/BottomNavBar';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomePage />;
      case 'explore':
        return <ExploreMapScreen />;
      case 'appointments':
        return <AppointmentsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomePage />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomNavBar activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
  },
});
