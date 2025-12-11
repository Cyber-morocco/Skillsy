// styles/ChatStyle.ts
import { StyleSheet } from 'react-native';

const PRIMARY = '#7C3AED';
const BACKGROUND = '#050816';
const CARD = '#101936';
const TEXT = '#F8FAFC';
const NOTEXT = '#94A3B8';

export const chatColors = {
    primary: PRIMARY,
    background: BACKGROUND,
    card: CARD,
    text: TEXT,
    notext: NOTEXT,
};

export const chatStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: TEXT,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4C1D95',
    },
    avatarText: {
        color: TEXT,
        fontWeight: '600',
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: CARD,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: TEXT,
        fontSize: 14,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: NOTEXT,
        fontSize: 14,
    },
    // Styles pour la liste des contacts
    contactsList: {
        paddingHorizontal: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(30, 41, 59, 0.5)',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    contactAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactAvatarText: {
        color: TEXT,
        fontWeight: '600',
        fontSize: 16,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: BACKGROUND,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        color: TEXT,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    contactStatus: {
        color: NOTEXT,
        fontSize: 13,
    },
});