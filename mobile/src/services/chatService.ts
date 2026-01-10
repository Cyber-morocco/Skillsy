import {
    collection,
    doc,
    addDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    orderBy,
    Unsubscribe,
    getDoc,
    getDocs,
    deleteDoc,
    Timestamp,
    setDoc,
    increment
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { MatchRequest, Conversation, Message } from '../types';

const getCurrentUserId = (): string => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user.uid;
};

/**
 * Match Requests
 */

export const sendMatchRequest = async (toUserId: string, toUserName: string, subject: string): Promise<void> => {
    const fromUserId = getCurrentUserId();
    const userSnap = await getDoc(doc(db, 'users', fromUserId));
    const userData = userSnap.data();

    const matchesRef = collection(db, 'matches');
    await addDoc(matchesRef, {
        fromUserId,
        fromUserName: userData?.displayName || 'Onbekend',
        fromUserAvatar: userData?.photoURL || null,
        toUserId,
        status: 'pending',
        subject,
        createdAt: serverTimestamp(),
    });

    const toUserSnap = await getDoc(doc(db, 'users', toUserId));
    const toUserData = toUserSnap.data();

    const participants = [fromUserId, toUserId].sort();
    const chatId = participants.join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        await setDoc(chatRef, {
            participants: [fromUserId, toUserId],
            participantInfo: {
                [fromUserId]: {
                    name: userData?.displayName || 'Onbekend',
                    initials: (userData?.displayName || 'O').charAt(0).toUpperCase(),
                    avatarColor: '#6366f1',
                    photoURL: userData?.photoURL || null
                },
                [toUserId]: {
                    name: toUserData?.displayName || 'Onbekend',
                    initials: (toUserData?.displayName || 'U').charAt(0).toUpperCase(),
                    avatarColor: '#10B981',
                    photoURL: toUserData?.photoURL || null
                }
            },
            lastMessage: `Matchverzoek verstuurd voor ${subject}`,
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'pending',
            matchInitiatorId: fromUserId
        });
    }
};

export const subscribeToMatchRequests = (
    onUpdate: (requests: MatchRequest[]) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    const q = query(
        collection(db, 'matches'),
        where('toUserId', '==', userId),
        where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MatchRequest));
        onUpdate(requests);
    });
};

export const respondToMatchRequest = async (matchId: string, status: 'accepted' | 'rejected'): Promise<void> => {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, { status });

    if (status === 'accepted') {
        const matchSnap = await getDoc(matchRef);
        const matchData = matchSnap.data();
        if (!matchData) return;

        const { fromUserId, toUserId, subject } = matchData;

        const participants = [fromUserId, toUserId].sort();
        const chatId = participants.join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            await updateDoc(chatRef, {
                status: 'active',
                lastMessage: `Match geaccepteerd voor ${subject}!`,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } else if (status === 'rejected') {
        const matchSnap = await getDoc(matchRef);
        const matchData = matchSnap.data();
        if (!matchData) return;

        const { fromUserId, toUserId } = matchData;
        const toUserSnap = await getDoc(doc(db, 'users', toUserId));
        const toUserName = toUserSnap.data()?.displayName || 'Gebruiker';

        const participants = [fromUserId, toUserId].sort();
        const chatId = participants.join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            await updateDoc(chatRef, {
                status: 'rejected',
                lastMessage: `Match geweigerd door ${toUserName}`,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    }
};

/**
 * Chats & Messages
 */

export const subscribeToChats = (
    onUpdate: (chats: Conversation[]) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Conversation));
        onUpdate(chats);
    });
};

export const subscribeToChat = (
    chatId: string,
    onUpdate: (chat: Conversation | null) => void
): Unsubscribe => {
    const chatRef = doc(db, 'chats', chatId);
    return onSnapshot(chatRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            onUpdate({ id: docSnapshot.id, ...docSnapshot.data() } as Conversation);
        } else {
            onUpdate(null);
        }
    });
};

export const subscribeToMessages = (
    chatId: string,
    onUpdate: (messages: Message[]) => void
): Unsubscribe => {
    const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        onUpdate(messages);
    });
};

export const sendMessage = async (chatId: string, text: string, metadata: Partial<Message> = {}): Promise<void> => {
    const userId = getCurrentUserId();
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    // Ensure type from metadata overrides default 'text'
    const messageType = metadata.type || 'text';

    await addDoc(messagesRef, {
        text,
        senderId: userId,
        createdAt: serverTimestamp(),
        type: messageType,
        ...metadata
    });

    // Update last message in chat doc
    const chatRef = doc(db, 'chats', chatId);

    // Prepare unread counts update
    const chatSnap = await getDoc(chatRef);
    let unreadUpdate = {};

    if (chatSnap.exists()) {
        const chatData = chatSnap.data() as Conversation;
        const otherParticipantId = chatData.participants.find(p => p !== userId);

        if (otherParticipantId) {
            unreadUpdate = {
                [`unreadCount.${otherParticipantId}`]: increment(1)
            };
        }

        // Check if we need to auto-accept the match
        if (chatData.status === 'pending' && chatData.matchInitiatorId && chatData.matchInitiatorId !== userId) {
            await updateDoc(chatRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'active',
                ...unreadUpdate
            });

            // Also update the match request status
            const matchesRef = collection(db, 'matches');
            const q = query(
                matchesRef,
                where('fromUserId', '==', chatData.matchInitiatorId),
                where('toUserId', '==', userId),
                where('status', '==', 'pending')
            );
            const matchSnap = await getDocs(q);
            if (!matchSnap.empty) {
                const matchDoc = matchSnap.docs[0];
                await updateDoc(doc(db, 'matches', matchDoc.id), { status: 'accepted' });
            }
        } else {
            // Normal update
            await updateDoc(chatRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ...unreadUpdate
            });
        }
    }
};

export const markChatAsRead = async (chatId: string): Promise<void> => {
    try {
        const userId = getCurrentUserId();
        const chatRef = doc(db, 'chats', chatId);

        // Check if document exists before updating to avoid FirebaseError: No document to update
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) return;

        await updateDoc(chatRef, {
            [`unreadCount.${userId}`]: 0
        });
    } catch (error) {
        console.error('Error marking chat as read:', error);
    }
};

export const updateMessage = async (chatId: string, messageId: string, data: Partial<Message>): Promise<void> => {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, data);

    // If it's an appointment status update, bubble it up to the chat
    if (data.appointmentStatus) {
        const chatRef = doc(db, 'chats', chatId);
        let statusText = 'Afspraak update';
        if (data.appointmentStatus === 'accepted') statusText = 'Afspraak geaccepteerd! 📅';
        if (data.appointmentStatus === 'rejected') statusText = 'Afspraak geweigerd';
        if (data.appointmentStatus === 'countered') statusText = 'Tegenbod ontvangen';

        await updateDoc(chatRef, {
            lastMessage: statusText,
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};
export const deleteMatchRequest = async (matchId: string): Promise<void> => {
    const matchRef = doc(db, 'matches', matchId);
    await deleteDoc(matchRef);
};

export const clearAllMatchRequests = async (userId: string, subject?: string): Promise<void> => {
    const matchesRef = collection(db, 'matches');
    let q = query(matchesRef, where('toUserId', '==', userId), where('status', '==', 'pending'));

    if (subject && subject !== 'All') {
        q = query(q, where('subject', '==', subject));
    }

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};
