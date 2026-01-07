import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import { Appointment } from '../types';

export type AppointmentStackParamList = {
    AppointmentsList: undefined;
    AppointmentDetail: {
        appointment: Appointment;
    };
};

const Stack = createNativeStackNavigator<AppointmentStackParamList>();

function AppointmentStackNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="AppointmentsList" component={AppointmentsScreen} />
                <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppointmentStackNavigator;
