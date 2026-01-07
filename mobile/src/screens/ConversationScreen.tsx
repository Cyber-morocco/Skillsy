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
import { subscribeToMessages, sendMessage as sendFirebaseMessage, updateMessage } from '../services/chatService';
import { createAppointment } from '../services/appointmentService';
import { auth } from '../config/firebase';
import { Message as FirebaseMessage } from '../types';
import { Unsubscribe } from 'firebase/firestore';

type Message = {
    id: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
    senderId: string;
    type?: 'text' | 'appointmentRequest';
    appointmentDate?: string;
    appointmentStatus?: 'pending' | 'accepted' | 'rejected';
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

            const formattedMessages = newMessages.map(m => {
                return {
                    id: m.id,
                    text: m.text,
                    sender: m.senderId === auth.currentUser?.uid ? 'me' as const : 'other' as const,
                    senderId: m.senderId,
                    time: m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '',
                    type: m.type || (m.appointmentDate ? 'appointmentRequest' : 'text'),
                    appointmentDate: m.appointmentDate,
                    appointmentStatus: m.appointmentStatus,
                };
            });
            setMessages(formattedMessages);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async () => {
        if (messageText.trim() && chatId) {
            try {
                const text = messageText.trim();
                setMessageText('');
                await sendFirebaseMessage(chatId, text);
            } catch (error) {
                console.error('Send message error:', error);
            }
        }
    };

    const handleAppointmentPress = () => {
        setShowScheduleMatch(true);
    };

    const handleMatchRequest = async (day: string) => {
        if (!chatId) return;

        const currentUserName = auth.currentUser?.displayName || 'Ik';
        const text = `${currentUserName} verzoekt om op ${day} een afspraak te nemen`;

        try {
            await sendFirebaseMessage(chatId, text, {
                type: 'appointmentRequest',
                appointmentDate: day,
                appointmentStatus: 'pending'
            });
            setShowScheduleMatch(false);
        } catch (error) {
            console.error('Error sending appointment request:', error);
        }
    };

    const handleRespondAppointment = async (messageId: string, status: 'accepted' | 'rejected') => {
        if (!chatId) return;
        try {
            await updateMessage(chatId, messageId, { appointmentStatus: status });

            if (status === 'accepted') {
                const message = messages.find(m => m.id === messageId);
                if (message && message.appointmentDate) {
                    await createAppointment({
                        tutorId: auth.currentUser?.uid || '',
                        studentId: message.senderId,
                        participantIds: [auth.currentUser?.uid || '', message.senderId],
                        tutorName: auth.currentUser?.displayName || 'Tutor',
                        tutorAvatar: auth.currentUser?.photoURL || '',
                        studentName: contactName,
                        studentAvatar: '', 
                        title: 'Afspraak',
                        subtitle: `Met ${contactName}`,
                        date: message.appointmentDate,
                        time: '10:00 - 11:00', 
                        location: 'fysiek',
                        initials: contactInitials,
                        status: 'confirmed'
                    });
                }
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    };

    if (showScheduleMatch) {
        return (
            <ScheduleMatchScreen
                contactId={route?.params?.contactId || ''}
                contactName={contactName}
                contactInitials={contactInitials}
                contactColor={contactColor}
                contactSubtitle={contactSubtitle}
                onBack={() => setShowScheduleMatch(false)}
                onMatch={handleMatchRequest}
            />
        );
    }

    const renderMessage = ({ item }: { item: Message }) => {
        if (item.type === 'appointmentRequest' || (item.appointmentDate && item.appointmentStatus)) {
            return (
                <View style={[
                    styles.messageBubble,
                    item.sender === 'me' ? styles.myMessage : styles.otherMessage,
                    { minWidth: 250 }
                ]}>
                    <Text style={[
                        styles.messageText,
                        item.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
                        { fontWeight: '600', marginBottom: 8 }
                    ]}>
                        {item.text}
                    </Text>

                    {item.appointmentStatus === 'pending' ? (
                        item.sender === 'other' ? (
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: '#10B981', padding: 8, borderRadius: 8, alignItems: 'center' }}
                                    onPress={() => handleRespondAppointment(item.id, 'accepted')}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Accepteren</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: '#EF4444', padding: 8, borderRadius: 8, alignItems: 'center' }}
                                    onPress={() => handleRespondAppointment(item.id, 'rejected')}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Weigeren</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>Wachten op reactie...</Text>
                            </View>
                        )
                    ) : (
                        <View style={{ marginTop: 5, padding: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8 }}>
                            <Text style={{
                                color: item.sender === 'me' ? '#fff' : '#000',
                                textAlign: 'center',
                                fontStyle: 'italic',
                                fontSize: 12
                            }}>
                                {item.appointmentStatus === 'accepted' ? 'Afspraak geaccepteerd' : 'Afspraak geweigerd'}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.messageTime}>{item.time}</Text>
                </View>
            );
        }

        return (
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
    };

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
