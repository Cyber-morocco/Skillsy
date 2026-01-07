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
    setDoc
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

        const { fromUserId, toUserId, fromUserName, subject } = matchData;

        // Get toUser data (current user)
        const toUserSnap = await getDoc(doc(db, 'users', toUserId));
        const toUserData = toUserSnap.data();

        // Create a new chat
        const chatRef = doc(collection(db, 'chats'));
        await setDoc(chatRef, {
            participants: [fromUserId, toUserId],
            participantInfo: {
                [fromUserId]: {
                    name: fromUserName,
                    initials: fromUserName.charAt(0).toUpperCase(),
                    avatarColor: '#6366f1', // Default
                    photoURL: matchData.fromUserAvatar || null
                },
                [toUserId]: {
                    name: toUserData?.displayName || 'Onbekend',
                    initials: (toUserData?.displayName || 'U').charAt(0).toUpperCase(),
                    avatarColor: '#10B981', // Default
                    photoURL: toUserData?.photoURL || null
                }
            },
            lastMessage: `Match geaccepteerd voor ${subject}!`,
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
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
    await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

export const updateMessage = async (chatId: string, messageId: string, data: Partial<Message>): Promise<void> => {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, data);
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
