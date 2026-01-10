import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../screens/ChatScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ExploreProfileScreen from '../screens/ExploreProfileScreen';

export type ChatStackParamList = {
    ChatList: undefined;
    Conversation: {
        chatId: string;
        contactId: string;
        contactName: string;
        contactInitials: string;
        contactColor: string;
        contactPhotoURL?: string;
    };
    ExploreProfile: {
        userId: string;
    };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

import { MatchRequest } from '../types';

interface ChatStackProps {
    matchRequests?: MatchRequest[];
    onRespondMatch: (matchId: string, status: 'accepted' | 'rejected') => Promise<void>;
    onClearAllMatches: (subject?: string) => Promise<void>;
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
                    {props => <ChatScreen
                        {...props}
                        matchRequests={matchRequests}
                        onRespondMatch={onRespondMatch}
                        onClearAllMatches={onClearAllMatches}
                    />}
                </Stack.Screen>
                <Stack.Screen name="Conversation" component={ConversationScreen} />
                <Stack.Screen name="ExploreProfile">
                    {props => (
                        <ExploreProfileScreen
                            userId={props.route.params.userId}
                            onBack={() => props.navigation.goBack()}
                            onSendMessage={() => props.navigation.goBack()}
                        />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default ChatStackNavigator;
