import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import ConversationScreen from '../screens/ConversationScreen';

export type ChatStackParamList = {
    ChatList: undefined;
    Conversation: {
        contactId: string;
        contactName: string;
        contactInitials: string;
        contactColor: string;
    };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

import { MatchRequest } from '../types';

interface ChatStackProps {
    matchRequests?: MatchRequest[];
    onRespondMatch?: (matchId: string, status: 'accepted' | 'rejected') => void;
    onClearAllMatches?: (subject?: string) => void;
}

function ChatStackNavigator({ matchRequests, onRespondMatch, onClearAllMatches }: ChatStackProps) {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="ChatList">
                    {props => <ChatScreen {...props} matchRequests={matchRequests} onRespondMatch={onRespondMatch} onClearAllMatches={onClearAllMatches} />}
                </Stack.Screen>
                <Stack.Screen name="Conversation" component={ConversationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default ChatStackNavigator;
