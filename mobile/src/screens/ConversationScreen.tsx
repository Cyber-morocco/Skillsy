import React, { useState, useEffect, useRef } from 'react';
import {
    StatusBar,
    Text,
    TextInput,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { conversationStyles as styles, conversationColors } from '../styles/ConversationStyle';
import ScheduleMatchScreen from './ScheduleMatchScreen';
import { subscribeToMessages, sendMessage as sendFirebaseMessage, updateMessage, subscribeToChat, markChatAsRead } from '../services/chatService';
import { createAppointment } from '../services/appointmentService';
import { auth, db } from '../config/firebase';
import { Message as FirebaseMessage, Conversation, Skill } from '../types';
import { scheduleMatchColors } from '../styles/ScheduleMatchStyles';
import { Unsubscribe } from 'firebase/firestore';

import { Avatar } from '../components/Avatar';


type Message = {
    id: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
    senderId: string;
    type?: 'text' | 'appointmentRequest';
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentStatus?: 'pending' | 'accepted' | 'rejected' | 'countered';
    duration?: number;
    proposedPrice?: number;
    matchType?: 'pay' | 'swap';
    swapSkillName?: string;
    tutorSkillName?: string;
    tutorId?: string;
    studentId?: string;
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
            contactPhotoURL?: string;
        };
    };
    navigation?: {
        goBack: () => void;
        navigate: (screen: string, params?: any) => void;
    };
};

function ConversationScreen({ route, navigation }: ConversationProps) {
    const contactName = route?.params?.contactName || 'Contact';
    const contactInitials = route?.params?.contactInitials || 'C';
    const contactColor = route?.params?.contactColor || '#7C3AED';
    const contactPhotoURL = route?.params?.contactPhotoURL;
    const contactSubtitle = route?.params?.contactSubtitle || '';
    const chatId = route?.params?.chatId;
    const contactId = route?.params?.contactId || '';

    const [messageText, setMessageText] = useState('');
    const [showScheduleMatch, setShowScheduleMatch] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatData, setChatData] = useState<Conversation | null>(null);
    const [selectedMessageForCounter, setSelectedMessageForCounter] = useState<Message | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!chatId) return;

        // Mark as read immediately when joining
        markChatAsRead(chatId);

        const unsubscribeChat = subscribeToChat(chatId, (updatedChat) => {
            setChatData(updatedChat);
        });

        const unsubscribeMessages = subscribeToMessages(chatId, (newMessages) => {
            // Mark as read whenever new messages arrive and we are in the chat
            markChatAsRead(chatId);

            const formattedMessages = newMessages.map(m => {
                return {
                    id: m.id,
                    text: m.text,
                    sender: m.senderId === auth.currentUser?.uid ? 'me' as const : 'other' as const,
                    senderId: m.senderId,
                    time: m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '',
                    type: m.type || (m.appointmentDate ? 'appointmentRequest' : 'text'),
                    appointmentDate: m.appointmentDate,
                    appointmentTime: m.appointmentTime,
                    appointmentStatus: m.appointmentStatus as any,
                    duration: m.duration,
                    proposedPrice: m.proposedPrice,
                    matchType: (m as any).matchType,
                    swapSkillName: (m as any).swapSkillName,
                    tutorSkillName: (m as any).tutorSkillName,
                    tutorId: (m as any).tutorId,
                    studentId: (m as any).studentId,
                };
            });
            setMessages(formattedMessages);
        });

        return () => {
            unsubscribeChat();
            unsubscribeMessages();
        };
    }, [chatId]);

    const isPending = chatData?.status === 'pending';
    const isRejected = chatData?.status === 'rejected';
    const isInitiator = chatData?.matchInitiatorId === auth.currentUser?.uid;
    const canSendMessage = (!isPending && !isRejected) || (isPending && !isInitiator);

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

    const handleMatchRequest = async (day: string, time: string, duration: number, price: number, type: 'pay' | 'swap' = 'pay', swapSkillName?: string, tutorSkillName?: string, dateKey?: string) => {
        if (!chatId) return;

        const currentUserName = auth.currentUser?.displayName || 'Ik';
        const text = type === 'pay'
            ? `${currentUserName} verzoekt om op ${day} om ${time} een afspraak te nemen van ${duration} uur voor €${price}`
            : `${currentUserName} stelt een skill swap voor: ${tutorSkillName} in ruil voor ${swapSkillName}.`;

        const [startStr, endStr] = time.split(' - ');
        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        const metadata: any = {
            type: 'appointmentRequest',
            appointmentDate: day,
            dateKey: dateKey,
            appointmentTime: time,
            startTimeMinutes: parseTime(startStr),
            endTimeMinutes: endStr ? parseTime(endStr) : parseTime(startStr) + (duration * 60),
            appointmentStatus: 'pending',
            duration: duration,
            proposedPrice: price,
            matchType: type,
            tutorId: selectedMessageForCounter ? selectedMessageForCounter.tutorId : contactId,
            studentId: selectedMessageForCounter ? selectedMessageForCounter.studentId : (auth.currentUser?.uid || ''),
        };

        if (swapSkillName) metadata.swapSkillName = swapSkillName;
        if (tutorSkillName) metadata.tutorSkillName = tutorSkillName;

        try {
            if (selectedMessageForCounter) {
                await updateMessage(chatId, selectedMessageForCounter.id, { appointmentStatus: 'countered' });
                setSelectedMessageForCounter(null);
            }

            await sendFirebaseMessage(chatId, text, metadata);
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
                    const tutorId = message.tutorId || (message.sender === 'me' ? contactId : auth.currentUser?.uid || '');
                    const studentId = message.studentId || (message.sender === 'me' ? auth.currentUser?.uid || '' : contactId);

                    await createAppointment({
                        tutorId,
                        studentId,
                        participantIds: [auth.currentUser?.uid || '', contactId],
                        tutorName: tutorId === auth.currentUser?.uid ? (auth.currentUser?.displayName || 'Tutor') : contactName,
                        tutorAvatar: '',
                        studentName: studentId === auth.currentUser?.uid ? (auth.currentUser?.displayName || 'Student') : contactName,
                        studentAvatar: '',
                        title: message.matchType === 'swap' ? 'Skill Swap' : 'Afspraak',
                        subtitle: message.matchType === 'swap'
                            ? `Swap: ${message.swapSkillName} voor ${message.tutorSkillName}`
                            : `Met ${contactName}`,
                        date: message.appointmentDate,
                        dateKey: message.dateKey || new Date().toISOString().split('T')[0], // Fallback
                        time: message.appointmentTime || '10:00 - 11:00',
                        startTimeMinutes: message.startTimeMinutes || 600,
                        endTimeMinutes: message.endTimeMinutes || 660,
                        duration: message.duration || 1,
                        price: message.matchType === 'swap' ? 0 : (message.proposedPrice || 0),
                        type: message.matchType === 'swap' ? 'swap' : 'pay',
                        swapSkillName: message.swapSkillName,
                        tutorSkillName: message.tutorSkillName,
                        location: 'fysiek',
                        status: 'confirmed',
                        paymentStatus: 'none',
                        confirmations: {
                            studentConfirmed: false,
                            tutorConfirmed: false
                        },
                        initials: contactInitials
                    });
                }
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    };

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
                        { fontWeight: '600', marginBottom: 4 }
                    ]}>
                        Afspraakverzoek
                    </Text>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: item.sender === 'me' ? '#fff' : '#94A3B8', fontSize: 13 }}>Tijd: {item.appointmentDate} om {item.appointmentTime}</Text>
                        <Text style={{ color: item.sender === 'me' ? '#fff' : '#94A3B8', fontSize: 13 }}>Duur: {item.duration || 1} uur</Text>
                        {item.matchType === 'swap' ? (
                            <View style={{ marginTop: 4 }}>
                                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }}>Skill Swap</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{item.tutorSkillName}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 10 }}>GEVRAAGD</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: 10 }}>
                                        <Ionicons name="repeat" size={16} color={scheduleMatchColors.primary} />
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                        <Text style={{ color: scheduleMatchColors.primary, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{item.swapSkillName}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 10 }}>AANGEBODEN</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ color: '#22C55E', fontSize: 16, fontWeight: '700', marginTop: 4 }}>Prijs: €{item.proposedPrice || 0}</Text>
                        )}
                    </View>

                    {item.appointmentStatus === 'pending' ? (
                        item.sender === 'other' ? (
                            <View style={{ gap: 8, marginTop: 8 }}>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#10B981', padding: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                                        onPress={() => handleRespondAppointment(item.id, 'accepted')}
                                    >
                                        <Ionicons name="checkmark-circle" size={16} color="white" style={{ marginRight: 4 }} />
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Accepteren</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#EF4444', padding: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                                        onPress={() => handleRespondAppointment(item.id, 'rejected')}
                                    >
                                        <Ionicons name="close-circle" size={16} color="white" style={{ marginRight: 4 }} />
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Weigeren</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#6366f1' }}
                                    onPress={() => {
                                        setSelectedMessageForCounter(item);
                                        setShowScheduleMatch(true);
                                    }}
                                >
                                    <Ionicons name="create-outline" size={16} color="#6366f1" style={{ marginRight: 4 }} />
                                    <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 13 }}>Tegenbod / Wijzigen</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ marginTop: 8, padding: 10, backgroundColor: 'rgba(251, 191, 36, 0.2)', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="time-outline" size={16} color="#FBBF24" style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 13, color: '#FBBF24', fontWeight: '600' }}>Wachten op reactie...</Text>
                            </View>
                        )
                    ) : (
                        <View style={{
                            marginTop: 8,
                            padding: 10,
                            backgroundColor: item.appointmentStatus === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            borderRadius: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Ionicons
                                name={item.appointmentStatus === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                                size={18}
                                color={item.appointmentStatus === 'accepted' ? '#10B981' : '#EF4444'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={{
                                color: item.appointmentStatus === 'accepted' ? '#10B981' : '#EF4444',
                                fontWeight: '600',
                                fontSize: 13
                            }}>
                                {item.appointmentStatus === 'accepted' ? '✓ Afspraak geaccepteerd!' : item.appointmentStatus === 'countered' ? '↺ Tegenbod verstuurd' : '✕ Afspraak geweigerd'}
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

    if (showScheduleMatch) {
        return (
            <ScheduleMatchScreen
                contactId={route?.params?.contactId || ''}
                contactName={contactName}
                contactInitials={contactInitials}
                contactColor={contactColor}
                contactSubtitle={contactSubtitle}
                onBack={() => {
                    setShowScheduleMatch(false);
                    setSelectedMessageForCounter(null);
                }}
                onMatch={handleMatchRequest}
                initialData={selectedMessageForCounter ? {
                    duration: selectedMessageForCounter.duration,
                    price: selectedMessageForCounter.proposedPrice,
                    type: selectedMessageForCounter.matchType as 'pay' | 'swap',
                    swapSkillName: selectedMessageForCounter.swapSkillName,
                    tutorSkillName: selectedMessageForCounter.tutorSkillName
                } : undefined}
            />
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 8 }}
                    onPress={() => {
                        const targetId = route?.params?.contactId;
                        if (targetId) {
                            navigation?.navigate('ExploreProfile', { userId: targetId });
                        }
                    }}
                >
                    <Avatar
                        uri={contactPhotoURL}
                        name={contactName}
                        initials={contactInitials}
                        backgroundColor={contactColor}
                        size={40}
                    />
                    <View style={styles.headerInfo}>
                        <Text style={styles.contactName}>{contactName}</Text>
                        <Text style={styles.contactStatus}>{contactSubtitle || 'Online'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.appointmentButton} onPress={handleAppointmentPress}>
                    <Ionicons name="calendar-outline" size={16} color="#F8FAFC" />
                    <Text style={styles.appointmentButtonText}>Afspraak</Text>
                </TouchableOpacity>
            </View>

            {isPending && (
                <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(251, 191, 36, 0.2)' }}>
                    <Text style={{ color: '#FBBF24', fontSize: 13, textAlign: 'center' }}>
                        {isInitiator
                            ? "Je hebt een matchverzoek verstuurd. Je kunt chatten zodra deze is geaccepteerd."
                            : "Stuur een bericht om het matchverzoek te accepteren."}
                    </Text>
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
            />
            <View style={[styles.inputContainer, !canSendMessage && { opacity: 0.5 }]}>
                <TextInput
                    style={styles.textInput}
                    placeholder={canSendMessage ? "Typ een bericht..." : "Wacht op acceptatie..."}
                    placeholderTextColor={conversationColors.notext}
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                    editable={canSendMessage}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !canSendMessage && { backgroundColor: '#94A3B8' }]}
                    onPress={sendMessage}
                    disabled={!canSendMessage}
                >
                    <Ionicons name="send" size={18} color="#F8FAFC" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

export default ConversationScreen;
