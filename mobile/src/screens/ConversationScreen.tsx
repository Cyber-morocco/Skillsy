import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { conversationStyles as styles, conversationColors } from '../styles/ConversationStyle';
import ScheduleMatchScreen from './ScheduleMatchScreen';
import { subscribeToMessages, sendMessage as sendFirebaseMessage } from '../services/chatService';
import { auth } from '../config/firebase';
import { Message as FirebaseMessage } from '../types';
import { Unsubscribe } from 'firebase/firestore';

type Message = {
    id: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
};

type ConversationProps = {
    route?: {
        params?: {
            chatId: string;
            contactId: string;
            contactName: string;
            contactInitials: string;
            contactColor: string;
            contactSubtitle?: string;
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
    const contactSubtitle = route?.params?.contactSubtitle || '';
    const chatId = route?.params?.chatId;

    const [messageText, setMessageText] = useState('');
    const [showScheduleMatch, setShowScheduleMatch] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
            // Map Firebase messages to the format expected by the UI
            const formattedMessages = newMessages.map(m => ({
                id: m.id,
                text: m.text,
                sender: m.senderId === auth.currentUser?.uid ? 'me' as const : 'other' as const,
                time: m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '',
            }));
            setMessages(formattedMessages);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async () => {
        if (messageText.trim() && chatId) {
            try {
                const text = messageText.trim();
                setMessageText(''); // Clear input early for better UX
                await sendFirebaseMessage(chatId, text);
            } catch (error) {
                console.error('Send message error:', error);
            }
        }
    };

    const handleAppointmentPress = () => {
        setShowScheduleMatch(true);
    };

    if (showScheduleMatch) {
        return (
            <ScheduleMatchScreen
                contactName={contactName}
                contactInitials={contactInitials}
                contactColor={contactColor}
                contactSubtitle={contactSubtitle}
                onBack={() => setShowScheduleMatch(false)}
            />
        );
    }

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
                    <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>
                <View style={[styles.contactAvatar, { backgroundColor: contactColor }]}>
                    <Text style={styles.contactInitials}>{contactInitials}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.contactName}>{contactName}</Text>
                    <Text style={styles.contactStatus}>{contactSubtitle || 'Online'}</Text>
                </View>
                <TouchableOpacity style={styles.appointmentButton} onPress={handleAppointmentPress}>
                    <Ionicons name="calendar-outline" size={16} color="#F8FAFC" />
                    <Text style={styles.appointmentButtonText}>Afspraak</Text>
                </TouchableOpacity>
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
                    <Ionicons name="send" size={18} color="#F8FAFC" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

export default ConversationScreen;
