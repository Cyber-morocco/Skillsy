import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';
import { authColors, authStyles as styles } from '../styles/authStyles';

interface AppInputProps extends TextInputProps {
    label?: string;
}

export const AppInput: React.FC<AppInputProps> = ({ label, style, onFocus, onBlur, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.fieldGroup}>
            {label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                </View>
            )}
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    style,
                ]}
                placeholderTextColor={authColors.placeholder}
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                {...props}
            />
        </View>
    );
};
