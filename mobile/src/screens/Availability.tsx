import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Availability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'dates'>('week');

  const [days, setDays] = useState([
    { name: 'Maandag', enabled: false, start: '15:00', end: '19:00' },
    { name: 'Dinsdag', enabled: true, start: '15:00', end: '19:00' },
  ]);

  const toggleDay = (index: number) => {
    const copy = [...days];
    copy[index].enabled = !copy[index].enabled;
    setDays(copy);
  };
  {days.map((day, idx) => (
  <View key={idx}>
    <TouchableOpacity onPress={() => toggleDay(idx)}>
      <Text>{day.enabled ? '🟣' : '⚪'} {day.name}</Text>
    </TouchableOpacity>

    {day.enabled && (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ padding: 10 }}>
          <Text>Start</Text>
          <Text>{day.start}</Text>
        </View>

        <View style={{ padding: 10 }}>
          <Text>Einde</Text>
          <Text>{day.end}</Text>
        </View>
      </View>
    )}
  </View>
))}

  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Beschikbaarheid</Text>
        <Text>Stel in wanneer je beschikbaar bent</Text>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setActiveTab('week')}>
            <Text>Per week</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('dates')}>
            <Text>Specifieke datums</Text>
          </TouchableOpacity>
        </View>

        {days.map((d, i) => (
          <View key={i}>
            <TouchableOpacity onPress={() => toggleDay(i)}>
              <Text>{d.enabled ? '🟣' : '⚪'} {d.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Availability;
