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
import { Ionicons } from '@expo/vector-icons';
import { conversationStyles as styles, conversationColors } from '../styles/ConversationStyle';
import ScheduleMatchScreen from './ScheduleMatchScreen';

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

    const [messageText, setMessageText] = useState('');
    const [showScheduleMatch, setShowScheduleMatch] = useState(false);
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
