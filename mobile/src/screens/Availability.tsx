import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { subscribeToAvailability, saveAvailability } from '../services/userService';
import { AvailabilityDay } from '../types';

const purple = '#7C3AED';
const background = '#050816';
const card = '#101936';
const text = '#F8FAFC';
const muted = '#94A3B8';
const border = 'rgba(148, 163, 184, 0.25)';

type Props = {
  navigation?: any;
};

type DayAvailability = {
  name: string;
  enabled: boolean;
  start: string;
  end: string;
};
interface AvailabilityProps {
  onNavigate?: (screen: any) => void;
}

const parseTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
};

const Availability: React.FC<AvailabilityProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'week' | 'dates'>('week');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [days, setDays] = useState<AvailabilityDay[]>([
    { name: 'Maandag', enabled: false, start: '08:00', end: '22:00' },
    { name: 'Dinsdag', enabled: true, start: '08:00', end: '22:00' },
    { name: 'Woensdag', enabled: false, start: '08:00', end: '22:00' },
    { name: 'Donderdag', enabled: true, start: '08:00', end: '22:00' },
    { name: 'Vrijdag', enabled: false, start: '08:00', end: '22:00' },
    { name: 'Zaterdag', enabled: false, start: '08:00', end: '22:00' },
    { name: 'Zondag', enabled: false, start: '08:00', end: '22:00' },
  ]);

  useEffect(() => {
    const unsubscribe = subscribeToAvailability(
      (data) => {
        if (data) {
          setDays(data);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading availability:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const [picker, setPicker] = useState<{
    index: number;
    field: 'start' | 'end';
    visible: boolean;
  }>({
    index: 0,
    field: 'start',
    visible: false,
  });

  const [tempTime, setTempTime] = useState<Date | null>(null);

  const toggleDay = (index: number) => {
    const copy = [...days];
    copy[index].enabled = !copy[index].enabled;
    setDays(copy);
  };

  const openPicker = (index: number, field: 'start' | 'end') => {
    setPicker({ index, field, visible: true });
    setTempTime(null);
  };

  const handleTimeChange = (selectedDate: Date) => {
    const formatted = formatTime(selectedDate);
    const currentDay = days[picker.index];

    const startParts = currentDay.start.split(':').map(Number);
    const endParts = currentDay.end.split(':').map(Number);
    const newParts = formatted.split(':').map(Number);

    const currentStartMinutes = startParts[0] * 60 + startParts[1];
    const currentEndMinutes = endParts[0] * 60 + endParts[1];
    const newMinutes = newParts[0] * 60 + newParts[1];

    if (picker.field === 'start') {
      if (newMinutes >= currentEndMinutes) {
        Alert.alert('Ongeldige tijd', 'De starttijd moet voor de eindtijd liggen.');
        return;
      }
    } else {
      if (newMinutes <= currentStartMinutes) {
        Alert.alert('Ongeldige tijd', 'De eindtijd moet na de starttijd liggen.');
        return;
      }
    }

    const copy = [...days];
    copy[picker.index][picker.field] = formatted;
    setDays(copy);
    if (Platform.OS === 'android') {
      setPicker({ ...picker, visible: false });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAvailability(days);
      Alert.alert('Succes', 'Beschikbaarheid opgeslagen');
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Fout', 'Kon beschikbaarheid niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={purple} />
          <Text style={{ marginTop: 12, color: muted }}>Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Beschikbaarheid</Text>
            <Text style={styles.headerSub}>
              Stel in wanneer je beschikbaar bent
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
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>
              Per week
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => onNavigate && onNavigate('availabilitySpecificDates')}
          >
            <Text style={styles.tabText}>Specifieke datums</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Wekelijks schema</Text>
        <Text style={styles.sectionSub}>Deze tijden gelden elke week</Text>

        {days.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayRow}>
              <TouchableOpacity
                style={[styles.checkbox, day.enabled && styles.checkboxActive]}
                onPress={() => toggleDay(index)}
              />
              <Text style={[styles.dayName, !day.enabled && styles.disabledDay]}>
                {day.name}
              </Text>
            </View>

            {day.enabled && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => openPicker(index, 'start')}
                >
                  <Text style={styles.timeLabel}>Start</Text>
                  <Text style={styles.timeValue}>{day.start}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => openPicker(index, 'end')}
                >
                  <Text style={styles.timeLabel}>Einde</Text>
                  <Text style={styles.timeValue}>{day.end}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Opslaan</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {picker.visible && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setPicker({ ...picker, visible: false })}>
                  <Text style={styles.modalCloseText}>Annuleer</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {picker.field === 'start' ? 'Starttijd' : 'Eindtijd'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const originalTimeStr = days[picker.index][picker.field];
                    const dateToSave = tempTime || parseTime(originalTimeStr);
                    handleTimeChange(dateToSave);
                    setPicker({ ...picker, visible: false });
                    setTempTime(null);
                  }}
                >
                  <Text style={styles.modalDoneText}>Klaar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime || parseTime(days[picker.index][picker.field])}
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
      )}

      {picker.visible && Platform.OS === 'android' && (
        <DateTimePicker
          value={parseTime(days[picker.index][picker.field])}
          mode="time"
          display="default"
          onChange={(event: any, selected?: Date) => {
            if (event.type === 'set' && selected) {
              handleTimeChange(selected);
            } else {
              setPicker({ ...picker, visible: false });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Availability;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginRight: 20,
    marginTop: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 20,
    color: text,
  },
  headerSub: {
    color: muted,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
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

  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 20,
    color: text,
  },
  sectionSub: {
    color: muted,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  dayCard: {
    backgroundColor: card,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: border,
  },
  dayRow: { flexDirection: 'row', alignItems: 'center' },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: purple,
    marginRight: 10,
  },
  checkboxActive: { backgroundColor: purple },

  dayName: { flex: 1, fontSize: 15, fontWeight: '600', color: text },
  disabledDay: { color: muted },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  timeBox: {
    width: '48%',
    backgroundColor: background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
  },
  timeLabel: { fontSize: 13, color: muted },
  timeValue: { fontSize: 16, fontWeight: '700', color: text },

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
    padding: 20,
    borderRadius: 16,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: border,
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
    fontSize: 17,
    fontWeight: '600',
    color: text,
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
