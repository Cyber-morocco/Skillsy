import { Platform, StyleSheet } from 'react-native';

const COLORS = {
    background: '#050816',
    card: '#101936',
    primary: '#7C3AED',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    warning: '#F59E0B',
    border: 'rgba(148, 163, 184, 0.25)',
    danger: '#EF4444',
};

export const appointmentDetailColors = COLORS;

export const appointmentDetailStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 20,
        color: COLORS.text,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    mainCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    avatarTextLarge: {
        color: COLORS.text,
        fontWeight: '700',
        fontSize: 22,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusConfirmed: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    statusPending: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusConfirmedText: {
        color: COLORS.success,
    },
    statusPendingText: {
        color: COLORS.warning,
    },
    sectionCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    detailIcon: {
        fontSize: 18,
        marginRight: 12,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    joinButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    joinButtonText: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 15,
    },
    feeBox: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feeLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    feeAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    actionsSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    rescheduleButton: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    rescheduleButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 15,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    cancelButtonText: {
        color: COLORS.danger,
        fontWeight: '600',
        fontSize: 15,
    },
    bottomPadding: {
        height: 40,
    },
});
