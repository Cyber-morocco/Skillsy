import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Availability from './mobile/src/screens/Availability';
import AvailabilitySpecificDates from './mobile/src/screens/Availability_SpecificDates';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Availability"
          component={Availability}
        />
        <Stack.Screen
          name="AvailabilitySpecificDates"
          component={AvailabilitySpecificDates}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
