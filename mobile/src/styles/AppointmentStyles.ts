import { Platform, StyleSheet } from 'react-native';

// Color palette matching app theme
const PRIMARY = '#7C3AED';
const BACKGROUND = '#050816';
const CARD = '#101936';
const TEXT = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const SUCCESS = '#22C55E';
const WARNING = '#F59E0B';
const BORDER = 'rgba(148, 163, 184, 0.25)';

export const appointmentColors = {
    primary: PRIMARY,
    background: BACKGROUND,
    card: CARD,
    text: TEXT,
    textSecondary: TEXT_SECONDARY,
    success: SUCCESS,
    warning: WARNING,
    border: BORDER,
};

const sharedShadow =
    Platform.OS === 'ios'
        ? {
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
        }
        : {
            elevation: 6,
        };

export const appointmentStyles = StyleSheet.create({
    // Container
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: TEXT,
        letterSpacing: 0.3,
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: BORDER,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
        backgroundColor: PRIMARY,
        ...sharedShadow,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '500',
        color: TEXT_SECONDARY,
    },
    tabTextActive: {
        color: TEXT,
        fontWeight: '600',
    },
    tabBadge: {
        marginLeft: 4,
        backgroundColor: 'rgba(148, 163, 184, 0.3)',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    tabBadgeActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: TEXT_SECONDARY,
    },
    tabBadgeTextActive: {
        color: TEXT,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: TEXT_SECONDARY,
        textAlign: 'center',
    },
});
