import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
