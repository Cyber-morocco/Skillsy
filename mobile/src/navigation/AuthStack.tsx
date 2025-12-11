import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { authColors } from '../styles/authStyles';

// Import screens
import {
  LoginScreen,
  SignupScreen,
  ProfileCreationStep1,
} from '../screens';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileCreationStep1: undefined;
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
      <Stack.Navigator initialRouteName="ProfileCreationStep1" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileCreationStep1" component={ProfileCreationStep1} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigator;
