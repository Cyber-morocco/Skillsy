import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';
import { Post, PostComment } from '../types';
import { subscribeToComments, addComment } from '../services/feedService';
import { Avatar } from './Avatar';

interface CommentsModalProps {
    visible: boolean;
    onClose: () => void;
    post: Post | null;
}

export default function CommentsModal({ visible, onClose, post }: CommentsModalProps) {
    const [comments, setComments] = useState<PostComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (visible && post) {
            setLoading(true);
            const unsubscribe = subscribeToComments(post.id, (fetchedComments) => {
                setComments(fetchedComments);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [visible, post]);

    const handleSend = async () => {
        if (!newComment.trim() || !post || sending) return;

        setSending(true);
        try {
            await addComment(post.id, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Zojuist';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContent}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={authColors.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Reacties</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={authColors.accent} />
                        </View>
                    ) : (
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.commentItem}>
                                    <Avatar
                                        uri={item.userAvatar}
                                        name={item.userName}
                                        size={40}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.commentTextContainer}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.userName}>{item.userName}</Text>
                                            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                                        </View>
                                        <Text style={styles.content}>{item.content}</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyText}>Nog geen reacties. Deel je gedachten!</Text>
                                </View>
                            }
                            ListHeaderComponent={
                                <>
                                    {post?.imageURL && (
                                        <View style={styles.imageContainer}>
                                            <Image source={{ uri: post.imageURL }} style={styles.postImage} resizeMode="contain" />
                                        </View>
                                    )}
                                </>
                            }
                            contentContainerStyle={styles.listContent}
                        />
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Schrijf een reactie..."
                            placeholderTextColor={authColors.muted}
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!newComment.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="send" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: authColors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: authColors.text,
    },
    listContent: {
        padding: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#333',
    },
    commentTextContainer: {
        flex: 1,
        backgroundColor: authColors.card,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: authColors.text,
    },
    date: {
        fontSize: 12,
        color: authColors.muted,
    },
    content: {
        fontSize: 14,
        color: authColors.text,
        lineHeight: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: authColors.muted,
        fontSize: 16,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(148, 163, 184, 0.1)',
        backgroundColor: authColors.background,
    },
    input: {
        flex: 1,
        backgroundColor: authColors.card,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: authColors.text,
        maxHeight: 100,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: authColors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: authColors.muted,
        opacity: 0.5,
    },
    imageContainer: {
        marginBottom: 20,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#000',
    },
});
