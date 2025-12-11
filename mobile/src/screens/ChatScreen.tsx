// screens/ChatScreen.tsx
import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { chatStyles as styles, chatColors } from '../styles/ChatStyle';

function ChatScreen() {
    const [searchQuery, setSearchQuery] = useState('');

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
                    placeholderTextColor={chatColors.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Geen berichten.</Text>
            </View>
        </View>
    );
}

export default ChatScreen;
