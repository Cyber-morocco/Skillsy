import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import ConversationScreen from '../screens/ConversationScreen';

export type ChatStackParamList = {
    ChatList: undefined;
    Conversation: {
        chatId: string;
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
}

function ChatStackNavigator({ matchRequests }: ChatStackProps) {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="ChatList">
                    {props => <ChatScreen {...props} matchRequests={matchRequests} />}
                </Stack.Screen>
                <Stack.Screen name="Conversation" component={ConversationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default ChatStackNavigator;
