import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './mobile/src/config/firebase';
import HomePage from './mobile/src/screens/HomePage';
import ExploreMapScreen from './mobile/src/screens/ExploreMapScreen';
import AppointmentsScreen from './mobile/src/screens/AppointmentsScreen';
import ProfileScreen from './mobile/src/screens/ProfileScreen';
import BottomNavBar from './mobile/src/components/BottomNavBar';
import ChatStackNavigator from './mobile/src/navigation/ChatStack';
import Availability from './mobile/src/screens/Availability';
import AuthStackNavigator from './mobile/src/navigation/AuthStack';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile' | 'availability';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavName>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  // Écouter les changements d'état d'authentification
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

  // Écouter le statut de complétion du profil
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setProfileComplete(data.profileComplete ?? true);
        } else {
          // Document doesn't exist yet, assume profile not complete
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
        return <Availability />;
      case 'home':
        return <HomePage />;
      case 'explore':
        return <ExploreMapScreen />;
      case 'appointments':
        return <AppointmentsScreen />;
      case 'messages':
        return <ChatStackNavigator />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      default:
        return <HomePage />;
    }
  };

  const handleNavigate = (screen: NavName) => {
    setActiveScreen(screen);
  };

  // Afficher un loader pendant la vérification de l'auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Si pas connecté OU profil pas complet, afficher AuthStack (Login/Signup/ProfileCreation)
  if (!user || !profileComplete) {
    return <AuthStackNavigator />;
  }

  // Si connecté, afficher l'app principale
  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomNavBar activeScreen={activeScreen} onNavigate={handleNavigate} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
