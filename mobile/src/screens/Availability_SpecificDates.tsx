import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const purple = '#A020F0';

const TIMES = [
  '08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00',
];

type Props = {
  navigation: any;
};

type SpecificDate = {
  date: Date;
  start: string;
  end: string;
};

const AvailabilitySpecificDates: React.FC<Props> = ({ navigation }) => {
  const [dates, setDates] = useState<SpecificDate[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [timePicker, setTimePicker] = useState<{
    visible: boolean;
    index: number;
    field: 'start' | 'end';
  }>({ visible: false, index: 0, field: 'start' });

  const addDate = () => {
    setDates([...dates, { date: new Date(), start: '08:00', end: '22:00' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.headerTitle}>Beschikbaarheid</Text>
        <Text style={styles.headerSub}>
          Kies specifieke datums met eigen tijdschema
        </Text>

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

        {dates.map((item, i) => (
          <View key={i} style={styles.dateCard}>
            <View style={styles.dateHeader}>
              <TouchableOpacity
                onPress={() => {
                  setActiveIndex(i);
                  setDatePickerVisible(true);
                }}
              >
                <Text style={styles.dateText}>
                  {item.date.toLocaleDateString('nl-BE')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const copy = [...dates];
                  copy.splice(i, 1);
                  setDates(copy);
                }}
              >
                <Text style={styles.remove}>× Verwijder</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setTimePicker({ visible: true, index: i, field: 'start' })}
              >
                <Text style={styles.timeLabel}>Start</Text>
                <Text style={styles.timeValue}>{item.start}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setTimePicker({ visible: true, index: i, field: 'end' })}
              >
                <Text style={styles.timeLabel}>Einde</Text>
                <Text style={styles.timeValue}>{item.end}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {datePickerVisible && activeIndex !== null && (
        <DateTimePicker
          value={dates[activeIndex].date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setDatePickerVisible(false);
            if (!selected) return;
            const copy = [...dates];
            copy[activeIndex].date = selected;
            setDates(copy);
          }}
        />
      )}

      <Modal visible={timePicker.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  const copy = [...dates];
                  copy[timePicker.index][timePicker.field] = t;
                  setDates(copy);
                  setTimePicker({ ...timePicker, visible: false });
                }}
              >
                <Text style={styles.modalOption}>{t}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setTimePicker({ ...timePicker, visible: false })}
            >
              <Text style={styles.modalCloseText}>Annuleer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  dateCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontWeight: '600' },
  remove: { color: 'red', fontWeight: '600' },

  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeBox: { width: '48%', backgroundColor: '#f2f2f2', padding: 12, borderRadius: 10 },
  timeLabel: { fontSize: 13, color: '#777' },
  timeValue: { fontSize: 16, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
    textAlign: 'center',
    color: purple,
    fontWeight: '700',
  },
  modalClose: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: purple,
  },
  modalCloseText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
});
