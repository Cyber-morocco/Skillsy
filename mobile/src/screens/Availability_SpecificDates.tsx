import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const purple = '#A020F0';

type Props = { navigation: any };

type SpecificDate = {
  date: Date;
  start: string;
  end: string;
};

const AvailabilitySpecificDates: React.FC<Props> = ({ navigation }) => {
  const [dates, setDates] = useState<SpecificDate[]>([]);

  const addDate = () => {
    setDates([...dates, { date: new Date(), start: '08:00', end: '22:00' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.headerTitle}>Beschikbaarheid</Text>
        <Text style={styles.headerSub}>Kies specifieke datums</Text>

        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tab} onPress={() => navigation.goBack()}>
            <Text style={styles.tabText}>Per week</Text>
          </TouchableOpacity>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>
              Specifieke datums
            </Text>
          </View>
        </View>

        <View style={styles.addCard}>
          <Text style={styles.addLabel}>Specifieke datums</Text>
          <TouchableOpacity onPress={addDate}>
            <Text style={styles.addAction}>+ Voeg toe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AvailabilitySpecificDates;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerTitle: { marginTop: 15, fontSize: 24, fontWeight: '700', marginHorizontal: 20 },
  headerSub: { color: '#777', marginHorizontal: 20, marginBottom: 20 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: purple, borderColor: purple },
  tabText: { color: '#333', fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: '600' },
  addCard: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addLabel: { fontWeight: '600' },
  addAction: { color: purple, fontWeight: '700' },
});
