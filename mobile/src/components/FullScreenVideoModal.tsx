import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, StatusBar, SafeAreaView } from 'react-native';
import { Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Avatar } from './Avatar';

const { width, height } = Dimensions.get('window');

interface FullScreenVideoModalProps {
    visible: boolean;
    videoUrl: string;
    title: string;
    description: string;
    onClose: () => void;
    userProfile?: {
        name: string;
        avatar?: string;
    };
}

export const FullScreenVideoModal: React.FC<FullScreenVideoModalProps> = ({
    visible,
    videoUrl,
    title,
    description,
    onClose,
    userProfile,
}) => {
    const [descriptionVisible, setDescriptionVisible] = useState(false);

    const player = useVideoPlayer(videoUrl, (player) => {
        player.loop = true;
        player.play();
    });

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <StatusBar hidden />
                <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="cover"
                    nativeControls={false}
                />

                {/* Overlay Controls */}
                <SafeAreaView style={styles.overlay}>
                    {/* Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Info */}
                    <View style={styles.bottomInfo}>
                        {userProfile && (
                            <View style={styles.userInfo}>
                                <Avatar
                                    uri={userProfile.avatar}
                                    name={userProfile.name}
                                    size={40}
                                    style={styles.avatar}
                                />
                                <Text style={styles.username}>{userProfile.name}</Text>
                            </View>
                        )}

                        <TouchableOpacity onPress={() => setDescriptionVisible(!descriptionVisible)}>
                            <Text style={styles.title}>{title}</Text>
                            {descriptionVisible && description ? (
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
        backgroundColor: 'black',
    },
    video: {
        width: width,
        height: height,
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        padding: 20,
        paddingTop: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
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
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
    description: {
        color: '#e0e0e0',
        fontSize: 14,
        lineHeight: 20,
    },
});
