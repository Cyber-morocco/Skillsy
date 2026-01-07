import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { chatStyles as styles, chatColors } from '../styles/ChatStyle';
import { ChatStackParamList } from '../navigation/ChatStack';
import { MatchRequest } from '../types';
import { Ionicons } from '@expo/vector-icons';

type Contact = {
    id: string;
    name: string;
    initials: string;
    status: 'online' | 'offline';
    lastSeen?: string;
    avatarColor: string;
};

const CONTACTS: Contact[] = [
    { id: '1', name: 'Iliés Mazouz', initials: 'IM', status: 'offline', lastSeen: 'gisteren', avatarColor: '#3B82F6' },
    { id: '2', name: 'Yassine Eddouks', initials: 'YE', status: 'online', avatarColor: '#10B981' },
    { id: '3', name: 'Safwane El Masaoudi', initials: 'SE', status: 'offline', lastSeen: '3 uur geleden', avatarColor: '#F59E0B' },
    { id: '4', name: 'Adam Yousfi', initials: 'AY', status: 'online', avatarColor: '#EC4899' },
    { id: '5', name: 'Imad Ben Ali', initials: 'IB', status: 'online', avatarColor: '#8B5CF6' },
];

interface ChatScreenProps {
    matchRequests?: MatchRequest[];
    onRespondMatch?: (matchId: string, status: 'accepted' | 'rejected') => void;
    onClearAllMatches?: (subject?: string) => void;
}

function ChatScreen({ matchRequests = [], onRespondMatch, onClearAllMatches }: ChatScreenProps) {
    const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [matchesModalVisible, setMatchesModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string>('All');

    const filteredContacts = CONTACTS.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingMatches = matchRequests.filter(m => m.status === 'pending');

    const subjects = ['All', ...Array.from(new Set(pendingMatches.map(m => m.subject).filter(Boolean)))];

    const displayedMatches = selectedFilter === 'All'
        ? pendingMatches
        : pendingMatches.filter(m => m.subject === selectedFilter);

    const openConversation = (contact: Contact) => {
        navigation.navigate('Conversation', {
            contactId: contact.id,
            contactName: contact.name,
            contactInitials: contact.initials,
            contactColor: contact.avatarColor,
        });
    };

    const renderContact = ({ item }: { item: Contact }) => (
        <TouchableOpacity
            style={styles.contactItem}
            activeOpacity={0.7}
            onPress={() => openConversation(item)}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.contactAvatar, { backgroundColor: item.avatarColor }]}>
                    <Text style={styles.contactAvatarText}>{item.initials}</Text>
                </View>
                {item.status === 'online' && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactStatus}>
                    {item.status === 'online' ? 'Online' : `Laatst gezien ${item.lastSeen}`}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.avatarText}>U</Text>
                    </View>
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
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6
                }}
                onPress={() => setMatchesModalVisible(true)}
            >
                <Ionicons name="people-circle-outline" size={18} color="#6366f1" />
                <Text style={{ color: '#6366f1', fontSize: 13, fontWeight: '600' }}>
                    Match Verzoeken {pendingMatches.length > 0 && `(${pendingMatches.length})`}
                </Text>
            </TouchableOpacity>

            {filteredContacts.length > 0 ? (
                <FlatList
                    data={filteredContacts}
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
                                onPress={() => {
                                    onClearAllMatches?.(selectedFilter);
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
                                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                                <Text style={{ color: '#fff', fontWeight: '700' }}>{match.fromUserName.charAt(0)}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: '#fff', fontWeight: '600' }}>{match.fromUserName}</Text>
                                                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Wil matchen voor <Text style={{ color: '#818cf8' }}>{match.subject || 'iets'}</Text></Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => onRespondMatch?.(match.id, 'rejected')}>
                                                <Ionicons name="close-circle" size={32} color="#EF4444" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => onRespondMatch?.(match.id, 'accepted')}>
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
        </View>
    );
}

export default ChatScreen;
