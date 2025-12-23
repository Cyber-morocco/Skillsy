import { StyleSheet } from 'react-native';

const PRIMARY = '#7C3AED';
const BACKGROUND = '#050816';
const CARD = '#101936';
const TEXT = '#F8FAFC';
const NOTEXT = '#94A3B8';

export const conversationColors = {
    primary: PRIMARY,
    background: BACKGROUND,
    card: CARD,
    text: TEXT,
    notext: NOTEXT,
};

export const conversationStyles = StyleSheet.create({
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
        borderBottomColor: 'rgba(30, 41, 59, 0.5)',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    backIcon: {
        color: TEXT,
        fontSize: 24,
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
        color: TEXT,
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
    contactStatus: {
        color: '#22C55E',
        fontSize: 12,
    },
    appointmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.3)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    appointmentButtonText: {
        color: TEXT,
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 100,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: PRIMARY,
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: CARD,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: TEXT,
    },
    otherMessageText: {
        color: TEXT,
    },
    messageTime: {
        color: NOTEXT,
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: CARD,
        borderTopWidth: 1,
        borderTopColor: 'rgba(30, 41, 59, 0.5)',
    },
    textInput: {
        flex: 1,
        backgroundColor: BACKGROUND,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: TEXT,
        fontSize: 15,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(30, 41, 59, 0.5)',
    },
    sendButton: {
        marginLeft: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        color: TEXT,
        fontSize: 18,
    },
});
