import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';

export type PostType = 'Vraag' | 'Succes' | 'Materiaal';

interface FeedItemProps {
    post: {
        id: string;
        user: {
            name: string;
            avatar: string;
        };
        date: string;
        type: PostType;
        content: string;
        likes: number;
        comments: number;
    };
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

const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
                    <View>
                        <Text style={styles.userName}>{post.user.name}</Text>
                        <Text style={styles.date}>{post.date}</Text>
                    </View>
                </View>
                <View style={[styles.badge, { borderColor: getTypeColor(post.type) }]}>
                    <Text style={[styles.badgeText, { color: getTypeColor(post.type) }]}>
                        {post.type}
                    </Text>
                </View>
            </View>

           
            <Text style={styles.content}>{post.content}</Text>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.interaction}>
                    <Ionicons name="heart-outline" size={20} color={authColors.muted} />
                    <Text style={styles.interactionText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.interaction}>
                    <Ionicons name="chatbubble-outline" size={20} color={authColors.muted} />
                    <Text style={styles.interactionText}>{post.comments}</Text>
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
