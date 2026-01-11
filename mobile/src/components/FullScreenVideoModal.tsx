import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FullScreenVideoModalProps {
    visible: boolean;
    videoUrl: string;
    onClose: () => void;
    title: string;
    description: string;
    userProfile: {
        name: string;
        avatar: string;
    };
}

export const FullScreenVideoModal: React.FC<FullScreenVideoModalProps> = ({
    visible,
    videoUrl,
    onClose,
    title,
    description,
    userProfile,
}) => {
    const [showDescription, setShowDescription] = useState(false);

    const player = useVideoPlayer(videoUrl, (player) => {
        player.loop = true;
        player.play();
    });

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
            transparent={false}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="black" />

                <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="contain" // video is contained within screen dimensions
                    nativeControls={false} // Custom controls
                />

                {/* Overlay Container */}
                <SafeAreaView style={styles.overlay}>
                    {/* Top Bar - Back Button */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Info Section */}
                    <View style={styles.bottomSection}>
                        <View style={styles.userInfoRow}>
                            <Avatar
                                uri={userProfile.avatar}
                                name={userProfile.name}
                                size={36}
                                style={styles.avatar}
                            />
                            <Text style={styles.username}>{userProfile.name}</Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowDescription(!showDescription)}
                            style={styles.textContainer}
                        >
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>{title}</Text>
                                {description ? (
                                    <Ionicons
                                        name={showDescription ? "chevron-down" : "chevron-up"}
                                        size={16}
                                        color="#FFFFFF"
                                        style={{ marginLeft: 6, opacity: 0.7 }}
                                    />
                                ) : null}
                            </View>

                            {showDescription && description ? (
                                <Text style={styles.description}>{description}</Text>
                            ) : null}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topBar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        flexDirection: 'row',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSection: {
        padding: 16,
        paddingBottom: 32,
        backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', // Note: standard React Native doesn't support linear-gradient shorthand like CSS, but we rely on simple background for now or use a proper gradient package if strictly needed. For now simple transparent bg.
        // Simplifying background for standard RN View:
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    username: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    textContainer: {
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    description: {
        color: '#E2E8F0',
        fontSize: 14,
        marginTop: 6,
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});
