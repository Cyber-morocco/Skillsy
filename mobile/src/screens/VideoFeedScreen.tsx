import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    ViewToken,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Avatar } from '../components/Avatar';
import { PromoVideo, UserProfile, Conversation } from '../types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoItem {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    video: PromoVideo;
    isMatched: boolean;
}

interface VideoFeedScreenProps {
    onBack: () => void;
    onViewProfile: (user: { uid: string; name: string; avatar: string }) => void;
}

const FeedVideoItem = ({
    item,
    isActive,
    onViewProfile,
}: {
    item: VideoItem;
    isActive: boolean;
    onViewProfile: (user: { uid: string; name: string; avatar: string }) => void;
}) => {
    const player = useVideoPlayer(item.video.url, (player) => {
        player.loop = true;
    });

    const [descriptionVisible, setDescriptionVisible] = useState(false);

    useEffect(() => {
        if (isActive) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, player]);

    return (
        <View style={styles.videoContainer}>
            <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
            />

            <SafeAreaView style={styles.overlay}>
                <View style={styles.bottomInfo}>
                    <View style={styles.userInfo}>
                        <TouchableOpacity onPress={() => onViewProfile({ uid: item.userId, name: item.userName, avatar: item.userAvatar })}>
                            <Avatar
                                uri={item.userAvatar}
                                name={item.userName}
                                size={40}
                                style={styles.avatar}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onViewProfile({ uid: item.userId, name: item.userName, avatar: item.userAvatar })}>
                            <Text style={styles.username}>{item.userName}</Text>
                        </TouchableOpacity>
                        {!item.isMatched && (
                            <View style={styles.followBadge}>
                                <Text style={styles.followText}>• Volgen</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity onPress={() => setDescriptionVisible(!descriptionVisible)}>
                        <Text style={styles.title}>{item.video.title}</Text>
                        {item.video.description ? (
                            <Text
                                style={styles.description}
                                numberOfLines={descriptionVisible ? undefined : 2}
                            >
                                {item.video.description}
                            </Text>
                        ) : null}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default function VideoFeedScreen({ onBack, onViewProfile }: VideoFeedScreenProps) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const currentUserId = auth.currentUser?.uid;
            let matchedUserIds: string[] = [];

            if (currentUserId) {
                const chatsRef = collection(db, 'chats');
                const qChats = query(chatsRef, where('participants', 'array-contains', currentUserId));
                const chatSnapshot = await getDocs(qChats);

                chatSnapshot.docs.forEach(doc => {
                    const data = doc.data() as Conversation;
                    const otherId = data.participants.find(id => id !== currentUserId);
                    if (otherId) matchedUserIds.push(otherId);
                });
            }

            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('profileComplete', '==', true));
            const snapshot = await getDocs(q);

            const allVideos: VideoItem[] = [];

            snapshot.docs.forEach(doc => {
                if (doc.id === currentUserId) return;

                const data = doc.data() as UserProfile;
                if (data.promoVideos && data.promoVideos.length > 0) {
                    data.promoVideos.forEach((video, index) => {
                        if (video.url && video.url.trim().length > 0) {
                            allVideos.push({
                                id: `${doc.id}_${index}`,
                                userId: doc.id,
                                userName: data.displayName || 'Onbekend',
                                userAvatar: data.photoURL || '',
                                video,
                                isMatched: matchedUserIds.includes(doc.id),
                            });
                        }
                    });
                }
            });

            const shuffled = allVideos.sort(() => Math.random() - 0.5);
            setVideos(shuffled);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    // Config for visibility
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text style={styles.loadingText}>Videos laden...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (videos.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#F8FAFC" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Video's</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="videocam-off-outline" size={64} color="#94A3B8" />
                    <Text style={styles.emptyText}>Nog geen video's beschikbaar</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Back Button Overlay */}
            <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
                <TouchableOpacity onPress={onBack} style={styles.backButtonOverlay}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </SafeAreaView>

            <FlatList
                data={videos}
                renderItem={({ item, index }) => (
                    <FeedVideoItem
                        item={item}
                        isActive={index === currentIndex}
                        onViewProfile={onViewProfile}
                    />
                )}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={SCREEN_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => ({
                    length: SCREEN_HEIGHT,
                    offset: SCREEN_HEIGHT * index,
                    index,
                })}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#F8FAFC',
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: '700',
    },
    backButton: {
        padding: 8,
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        paddingLeft: 20,
        paddingTop: 10,
    },
    backButtonOverlay: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    videoContainer: {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    bottomInfo: {
        padding: 20,
        paddingBottom: 40,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'white',
    },
    username: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    followBadge: {
        marginLeft: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    followText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    description: {
        color: '#e0e0e0',
        fontSize: 14,
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#fff',
        marginTop: 10,
    },
});
