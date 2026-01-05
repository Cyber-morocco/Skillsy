import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import Availability from './mobile/src/screens/Availability';
import AvailabilitySpecificDates from './mobile/src/screens/Availability_SpecificDates';
import ExploreProfileScreen from './mobile/src/screens/ExploreProfileScreen';
import HomePage from './mobile/src/screens/HomePage';
import ExploreMapScreen from './mobile/src/screens/ExploreMapScreen';
import AppointmentsScreen from './mobile/src/screens/AppointmentsScreen';
import ChatStackNavigator from './mobile/src/navigation/ChatStack';
import ProfileScreen from './mobile/src/screens/ProfileScreen';
import BottomNavBar from './mobile/src/components/BottomNavBar';

type NavName =
  | 'home'
  | 'explore'
  | 'appointments'
  | 'messages'
  | 'profile'
  | 'availability'
  | 'exploreProfile'
  | 'availabilitySpecificDates';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavName>('home');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const navigationObj: any = {
    navigate: (name: string) => {
      if (name === 'AvailabilitySpecificDates') {
        setActiveScreen('availabilitySpecificDates');
        return;
      }
    
      const map: Record<string, NavName> = {
        home: 'home',
        explore: 'explore',
        appointments: 'appointments',
        messages: 'messages',
        profile: 'profile',
        availability: 'availability',
        exploreProfile: 'exploreProfile',
      };
      const key = (name as string) as keyof typeof map;
      if (map[key]) setActiveScreen(map[key]);
    },
    goBack: () => setActiveScreen('home'),
  };

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setActiveScreen('exploreProfile');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'availability':
        return <Availability navigation={navigationObj} />;
      case 'availabilitySpecificDates':
        return <AvailabilitySpecificDates navigation={navigationObj} />;
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
      <BottomNavBar
        activeScreen={
          activeScreen === 'exploreProfile'
            ? 'home'
            : activeScreen === 'availabilitySpecificDates'
            ? 'availability'
            : activeScreen
        }
        onNavigate={handleNavigate}
        badges={{ messages: 2 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  screenContainer: { flex: 1 },
});
