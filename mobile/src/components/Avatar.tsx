import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface AvatarProps {
    uri?: string | null;
    name?: string;
    initials?: string;
    backgroundColor?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

const AVATAR_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899',
    '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e'
];

const getFallbackColor = (name: string = 'U') => {
    const safeName = name || 'U';
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

const getInitials = (name: string = 'U') => {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = React.memo(({
    uri,
    name = 'Gebruiker',
    initials,
    backgroundColor,
    size = 40,
    style
}) => {
    const [hasError, setHasError] = useState(false);

    // Reset error state when URI changes
    React.useEffect(() => {
        setHasError(false);
    }, [uri]);

    // Check if it's a UI-avatars URL and treat as "no image" if so, 
    // to use our native fallback instead (it looks better)
    const isPlaceholder = !uri || (typeof uri === 'string' && uri.includes('ui-avatars.com'));

    const displayInitials = initials || getInitials(name);
    const bgColor = backgroundColor || getFallbackColor(name);

    // Filter out backgroundColor from style if we want to use our dynamic bgColor
    const styleObj = StyleSheet.flatten(style) || {};
    const { backgroundColor: styleBg, ...otherStyles } = styleObj;

    const containerStyle = [
        styles.container,
        {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor
        },
        otherStyles // Use other styles but keep our bgColor
    ];

    if (uri && !isPlaceholder && !hasError) {
        return (
            <View style={containerStyle}>
                <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
                    onError={() => {
                        console.log(`Avatar: Error loading image: ${uri}`);
                        setHasError(true);
                    }}
                />
            </View>
        );
    }

    return (
        <View style={containerStyle}>
            <Text style={[styles.text, { fontSize: size * 0.4 }]}>
                {displayInitials}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '700',
    }
});
