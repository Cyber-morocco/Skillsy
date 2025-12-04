import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { authColors } from '../styles/authStyles';
import LoginScreen from '../LoginScreen';
import SignupScreen from '../SignupScreen';
import DiscoverScreen from '../DiscoverScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Discover: undefined;
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
      <Stack.Navigator initialRouteName="Discover" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Discover" component={DiscoverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigator;


