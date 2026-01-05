import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../styles/authStyles';
import { PostType } from './FeedItem';

interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (post: { type: PostType; content: string }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState<PostType>('Vraag');
    const [content, setContent] = useState('');

    const types: PostType[] = ['Vraag', 'Succes', 'Materiaal'];

    const handleSubmit = () => {
        if (content.trim()) {
            onSubmit({ type: selectedType, content });
            setContent('');
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.modalContainer}>
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>Nieuw Bericht</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={authColors.text} />
                        </TouchableOpacity>
                    </View>

                    
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

                    
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Annuleren</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Plaatsen</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        minHeight: '60%',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: authColors.text,
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
        backgroundColor: 'rgba(124, 58, 237, 0.15)', // authColors.accent with opacity
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
        height: 150,
        color: authColors.text,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.15)',
        marginBottom: 24,
        fontSize: 15,
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
