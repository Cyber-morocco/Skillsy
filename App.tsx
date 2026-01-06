import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './mobile/src/config/firebase';
import {
  ExploreProfileScreen,
  Availability,
  AvailabilitySpecificDates,
  HomePage,
  ExploreMapScreen,
  AppointmentsScreen,
  ProfileScreen
} from './mobile/src/screens';
import BottomNavBar from './mobile/src/components/BottomNavBar';
import ChatStackNavigator from './mobile/src/navigation/ChatStack';
import AuthStackNavigator from './mobile/src/navigation/AuthStack';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile' | 'availability' | 'exploreProfile' | 'availabilitySpecificDates';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavName>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setProfileComplete(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setProfileComplete(data.profileComplete ?? true);
        } else {
          setProfileComplete(false);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to user profile:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'availability':
        return <Availability onNavigate={handleNavigate} />;
      case 'availabilitySpecificDates':
        return <AvailabilitySpecificDates onNavigate={handleNavigate} />;
      case 'home':
        return <HomePage onViewProfile={handleViewProfile} />;
      case 'explore':
        return <ExploreMapScreen />;
      case 'appointments':
        return <AppointmentsScreen onViewProfile={handleViewProfile} />;
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

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setActiveScreen('exploreProfile');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!user || !profileComplete) {
    return <AuthStackNavigator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomNavBar
        activeScreen={
          activeScreen === 'exploreProfile'
            ? 'home'
            : (activeScreen === 'availabilitySpecificDates' ? 'availability' : activeScreen as any)
        }
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1021',
  },
  screenContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
