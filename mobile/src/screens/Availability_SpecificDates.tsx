import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  subscribeToSpecificDates,
  addSpecificDate,
  updateSpecificDate,
  deleteSpecificDate
} from '../services/userService';

const purple = '#7C3AED';
const background = '#050816';
const card = '#101936';
const text = '#F8FAFC';
const muted = '#94A3B8';
const border = 'rgba(148, 163, 184, 0.25)';


type Props = {
  onNavigate?: (screen: any) => void;
};

type SpecificDate = {
  id: string;
  date: Date;
  start: string;
  end: string;
};

const parseTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
};

const AvailabilitySpecificDates: React.FC<Props> = ({ onNavigate }) => {
  const [dates, setDates] = useState<SpecificDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<Date | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const [timePicker, setTimePicker] = useState<{
    visible: boolean;
    index: number | null;
    field: 'start' | 'end';
  }>({
    visible: false,
    index: null,
    field: 'start',
  });

  useEffect(() => {
    try {
      const unsubscribe = subscribeToSpecificDates((fetched) => {
        setDates(fetched as SpecificDate[]);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error subscribing to specific dates:', error);
      setLoading(false);
    }
  }, []);

  const handleAddDate = async () => {
    try {
      await addSpecificDate(new Date(), '09:00', '17:00');
    } catch (error) {
      console.error('Error adding date:', error);
      Alert.alert('Fout', 'Kon de datum niet toevoegen.');
    }
  };

  const handleDeleteDate = async (id: string) => {
    try {
      await deleteSpecificDate(id);
    } catch (error) {
      console.error('Error deleting date:', error);
      Alert.alert('Fout', 'Kon de datum niet verwijderen.');
    }
  };

  const handleUpdateDate = async (id: string, updates: Partial<{ date: Date, start: string, end: string }>) => {
    try {
      await updateSpecificDate(id, updates);
    } catch (error) {
      console.error('Error updating date:', error);
      Alert.alert('Fout', 'Kon de datum niet bijwerken.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={purple} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Beschikbaarheid</Text>
            <Text style={styles.headerSub}>
              Kies specifieke datums met eigen tijdschema
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onNavigate && onNavigate('profile')}
          >
            <Ionicons name="close" size={28} color={text} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tab} onPress={() => onNavigate && onNavigate('availability')}>
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
          <TouchableOpacity onPress={handleAddDate}>
            <Text style={styles.addAction}>+ Voeg toe</Text>
          </TouchableOpacity>
        </View>

        {dates.map((item, i) => (
          <View key={item.id} style={styles.dateCard}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setActiveIndex(i);
                  setDatePickerVisible(true);
                }}
              >
                <Text style={styles.dateText}>
                  {item.date.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'long' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDate(item.id)}
              >
                <Text style={styles.deleteIcon}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() =>
                  setTimePicker({ visible: true, index: i, field: 'start' })
                }
              >
                <Text style={styles.timeLabel}>Start</Text>
                <Text style={styles.timeValue}>{item.start}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeBox}
                onPress={() =>
                  setTimePicker({ visible: true, index: i, field: 'end' })
                }
              >
                <Text style={styles.timeLabel}>Einde</Text>
                <Text style={styles.timeValue}>{item.end}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            Alert.alert('Modus Bijgewerkt', 'Je gebruikt nu Specifieke Datums voor je beschikbaarheid.', [
              { text: 'OK', onPress: () => onNavigate && onNavigate('profile') }
            ]);
          }}
        >
          <Text style={styles.saveButtonText}>Gereed</Text>
        </TouchableOpacity>
      </ScrollView>

      {
        datePickerVisible && Platform.OS === 'ios' && (
          <Modal transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                    <Text style={styles.modalCloseText}>Annuleer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (activeIndex !== null && dates[activeIndex]) {
                        const dateToSave = tempDate || dates[activeIndex].date;
                        handleUpdateDate(dates[activeIndex].id, { date: dateToSave });
                        const copy = [...dates];
                        copy[activeIndex].date = dateToSave;
                        setDates(copy);
                      }
                      setDatePickerVisible(false);
                      setTempDate(null);
                    }}
                  >
                    <Text style={styles.modalDoneText}>Klaar</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate || (activeIndex !== null && dates[activeIndex]?.date ? dates[activeIndex].date : new Date())}
                  mode="date"
                  display="spinner"
                  onChange={(event: any, selected?: Date) => {
                    if (selected) setTempDate(selected);
                  }}
                  textColor={purple}
                />
              </View>
            </View>
          </Modal>
        )
      }

      {
        datePickerVisible && Platform.OS === 'android' && activeIndex !== null && (
          <DateTimePicker
            value={dates[activeIndex]?.date ?? new Date()}
            mode="date"
            display="default"
            onChange={(event: any, selected?: Date) => {
              setDatePickerVisible(false);
              if (event.type === 'set' && selected && activeIndex !== null && dates[activeIndex]) {
                handleUpdateDate(dates[activeIndex].id, { date: selected });
                const copy = [...dates];
                copy[activeIndex].date = selected;
                setDates(copy);
              }
            }}
          />
        )
      }

      {
        timePicker.visible && Platform.OS === 'ios' && (
          <Modal transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setTimePicker({ ...timePicker, visible: false })}>
                    <Text style={styles.modalCloseText}>Annuleer</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {timePicker.field === 'start' ? 'Starttijd' : 'Eindtijd'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (timePicker.index !== null && dates[timePicker.index]) {
                        const originalTimeStr = dates[timePicker.index][timePicker.field];
                        const dateToSave = tempTime || parseTime(originalTimeStr);
                        const formatted = formatTime(dateToSave);

                        const currentStart = dates[timePicker.index].start;
                        const currentEnd = dates[timePicker.index].end;

                        const [sH, sM] = currentStart.split(':').map(Number);
                        const [eH, eM] = currentEnd.split(':').map(Number);
                        const [nH, nM] = formatted.split(':').map(Number);

                        const startMins = sH * 60 + sM;
                        const endMins = eH * 60 + eM;
                        const newMins = nH * 60 + nM;

                        if (timePicker.field === 'start') {
                          if (newMins >= endMins) {
                            Alert.alert('Ongeldige tijd', 'De starttijd moet voor de eindtijd liggen.');
                            return;
                          }
                        } else {
                          if (newMins <= startMins) {
                            Alert.alert('Ongeldige tijd', 'De eindtijd moet na de starttijd liggen.');
                            return;
                          }
                        }

                        handleUpdateDate(dates[timePicker.index].id, { [timePicker.field]: formatted });

                        const copy = [...dates];
                        copy[timePicker.index][timePicker.field] = formatted;
                        setDates(copy);
                      }
                      setTimePicker({ ...timePicker, visible: false });
                      setTempTime(null);
                    }}
                  >
                    <Text style={styles.modalDoneText}>Klaar</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  key={timePicker.field}
                  value={tempTime || (timePicker.index !== null && dates[timePicker.index] ? parseTime(dates[timePicker.index][timePicker.field]) : new Date())}
                  mode="time"
                  display="spinner"
                  onChange={(event: any, selected?: Date) => {
                    if (selected) setTempTime(selected);
                  }}
                  textColor={purple}
                />
              </View>
            </View>
          </Modal>
        )
      }

      {
        timePicker.visible && Platform.OS === 'android' && timePicker.index !== null && (
          <DateTimePicker
            key={timePicker.field}
            value={dates[timePicker.index] ? parseTime(dates[timePicker.index][timePicker.field]) : new Date()}
            mode="time"
            display="default"
            onChange={(event: any, selected?: Date) => {
              setTimePicker({ ...timePicker, visible: false });
              if (event.type === 'set' && selected && timePicker.index !== null && dates[timePicker.index]) {
                const formattedTime = formatTime(selected);

                const currentStart = dates[timePicker.index].start;
                const currentEnd = dates[timePicker.index].end;

                const [sH, sM] = currentStart.split(':').map(Number);
                const [eH, eM] = currentEnd.split(':').map(Number);
                const [nH, nM] = formattedTime.split(':').map(Number);

                const startMins = sH * 60 + sM;
                const endMins = eH * 60 + eM;
                const newMins = nH * 60 + nM;

                if (timePicker.field === 'start') {
                  if (newMins >= endMins) {
                    Alert.alert('Ongeldige tijd', 'De starttijd moet voor de eindtijd liggen.');
                    return;
                  }
                } else {
                  if (newMins <= startMins) {
                    Alert.alert('Ongeldige tijd', 'De eindtijd moet na de starttijd liggen.');
                    return;
                  }
                }

                handleUpdateDate(dates[timePicker.index].id, { [timePicker.field]: formattedTime });

                const copy = [...dates];
                copy[timePicker.index][timePicker.field] = formattedTime;
                setDates(copy);
              }
            }}
          />
        )
      }
    </SafeAreaView >
  );
};

export default AvailabilitySpecificDates;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginRight: 20,
    marginTop: 15,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', marginHorizontal: 20, color: text },
  headerSub: { color: muted, marginHorizontal: 20, marginBottom: 20 },
  closeButton: {
    padding: 5,
  },

  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
    backgroundColor: card,
  },
  activeTab: { backgroundColor: purple, borderColor: purple },
  tabText: { color: muted, fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: '600' },

  addCard: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addLabel: { fontWeight: '600', color: text, fontSize: 16 },
  addAction: { color: purple, fontWeight: '700', fontSize: 16 },

  dateCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  dateButton: {
    backgroundColor: purple,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  deleteIcon: {
    fontSize: 24,
    color: '#EF4444',
    lineHeight: 24
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timeBox: {
    width: '48%',
    backgroundColor: background,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: muted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: text
  },

  saveButton: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: purple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: border,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: border,
    alignItems: 'center',
  },
  modalTitle: {
    color: text,
    fontWeight: '600',
    fontSize: 17,
  },
  modalDoneText: {
    color: purple,
    fontWeight: '700',
    fontSize: 16,
  },
  modalCloseText: {
    color: muted,
    fontWeight: '600',
    fontSize: 16
  },
});
