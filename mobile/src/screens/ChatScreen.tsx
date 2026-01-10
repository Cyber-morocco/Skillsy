import React, { useState, useEffect } from 'react';
import {
    StatusBar,
    Text,
    TextInput,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { chatStyles as styles, chatColors } from '../styles/ChatStyle';
import { ChatStackParamList } from '../navigation/ChatStack';
import { MatchRequest, Conversation } from '../types';
import { subscribeToChats } from '../services/chatService';
import { auth } from '../config/firebase';
import { Unsubscribe } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';



import { Avatar } from '../components/Avatar';



interface ChatScreenProps {
    matchRequests?: MatchRequest[];
    onRespondMatch: (matchId: string, status: 'accepted' | 'rejected') => Promise<void>;
    onClearAllMatches: (subject?: string) => Promise<void>;
}

function ChatScreen({ matchRequests = [], onRespondMatch, onClearAllMatches }: ChatScreenProps) {
    const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [matchesModalVisible, setMatchesModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (!auth.currentUser) return;

        const unsubscribe = subscribeToChats((chats) => {
            setConversations(chats);
        });

        return () => unsubscribe();
    }, []);

    const filteredConversations = conversations.filter(conv => {
        const otherId = conv.participants.find(id => id !== auth.currentUser?.uid);
        const otherInfo = otherId ? conv.participantInfo[otherId] : null;


        if (conv.status === 'pending' && conv.matchInitiatorId !== auth.currentUser?.uid) {
            return false;
        }

        if (conv.status === 'rejected' && conv.matchInitiatorId !== auth.currentUser?.uid) {
            return false;
        }

        return otherInfo?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const pendingMatches = matchRequests.filter(m => m.status === 'pending');

    const subjects = ['All', ...Array.from(new Set(pendingMatches.map(m => m.subject).filter(Boolean)))];

    const displayedMatches = selectedFilter === 'All'
        ? pendingMatches
        : pendingMatches.filter(m => m.subject === selectedFilter);

    const openConversation = (conv: Conversation) => {
        const otherId = conv.participants.find(id => id !== auth.currentUser?.uid);
        const otherInfo = otherId ? conv.participantInfo[otherId] : null;
        if (!otherId || !otherInfo) return;

        navigation.navigate('Conversation', {
            chatId: conv.id,
            contactId: otherId,
            contactName: otherInfo.name,
            contactInitials: otherInfo.initials,
            contactColor: otherInfo.avatarColor,
            contactPhotoURL: otherInfo.photoURL,
        });
    };

    const renderContact = ({ item }: { item: Conversation }) => {
        const otherId = item.participants.find(id => id !== auth.currentUser?.uid);
        const otherInfo = otherId ? item.participantInfo[otherId] : null;
        if (!otherId || !otherInfo) return null;

        return (
            <TouchableOpacity
                style={styles.contactItem}
                activeOpacity={0.7}
                onPress={() => openConversation(item)}
            >
                <View style={styles.avatarContainer}>
                    <Avatar
                        uri={otherInfo.photoURL}
                        name={otherInfo.name}
                        initials={otherInfo.initials}
                        backgroundColor={otherInfo.avatarColor}
                        size={54}
                    />
                    {(item.unreadCount?.[auth.currentUser?.uid || ''] || 0) > 0 && (
                        <View style={styles.unreadIndicator} />
                    )}
                </View>
                <View style={styles.contactInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.contactName}>{otherInfo.name}</Text>
                        <Text style={[styles.contactStatus, { fontSize: 11 }]}>
                            {item.lastMessageTime?.toDate ? item.lastMessageTime.toDate().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                    </View>
                    <Text style={[styles.contactStatus, { marginTop: 2 }]} numberOfLines={1}>
                        {item.lastMessage || 'Geen berichten'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const handleOpenMatchChat = async (match: MatchRequest) => {
        const otherId = match.fromUserId;
        const otherName = match.fromUserName;


        const existingChat = conversations.find(c =>
            c.participants.includes(otherId) && c.participants.includes(auth.currentUser?.uid || '')
        );

        if (existingChat) {
            setMatchesModalVisible(false);
            openConversation(existingChat);
        } else {
            console.warn('Chat for match request not found');
        }
    };

    const handleRespondWithClose = async (matchId: string, status: 'accepted' | 'rejected') => {
        try {
            await onRespondMatch(matchId, status);
            if (status === 'accepted') {
                setMatchesModalVisible(false);
            }
        } catch (error) {
            console.error('Error responding to match:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        uri={auth.currentUser?.photoURL}
                        name={auth.currentUser?.displayName || 'User'}
                        size={36}
                    />
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}></Text>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Zoeken..."
                    placeholderTextColor={chatColors.notext}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <TouchableOpacity
                style={{
                    alignSelf: 'flex-end',
                    marginRight: 20,
                    marginBottom: 10,
                    marginTop: -10,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8
                }}
                onPress={() => setMatchesModalVisible(true)}
            >
                <Ionicons name="people-circle-outline" size={24} color="#6366f1" />
                <Text style={{ color: '#6366f1', fontSize: 14, fontWeight: '700' }}>
                    Match Verzoeken {pendingMatches.length > 0 && `(${pendingMatches.length})`}
                </Text>
            </TouchableOpacity>

            {filteredConversations.length > 0 ? (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderContact}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.contactsList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>Geen berichten.</Text>
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={matchesModalVisible}
                onRequestClose={() => setMatchesModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Match Verzoeken</Text>
                            <TouchableOpacity onPress={() => setMatchesModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {pendingMatches.length > 0 && (
                            <View style={{ marginBottom: 16 }}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                    {subjects.map(subject => (
                                        <TouchableOpacity
                                            key={subject}
                                            onPress={() => setSelectedFilter(subject)}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 20,
                                                backgroundColor: selectedFilter === subject ? '#6366f1' : 'rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{subject}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {pendingMatches.length > 0 && (
                            <TouchableOpacity
                                onPress={async () => {
                                    await onClearAllMatches(selectedFilter === 'All' ? undefined : selectedFilter);
                                }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    padding: 10,
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: 'rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>Verwijder alle verzoeken</Text>
                            </TouchableOpacity>
                        )}

                        <ScrollView>
                            {displayedMatches.length === 0 ? (
                                <Text style={{ color: '#9CA3AF', textAlign: 'center', marginVertical: 20 }}>
                                    {pendingMatches.length === 0 ? 'Geen nieuwe verzoeken.' : 'Geen resultaten voor dit filter.'}
                                </Text>
                            ) : (
                                displayedMatches.map(match => (
                                    <View key={match.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <Avatar
                                                uri={match.fromUserAvatar}
                                                name={match.fromUserName}
                                                size={40}
                                                style={{ marginRight: 12 }}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <TouchableOpacity onPress={() => handleOpenMatchChat(match)}>
                                                    <Text style={{ color: '#fff', fontWeight: '600' }}>{match.fromUserName}</Text>
                                                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Wil matchen voor <Text style={{ color: '#818cf8' }}>{match.subject || 'iets'}</Text></Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => handleRespondWithClose(match.id, 'rejected')}>
                                                <Ionicons name="close-circle" size={32} color="#EF4444" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleRespondWithClose(match.id, 'accepted')}>
                                                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default ChatScreen;
