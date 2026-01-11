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
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
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

export default function VideoFeedScreen({ onBack, onViewProfile }: VideoFeedScreenProps) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoLoadStates, setVideoLoadStates] = useState<{ [key: string]: boolean }>({});
    const videoRefs = useRef<{ [key: string]: Video }>({});

    useEffect(() => {
        // Enable audio in silent mode (iOS)
        const configureAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (e) {
                console.warn('Error configuring audio:', e);
            }
        };
        configureAudio();
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            // Fetch current user's chats to determine matches
            const currentUserId = auth.currentUser?.uid;
            let matchedUserIds: string[] = [];

            if (currentUserId) {
                const chatsRef = collection(db, 'chats');
                const qChats = query(chatsRef, where('participants', 'array-contains', currentUserId));
                const chatSnapshot = await getDocs(qChats);

                chatSnapshot.docs.forEach(doc => {
                    const data = doc.data() as Conversation;
                    // If chat exists, consider them matched (pending or active)
                    const otherId = data.participants.find(id => id !== currentUserId);
                    if (otherId) matchedUserIds.push(otherId);
                });
            }

            // Fetch all users with promoVideos
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('profileComplete', '==', true));
            const snapshot = await getDocs(q);

            const allVideos: VideoItem[] = [];

            snapshot.docs.forEach(doc => {
                // Skip current user's own videos
                if (doc.id === currentUserId) return;

                const data = doc.data() as UserProfile;
                if (data.promoVideos && data.promoVideos.length > 0) {
                    data.promoVideos.forEach((video, index) => {
                        // Filter out empty URLs
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

            // Shuffle videos for random order
            const shuffled = allVideos.sort(() => Math.random() - 0.5);
            setVideos(shuffled);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            setCurrentIndex(newIndex);
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 80,
    }).current;

    const handleProfilePress = (item: VideoItem) => {
        onViewProfile({
            uid: item.userId,
            name: item.userName,
            avatar: item.userAvatar,
        });
    };

    const handleVideoError = (itemId: string, error: string) => {
        console.warn(`Video error for ${itemId}:`, error);
        // Optionally remove from list or show error UI
    };

    const renderItem = ({ item, index }: { item: VideoItem; index: number }) => {
        const isActive = index === currentIndex;
        const isLoading = videoLoadStates[item.id] !== false; // Default to true (loading) until loaded

        return (
            <View style={styles.videoContainer}>
                {isLoading && (
                    <View style={styles.activityIndicatorContainer}>
                        <ActivityIndicator size="large" color="#7c3aed" />
                    </View>
                )}

                <Video
                    ref={(ref) => {
                        if (ref) videoRefs.current[item.id] = ref;
                    }}
                    source={{ uri: item.video.url }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isActive}
                    isLooping
                    isMuted={false}
                    useNativeControls={false}
                    onLoadStart={() => setVideoLoadStates(prev => ({ ...prev, [item.id]: true }))}
                    onLoad={() => setVideoLoadStates(prev => ({ ...prev, [item.id]: false }))}
                    onError={(e) => handleVideoError(item.id, e)}
                />

                {/* Overlay */}
                <View style={styles.overlay}>
                    {/* User info */}
                    {/* User info */}
                    <View style={styles.userInfoContainer}>
                        <TouchableOpacity onPress={() => handleProfilePress(item)}>
                            <View>
                                <Avatar uri={item.userAvatar} name={item.userName} size={48} style={styles.avatarBorder} />
                                {!item.isMatched && (
                                    <View style={styles.addIconContainer}>
                                        <Ionicons name="add" size={14} color="#fff" />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.userTextWrapper}
                            onPress={() => handleProfilePress(item)}
                        >
                            <Text style={styles.userName}>{item.userName}</Text>
                            <Text style={styles.videoTitle}>{item.video.title}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    {item.video.description ? (
                        <Text style={styles.description} numberOfLines={3}>
                            {item.video.description}
                        </Text>
                    ) : null}
                </View>

                {/* Side buttons */}
                <View style={styles.sideButtons}>
                    {/* Add other buttons here later (like/share/comment) */}
                </View>
            </View>
        );
    };

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
                    <Text style={styles.emptySubtext}>
                        Gebruikers kunnen promo video's uploaden op hun profiel
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Back button overlay */}
            {/* Back button */}
            <TouchableOpacity onPress={onBack} style={styles.backButtonOverlay}>
                <Ionicons name="arrow-back" size={28} color="#F8FAFC" />
            </TouchableOpacity>

            <FlatList
                data={videos}
                renderItem={renderItem}
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: '700',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    backButtonOverlay: {
        position: 'absolute',
        top: 20, // Lower it slightly
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // Ensure it's on top
    },
    videoContainer: {
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    activityIndicatorContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    video: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 70,
        paddingHorizontal: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarBorder: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    addIconContainer: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#7c3aed',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    userTextWrapper: {
        marginLeft: 12,
        flex: 1,
    },
    userTextContainer: {
        marginLeft: 0,
        marginBottom: 4,
    },
    userName: {
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    videoTitle: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    description: {
        color: '#F8FAFC',
        fontSize: 14,
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    sideButtons: {
        position: 'absolute',
        right: 12,
        bottom: 150,
        alignItems: 'center',
    },
    sideButton: {
        marginBottom: 20,
        alignItems: 'center',
    },
    sideAvatar: {
        borderWidth: 2,
        borderColor: '#F8FAFC',
    },
    addIcon: {
        position: 'absolute',
        bottom: -8,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        color: '#94A3B8',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
