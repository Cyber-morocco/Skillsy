import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';
import { Post, PostType } from '../types';
import { auth } from '../config/firebase';

export { PostType };

interface FeedItemProps {
    post: Post;
    onUserPress?: () => void;
    onLike?: () => void;
    onComment?: () => void;
    onImagePress?: () => void;
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

const FeedItem: React.FC<FeedItemProps> = ({ post, onUserPress, onLike, onComment, onImagePress }) => {
    const isLiked = post.likes?.includes(auth.currentUser?.uid || '');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.userInfo} onPress={onUserPress}>
                    <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
                    <View>
                        <Text style={styles.userName}>{post.userName}</Text>
                        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.badge, { borderColor: getTypeColor(post.type) }]}>
                    <Text style={[styles.badgeText, { color: getTypeColor(post.type) }]}>
                        {post.type}
                    </Text>
                </View>
            </View>

            <Text style={styles.content}>{post.content}</Text>

            {post.imageURL && (
                <TouchableOpacity activeOpacity={0.9} onPress={onImagePress}>
                    <Image
                        source={{ uri: post.imageURL }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            <View style={styles.footer}>
                <TouchableOpacity style={styles.interaction} onPress={onLike}>
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={isLiked ? "#EF4444" : authColors.muted}
                    />
                    <Text style={[styles.interactionText, isLiked && { color: "#EF4444" }]}>
                        {post.likes?.length || 0}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.interaction} onPress={onComment}>
                    <Ionicons name="chatbubble-outline" size={20} color={authColors.muted} />
                    <Text style={styles.interactionText}>{post.commentCount || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: authColors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.15)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#333',
    },
    userName: {
        color: authColors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    date: {
        color: authColors.muted,
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        color: authColors.text,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    interaction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interactionText: {
        color: authColors.muted,
        marginLeft: 6,
        fontSize: 14,
    },
});

export default FeedItem;
