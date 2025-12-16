import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { authColors } from '../styles/authStyles';


import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileCreationStep1 from '../screens/ProfileCreationStep1';
import ProfileCreationStep2 from '../screens/ProfileCreationStep2';
import ProfileCreationStep3 from '../screens/ProfileCreationStep3';
import ChatScreen from '../screens/ChatScreen';
import ConversationScreen from '../screens/ConversationScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileCreationStep1: undefined;
  ProfileCreationStep2: undefined;
  ProfileCreationStep3: undefined;
  Chat: undefined;
  Conversation: {
    contactId: string;
    contactName: string;
    contactInitials: string;
    contactColor: string;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: authColors.background,
  },
};

const AuthStackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ProfileCreationStep2" screenOptions={screenOptions}>
        <Stack.Screen name="ProfileCreationStep1" component={ProfileCreationStep1} />
        <Stack.Screen name="ProfileCreationStep2" component={ProfileCreationStep2} />
        <Stack.Screen name="ProfileCreationStep3" component={ProfileCreationStep3} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Conversation" component={ConversationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigator;
