import React from 'react';
import AuthStackNavigator from './mobile/src/navigation/AuthStack';
import Availability from './mobile/src/screens/Availability';

export default function App() {
  return <Availability />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
  },
});
