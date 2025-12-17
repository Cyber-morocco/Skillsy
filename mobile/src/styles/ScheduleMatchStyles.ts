import { StyleSheet } from 'react-native';

const PRIMARY = '#22C55E';
const BACKGROUND = '#050816';
const CARD = '#101936';
const TEXT = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const BORDER = 'rgba(148, 163, 184, 0.25)';

export const scheduleMatchColors = {
    primary: PRIMARY,
    background: BACKGROUND,
    card: CARD,
    text: TEXT,
    textSecondary: TEXT_SECONDARY,
    border: BORDER,
};

export const scheduleMatchStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: CARD,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInitials: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    headerInfo: {
        flex: 1,
    },
    contactName: {
        color: TEXT,
        fontSize: 16,
        fontWeight: '600',
    },
    contactSubtitle: {
        color: TEXT_SECONDARY,
        fontSize: 12,
    },
    titleSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: TEXT_SECONDARY,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },

    dayCard: {
        backgroundColor: CARD,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 16,
        marginBottom: 12,
    },
    dayCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
        color: TEXT,
    },
    matchButton: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    matchButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
    },

    personSlot: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    clockIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    slotInfo: {
        flex: 1,
    },
    personName: {
        fontSize: 14,
        fontWeight: '500',
        color: TEXT,
        marginBottom: 2,
    },
    timeSlot: {
        fontSize: 13,
        color: TEXT_SECONDARY,
    },
});
