import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './mobile/src/config/firebase';
import HomePage from './mobile/src/screens/HomePage';
import ExploreMapScreen from './mobile/src/screens/ExploreMapScreen';
import AppointmentsScreen from './mobile/src/screens/AppointmentsScreen';
import ProfileScreen from './mobile/src/screens/ProfileScreen';
import ExploreProfileScreen from './mobile/src/screens/ExploreProfileScreen';
import Availability from './mobile/src/screens/Availability';
import AvailabilitySpecificDates from './mobile/src/screens/Availability_SpecificDates';
import PrePagina from './mobile/src/screens/PrePagina';
import BottomNavBar from './mobile/src/components/BottomNavBar';
import ChatStackNavigator from './mobile/src/navigation/ChatStack';
import AuthStackNavigator from './mobile/src/navigation/AuthStack';
import { subscribeToMatchRequests, sendMatchRequest, respondToMatchRequest } from './mobile/src/services/chatService';
import { Unsubscribe } from 'firebase/firestore';
import { MatchRequest, Review } from './mobile/src/types';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile' | 'availability' | 'exploreProfile' | 'availabilitySpecificDates';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavName>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [reviews, setReviews] = useState<{ [userId: string]: Review[] }>({});
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
          setProfileComplete(data.profileComplete ?? false);
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

  useEffect(() => {
    if (!user || !profileComplete) return;

    const unsubscribe = subscribeToMatchRequests((requests) => {
      setMatchRequests(requests);
    });

    return () => unsubscribe();
  }, [user, profileComplete]);

  const handleAddReview = (review: Review, userId: string) => {
    setReviews((prev: { [key: string]: Review[] }) => ({
      ...prev,
      [userId]: [review, ...(prev[userId] || [])]
    }));
  };

  const handleSendMatch = async (userId: string, userName: string) => {
    try {
      await sendMatchRequest(userId, userName, 'Samen leren');
      Alert.alert('Match verstuurd', `Je hebt een matchverzoek gestuurd naar ${userName}.`);
    } catch (error) {
      console.error('Send match error:', error);
      Alert.alert('Fout', 'Kon matchverzoek niet versturen.');
    }
  };

  const handleRespondMatch = async (matchId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToMatchRequest(matchId, status);
      if (status === 'accepted') {
        Alert.alert('Match geaccepteerd', 'Jullie kunnen nu chatten!');
      }
    } catch (error) {
      console.error('Respond match error:', error);
      Alert.alert('Fout', 'Kon niet reageren op matchverzoek.');
    }
  };

  const handleClearAllMatches = () => {
    setMatchRequests([]);
  };

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setActiveScreen('exploreProfile');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'availability':
        return <Availability onNavigate={handleNavigate} />;
      case 'availabilitySpecificDates':
        return <AvailabilitySpecificDates onNavigate={handleNavigate} />;
      case 'home':
        return <HomePage onViewProfile={handleViewProfile} />;
      case 'explore':
        return <ExploreMapScreen onViewProfile={handleViewProfile} />;
      case 'appointments':
        return (
          <AppointmentsScreen
            onViewProfile={handleViewProfile}
            onSubmitReview={handleAddReview}
            reviewedUsers={Object.keys(reviews)}
          />
        );
      case 'messages':
        return <ChatStackNavigator matchRequests={matchRequests} onRespondMatch={handleRespondMatch} onClearAllMatches={handleClearAllMatches} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'exploreProfile':
        return (
          <ExploreProfileScreen
            userId={selectedUser?.uid || selectedUser?.userId}
            onBack={() => setActiveScreen('home')}
            onMakeAppointment={() => setActiveScreen('appointments')}
            onSendMessage={() => {
              if (selectedUser?.uid || selectedUser?.userId) {
                handleSendMatch(selectedUser.uid || selectedUser.userId, selectedUser.name || selectedUser.displayName);
              }
            }}
          />
        );
      default:
        return <HomePage onViewProfile={handleViewProfile} />;
    }
  };

  const handleNavigate = (screen: NavName) => {
    setActiveScreen(screen);
  };

  if (loading || (user && profileComplete === null)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!user || !profileComplete) {
    return (
      <AuthStackNavigator
        initialRouteName={user ? "ProfileCreationStep1" : "PrePagina"}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <BottomNavBar
        activeScreen={
          activeScreen === 'exploreProfile'
            ? 'home'
            : (activeScreen === 'availabilitySpecificDates' ? 'availability' : activeScreen)
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
