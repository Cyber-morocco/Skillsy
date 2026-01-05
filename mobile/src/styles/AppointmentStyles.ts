import { Platform, StyleSheet } from 'react-native';

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
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
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
    card: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: BORDER,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: TEXT,
        fontWeight: '700',
        fontSize: 18,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: TEXT_SECONDARY,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusConfirmed: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    statusPending: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    statusCompleted: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusConfirmedText: {
        color: SUCCESS,
    },
    statusPendingText: {
        color: WARNING,
    },
    statusCompletedText: {
        color: SUCCESS,
    },
    cardDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailIcon: {
        width: 20,
        marginRight: 8,
    },
    detailIconText: {
        fontSize: 14,
    },
    detailText: {
        fontSize: 14,
        color: TEXT_SECONDARY,
    },
    feeContainer: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    feeText: {
        color: PRIMARY,
        fontWeight: '600',
        fontSize: 13,
    },
    cardActions: {
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingTop: 12,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: TEXT,
        fontWeight: '600',
        fontSize: 14,
    },
    reviewButton: {
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    reviewButtonText: {
        color: TEXT,
        fontWeight: '600',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalBackButton: {
        marginRight: 12,
    },
    modalBackIcon: {
        fontSize: 20,
        color: '#1F2937',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    ratingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    star: {
        fontSize: 32,
    },
    reviewLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    reviewInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        fontSize: 15,
        color: '#1F2937',
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    submitButton: {
        backgroundColor: PRIMARY,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
