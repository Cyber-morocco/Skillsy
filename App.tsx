import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, Animated, TouchableOpacity } from 'react-native';
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
import VideoFeedScreen from './mobile/src/screens/VideoFeedScreen';
import PrePagina from './mobile/src/screens/PrePagina';
import BottomNavBar from './mobile/src/components/BottomNavBar';
import ChatStackNavigator from './mobile/src/navigation/ChatStack';
import AppointmentStackNavigator from './mobile/src/navigation/AppointmentStack';
import AuthStackNavigator from './mobile/src/navigation/AuthStack';
import { subscribeToMatchRequests, sendMatchRequest, respondToMatchRequest, subscribeToChats, clearAllMatchRequests } from './mobile/src/services/chatService';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, Talent, Review, MatchRequest, Conversation } from './mobile/src/types';

type NavName = 'home' | 'explore' | 'appointments' | 'messages' | 'profile' | 'availability' | 'exploreProfile' | 'availabilitySpecificDates' | 'videoFeed';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavName>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reviews, setReviews] = useState<{ [userId: string]: Review[] }>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [prevScreen, setPrevScreen] = useState<NavName | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'info' | 'success' }>({
    visible: false,
    message: '',
    type: 'info'
  });
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const prevConversationsRef = useRef<Conversation[]>([]);

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

    const unsubscribeMatches = subscribeToMatchRequests((requests) => {
      // If new match request, show toast
      if (requests.length > matchRequests.length) {
        const last = requests[0];
        if (last) {
          showToast(`${last.fromUserName} wil met je matchen!`, 'info');
        }
      }
      setMatchRequests(requests);
    });

    const unsubscribeChats = subscribeToChats((chats) => {
      // Detect new messages for toast
      chats.forEach(chat => {
        const prevChat = prevConversationsRef.current.find((pc: Conversation) => pc.id === chat.id);

        // If chat is new OR lastMessageTime changed
        const isNewMessage = !prevChat || (
          chat.lastMessageTime?.seconds !== prevChat.lastMessageTime?.seconds &&
          chat.lastMessageTime !== null
        );

        if (isNewMessage) {
          // Check if it's NOT from us (based on unread count increment)
          const myId = user?.uid;
          const currentCount = chat.unreadCount?.[myId || ''] || 0;
          const prevCount = prevChat?.unreadCount?.[myId || ''] || 0;

          if (currentCount > prevCount || (chat.status === 'active' && prevChat?.status === 'pending')) {
            showToast(chat.lastMessage || 'Nieuw bericht', 'info');
          }
        }
      });

      prevConversationsRef.current = chats;
      setConversations(chats);
    });

    return () => {
      unsubscribeMatches();
      unsubscribeChats();
    };
  }, [user, profileComplete]);

  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    setToast({ visible: true, message, type });
    Animated.spring(toastAnim, {
      toValue: 20,
      useNativeDriver: true,
      tension: 20,
      friction: 7
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }).start(() => setToast(prev => ({ ...prev, visible: false })));
    }, 4000);
  };

  const handleAddReview = (review: Review, userId: string) => {
    setReviews((prev: { [key: string]: Review[] }) => ({
      ...prev,
      [userId]: [review, ...(prev[userId] || [])]
    }));
  };

  const handleSendMatch = async (userId: string, userName: string) => {
    // Check if a conversation already exists
    const existingChat = conversations.find(conv =>
      conv.participants.includes(userId)
    );

    if (existingChat) {
      // If chat exists, just go to messages
      setActiveScreen('messages');
      return;
    }

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

  const handleClearAllMatches = async (subject?: string) => {
    try {
      await clearAllMatchRequests(auth.currentUser?.uid || '', subject);
    } catch (error) {
      console.error('Clear matches error:', error);
      Alert.alert('Fout', 'Kon matchverzoeken niet verwijderen.');
    }
  };

  const handleViewProfile = (userToView: any) => {
    const userIdToView = userToView?.uid || userToView?.userId;

    if (userIdToView === auth.currentUser?.uid) {
      setActiveScreen('profile');
      return;
    }

    setPrevScreen(activeScreen);
    setSelectedUser(userToView);
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
        return <ExploreMapScreen onViewProfile={handleViewProfile} onVideoFeed={() => setActiveScreen('videoFeed')} />;
      case 'videoFeed':
        return <VideoFeedScreen onBack={() => setActiveScreen('explore')} onViewProfile={handleViewProfile} />;
      case 'appointments':
        return <AppointmentStackNavigator />;
      case 'messages':
        return <ChatStackNavigator matchRequests={matchRequests} onRespondMatch={handleRespondMatch} onClearAllMatches={handleClearAllMatches} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'exploreProfile':
        const targetUserId = selectedUser?.uid || selectedUser?.userId;
        const existingChat = conversations.find(c => c.participants.includes(targetUserId));

        let matchStatus: 'none' | 'pending_sent' | 'pending_received' | 'active' = 'none';
        if (existingChat) {
          if (existingChat.status === 'active') {
            matchStatus = 'active';
          } else if (existingChat.status === 'pending') {
            matchStatus = existingChat.matchInitiatorId === user?.uid ? 'pending_sent' : 'pending_received';
          }
        }

        return (
          <ExploreProfileScreen
            userId={targetUserId}
            matchStatus={matchStatus}
            onBack={() => setActiveScreen(prevScreen || 'home')}
            onMakeAppointment={() => setActiveScreen('appointments')}
            onSendMessage={() => {
              if (matchStatus === 'active' || matchStatus === 'pending_received') {
                // If already active or we received it, go to messages
                setActiveScreen('messages');
              } else if (targetUserId) {
                handleSendMatch(targetUserId, selectedUser.name || selectedUser.displayName);
              }
            }}
          />
        );
      default:
        return <HomePage onViewProfile={handleViewProfile} />;
    }
  };

  const handleNavigate = (screen: NavName) => {
    setPrevScreen(null);
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
        key={user ? 'logged-in' : 'guest'}
        initialRouteName={user ? "ProfileCreationStep1" : "PrePagina"}
      />
    );
  }

  const unreadMessagesCount = conversations.reduce((acc, conv) => {
    return acc + (conv.unreadCount?.[user?.uid || ''] || 0);
  }, 0);

  const pendingMatchesCount = matchRequests.length;

  return (
    <View style={styles.container}>
      {toast.visible && (
        <Animated.View style={[
          styles.toastContainer,
          { transform: [{ translateY: toastAnim }] }
        ]}>
          <TouchableOpacity
            style={styles.toast}
            onPress={() => setActiveScreen('messages')}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.toastText} numberOfLines={2}>{toast.message}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={styles.screenContainer}>{renderScreen()}</View>
      {activeScreen !== 'videoFeed' && (
        <BottomNavBar
          activeScreen={
            activeScreen === 'exploreProfile'
              ? (prevScreen === 'explore' ? 'explore' : 'home')
              : (activeScreen === 'availabilitySpecificDates' ? 'availability' : (activeScreen as any))
          }
          onNavigate={handleNavigate}
          badges={{
            messages: unreadMessagesCount + pendingMatchesCount
          }}
        />
      )}
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
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    maxWidth: '100%',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});