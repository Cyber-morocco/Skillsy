import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    TextInput,
    View,
     FlatList,
    TouchableOpacity,
} from 'react-native';
import { chatStyles as styles, chatColors } from '../styles/ChatStyle';

type Contact = {
    id: string;
    name: string;
    initials: string;
    status: 'online' | 'offline';
    lastSeen?: string;
    avatarColor: string;
};

//MOCKDATA NIET VERGETEN TE VERWIJDEREN
const CONTACTS: Contact[] = [
    { id: '1', name: 'Iliés Mazouz', initials: 'IM', status: 'offline', lastSeen: 'gisteren', avatarColor: '#3B82F6' },
    { id: '2', name: 'Yassine Eddouks', initials: 'YE', status: 'online', avatarColor: '#10B981' },
    { id: '3', name: 'Safwane El Masaoudi', initials: 'SE', status: 'offline', lastSeen: '3 uur geleden', avatarColor: '#F59E0B' },
    { id: '4', name: 'Adam Yousfi', initials: 'AY', status: 'online', avatarColor: '#EC4899' },
    { id: '5', name: 'Imad Ben Ali', initials: 'IB', status: 'online', avatarColor: '#8B5CF6' },
];

function ChatScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredContacts = CONTACTS.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const renderContact = ({ item }: { item: Contact }) => (
        <TouchableOpacity style={styles.contactItem} activeOpacity={0.7}>
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
                <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>U</Text>
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
        </View>
    );
}

export default ChatScreen;
