import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Availability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'dates'>('week');

  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Beschikbrheid</Text>
        <Text> wanneer je beschikbaar bent</Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setActiveTab('week')}>
            <Text>Per week</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('dates')}>
            <Text>Specifieke datums</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Availability;
