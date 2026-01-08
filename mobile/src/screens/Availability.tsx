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
} from 'react-native';
import { subscribeToAvailability, saveAvailability } from '../services/userService';
import { AvailabilityDay } from '../types';

const purple = '#7C3AED'; // Updated to match other screens
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

  const toggleDay = (index: number) => {
    const copy = [...days];
    copy[index].enabled = !copy[index].enabled;
    setDays(copy);
  };

  const openPicker = (index: number, field: 'start' | 'end') => {
    setPicker({ index, field, visible: true });
  };

  const selectTime = (time: string) => {
    const copy = [...days];
    copy[picker.index][picker.field] = time;
    setDays(copy);
    setPicker({ ...picker, visible: false });
  };

  const handleSave = async () => { // stuurt naar DB  
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

  const TIMES = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00',
  ];

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

        <Text style={styles.headerTitle}>Beschikbaarheid</Text>
        <Text style={styles.headerSub}>
          Stel in wanneer je beschikbaar bent
        </Text>


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
      <Modal visible={picker.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kies een tijd</Text>

            {TIMES.map(time => (
              <TouchableOpacity key={time} onPress={() => selectTime(time)}>
                <Text style={styles.modalOption}>{time}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPicker({ ...picker, visible: false })}
            >
              <Text style={styles.closeButtonText}>Annuleer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Availability;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background },

  headerTitle: {
    marginTop: 15,
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
    backgroundColor: background, // Slightly darker than card
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: border,
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '75%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: text,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 10,
    textAlign: 'center',
    color: purple,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: purple,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
