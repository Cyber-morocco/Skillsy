import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomePage from './mobile/src/screens/HomePage';
import ExploreMapScreen from './mobile/src/screens/ExploreMapScreen';
import AppointmentsScreen from './mobile/src/screens/AppointmentsScreen';
import ProfileScreen from './mobile/src/screens/ProfileScreen';
import BottomNavBar from './mobile/src/components/BottomNavBar';
import ChatStackNavigator from './mobile/src/navigation/ChatStack';
import Availability from './mobile/src/screens/Availability';
import ExploreProfileScreen from './mobile/src/screens/ExploreProfileScreen';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile' | 'availability' | 'exploreProfile';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavName>('home');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setActiveScreen('exploreProfile');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'availability':
        return <Availability />;
      case 'home':
        return <HomePage onViewProfile={handleViewProfile} />;
      case 'explore':
        return <ExploreMapScreen />;
      case 'appointments':
        return <AppointmentsScreen />;
      case 'messages':
        return <ChatStackNavigator />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'exploreProfile':
        return (
          <ExploreProfileScreen
            user={selectedUser}
            onBack={() => setActiveScreen('home')}
            onMakeAppointment={() => setActiveScreen('appointments')}
            onSendMessage={() => setActiveScreen('messages')}
          />
        );
      default:
        return <HomePage onViewProfile={handleViewProfile} />;
    }
  };

  const handleNavigate = (screen: NavName) => {
    setActiveScreen(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomNavBar activeScreen={activeScreen === 'exploreProfile' ? 'home' : activeScreen} onNavigate={handleNavigate} />
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
