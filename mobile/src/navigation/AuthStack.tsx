import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { authColors } from '../styles/authStyles';
import { auth } from '../config/firebase';


import {
  LoginScreen,
  SignupScreen,
  ProfileCreationStep1,
  ProfileCreationStep2,
  ProfileCreationStep3,
} from '../screens';
import PrePagina from '../screens/PrePagina';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProfileCreationStep1: undefined;
  ProfileCreationStep2: undefined;
  ProfileCreationStep3: undefined;
  PrePagina: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: authColors.background,
  },
};

const AuthStackNavigator = ({ initialRouteName = 'Login' }: { initialRouteName?: keyof AuthStackParamList }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PrePagina" screenOptions={screenOptions}>
        <Stack.Screen name="PrePagina" component={PrePagina} />
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileCreationStep1" component={ProfileCreationStep1} />
        <Stack.Screen name="ProfileCreationStep2" component={ProfileCreationStep2} />
        <Stack.Screen name="ProfileCreationStep3" component={ProfileCreationStep3} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthStackNavigator;
