import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View,  StyleSheet, Modal, } from 'react-native';

const purple = '#A020F0';

const Availability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'dates'>('week');

  const [days, setDays] = useState([
    { name: 'Maandag', enabled: false, start: '15:00', end: '19:00' },
    { name: 'Dinsdag', enabled: true, start: '15:00', end: '19:00' },
    { name: 'Woensdag', enabled: false, start: '15:00', end: '19:00' },
    { name: 'Donderdag', enabled: true, start: '16:00', end: '19:00' },
    { name: 'Vrijdag', enabled: false, start: '15:00', end: '19:00' },
  ]);

  // Eén state-object voor modal + target
  const [picker, setPicker] = useState<{
    index: number;
    field: 'start' | 'end';
    visible: boolean;
  }>({ index: 0, field: 'start', visible: false });

  const openPicker = (index: number, field: 'start' | 'end') =>
    setPicker({ index, field, visible: true });

  const selectTime = (time: string) => {
    const updated = [...days];
    updated[picker.index][picker.field] = time;
    setDays(updated);
    setPicker({ ...picker, visible: false });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={styles.headerTitle}>Beschikbaarheid</Text>
        <Text style={styles.headerSub}>Stel in wanneer je beschikbaar bent</Text>

        <View style={styles.tabs}>
          {['week', 'dates'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.activeTab]}
              onPress={() => setActiveTab(t as any)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
                {t === 'week' ? 'Per week' : 'Specifieke datums'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Wekelijks schema</Text>
        <Text style={styles.sectionSub}>Deze tijden gelden elke week</Text>

        {days.map((day, idx) => (
          <View key={idx} style={styles.dayCard}>
            <View style={styles.dayRow}>
              <TouchableOpacity
                style={[styles.checkbox, day.enabled && styles.checkboxActive]}
                onPress={() => {
                  const copy = [...days];
                  copy[idx].enabled = !copy[idx].enabled;
                  setDays(copy);
                }}
              />
              <Text style={[styles.dayName, !day.enabled && styles.disabledDay]}>
                {day.name}
              </Text>
            </View>

            {day.enabled && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => openPicker(idx, 'start')}
                >
                  <Text style={styles.timeLabel}>Start</Text>
                  <Text style={styles.timeValue}>{day.start}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => openPicker(idx, 'end')}
                >
                  <Text style={styles.timeLabel}>Einde</Text>
                  <Text style={styles.timeValue}>{day.end}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={picker.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kies een tijd</Text>

            {['14:00', '15:00', '16:00', '17:00'].map((t) => (
              <TouchableOpacity key={t} onPress={() => selectTime(t)}>
                <Text style={styles.modalOption}>{t}</Text>
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

  sectionLabel: { fontSize: 16, fontWeight: '700', marginHorizontal: 20 },
  sectionSub: { color: '#777', marginHorizontal: 20, marginBottom: 12 },

  dayCard: {
    backgroundColor: '#fafafa',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
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

  dayName: { flex: 1, fontSize: 15, fontWeight: '600' },
  disabledDay: { color: '#aaa' },

  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
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
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalOption: { fontSize: 18, paddingVertical: 10, textAlign: 'center', color: purple },

  closeButton: { marginTop: 20, backgroundColor: purple, paddingVertical: 10, borderRadius: 8 },
  closeButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
