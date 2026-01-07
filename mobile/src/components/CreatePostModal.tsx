import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { authColors } from '../styles/authStyles';
import { PostType } from './FeedItem';

interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (post: { type: PostType; content: string; imageUri?: string }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState<PostType>('Vraag');
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const types: PostType[] = ['Vraag', 'Succes', 'Materiaal'];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setImageUri(null);
    };

    const handleSubmit = async () => {
        if (content.trim()) {
            setUploading(true);
            try {
                await onSubmit({
                    type: selectedType,
                    content,
                    imageUri: imageUri || undefined
                });
                setContent('');
                setImageUri(null);
                onClose();
            } finally {
                setUploading(false);
            }
        }
    };

    const handleClose = () => {
        setContent('');
        setImageUri(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Nieuw Bericht</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color={authColors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContent}
                        >
                            <Text style={styles.label}>Type bericht</Text>
                            <View style={styles.typesContainer}>
                                {types.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeButton,
                                            selectedType === type && styles.activeTypeButton,
                                        ]}
                                        onPress={() => setSelectedType(type)}
                                    >
                                        <Text
                                            style={[
                                                styles.typeText,
                                                selectedType === type && styles.activeTypeText,
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Wat wil je delen?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Schrijf je bericht hier..."
                                placeholderTextColor={authColors.placeholder}
                                multiline
                                textAlignVertical="top"
                                value={content}
                                onChangeText={setContent}
                            />

                            <View style={styles.imageSection}>
                                {imageUri ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                        <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                                            <Ionicons name="close-circle" size={28} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                        <Ionicons name="image-outline" size={24} color={authColors.accent} />
                                        <Text style={styles.addImageText}>Foto toevoegen</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={uploading}>
                                <Text style={styles.cancelButtonText}>Annuleren</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, uploading && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Plaatsen</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: authColors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: authColors.text,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    label: {
        fontSize: 16,
        color: authColors.muted,
        marginBottom: 12,
    },
    typesContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.25)',
        backgroundColor: authColors.background,
    },
    activeTypeButton: {
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        borderColor: authColors.accent,
    },
    typeText: {
        color: authColors.muted,
        fontWeight: '600',
    },
    activeTypeText: {
        color: authColors.accent,
    },
    input: {
        backgroundColor: authColors.background,
        borderRadius: 16,
        padding: 16,
        minHeight: 100,
        color: authColors.text,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.15)',
        marginBottom: 16,
        fontSize: 15,
    },
    imageSection: {
        marginBottom: 8,
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderStyle: 'dashed',
    },
    addImageText: {
        color: authColors.accent,
        fontWeight: '600',
        marginLeft: 8,
    },
    imagePreviewContainer: {
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 14,
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.25)',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: authColors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: authColors.accent,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default CreatePostModal;
