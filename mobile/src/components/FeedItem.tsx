import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';
import { Post, PostType } from '../types';
import { auth } from '../config/firebase';

export { PostType };

import { Avatar } from './Avatar';

interface FeedItemProps {
    post: Post;
    onUserPress?: () => void;
    onLike?: () => void;
    onComment?: () => void;
    onImagePress?: () => void;
    onContentPress?: () => void;
}

const getTypeColor = (type: PostType) => {
    switch (type) {
        case 'Vraag':
            return '#3B82F6';
        case 'Succes':
            return '#10B981';
        case 'Materiaal':
            return '#F59E0B';
        default:
            return authColors.accent;
    }
};

const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Zojuist';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const FeedItem: React.FC<FeedItemProps> = ({ post, onUserPress, onLike, onComment, onImagePress, onContentPress }) => {
    const isLiked = post.likes?.includes(auth.currentUser?.uid || '');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.userInfo} onPress={onUserPress}>
                    <Avatar
                        uri={post.userAvatar}
                        name={post.userName}
                        size={44}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.userName}>{post.userName}</Text>
                        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.badge, { backgroundColor: `${getTypeColor(post.type)}15` }]}>
                    <Text style={[styles.badgeText, { color: getTypeColor(post.type) }]}>
                        {post.type}
                    </Text>
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={onContentPress}>
                <Text style={styles.content}>{post.content}</Text>
            </TouchableOpacity>

            {post.imageURL && (
                <TouchableOpacity activeOpacity={0.9} onPress={onImagePress}>
                    <Image
                        source={{ uri: post.imageURL }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            <View style={styles.separator} />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.interaction} onPress={onLike}>
                    <View style={[styles.iconCircle, isLiked && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={20}
                            color={isLiked ? "#EF4444" : authColors.muted}
                        />
                    </View>
                    <Text style={[styles.interactionText, isLiked && { color: "#EF4444" }]}>
                        {post.likes?.length || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interaction} onPress={onComment}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="chatbubble-outline" size={20} color={authColors.muted} />
                    </View>
                    <Text style={styles.interactionText}>{post.commentCount || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: authColors.card,
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        // Removed border, cleaner flat look
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    userName: {
        color: authColors.text,
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 2,
    },
    date: {
        color: authColors.muted,
        fontSize: 12,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    content: {
        color: authColors.text,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    postImage: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        marginBottom: 16,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    interaction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    interactionText: {
        color: authColors.muted,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default FeedItem;
