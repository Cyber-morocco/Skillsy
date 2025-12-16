import React, { useState } from 'react';
import {
    StatusBar,
    Text,
    TextInput,
    View,
    FlatList,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { conversationStyles as styles, conversationColors } from '../styles/ConversationStyle';

type Message = {
    id: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
};

type ConversationProps = {
    route?: {
        params?: {
            contactName: string;
            contactInitials: string;
            contactColor: string;
        };
    };
    navigation?: {
        goBack: () => void;
    };
};

function ConversationScreen({ route, navigation }: ConversationProps) {
    const contactName = route?.params?.contactName || 'Contact';
    const contactInitials = route?.params?.contactInitials || 'C';
    const contactColor = route?.params?.contactColor || '#7C3AED';

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hallo! Hoe gaat het?', sender: 'other', time: '10:30' },
        { id: '2', text: 'Goed! En met jou?', sender: 'me', time: '10:32' },
        { id: '3', text: 'Prima, bedankt voor het vragen!', sender: 'other', time: '10:33' },
    ]);

    const sendMessage = () => {
        if (messageText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: messageText,
                sender: 'me',
                time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setMessageText('');
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'me' ? styles.myMessageText : styles.otherMessageText
            ]}>
                {item.text}
            </Text>
            <Text style={styles.messageTime}>{item.time}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={[styles.contactAvatar, { backgroundColor: contactColor }]}>
                    <Text style={styles.contactInitials}>{contactInitials}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.contactName}>{contactName}</Text>
                    <Text style={styles.contactStatus}>Online</Text>
                </View>
            </View>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Typ een bericht..."
                    placeholderTextColor={conversationColors.notext}
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendIcon}></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

export default ConversationScreen;
