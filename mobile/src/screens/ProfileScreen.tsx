import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type SkillLevel = 'Beginner' | 'Gevorderd' | 'Expert';
interface Skill {
  id: string;
  subject: string;
  level: SkillLevel;
  price: string;
}

interface LearnSkill {
  id: string;
  subject: string;
}

interface ProfileScreenProps {
  onNavigate?: (screen: 'availability') => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'wilLeren' | 'reviews'>('skills');
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', subject: 'Frans', level: 'Expert', price: '€25/uur' },
    { id: '2', subject: 'Koken', level: 'Gevorderd', price: '€20/uur' },
    { id: '3', subject: 'Yoga', level: 'Beginner', price: '€15/uur' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLevel, setNewLevel] = useState<SkillLevel>('Beginner');

  const [learnSkills, setLearnSkills] = useState<LearnSkill[]>([
    { id: '1', subject: 'Piano' },
    { id: '2', subject: 'Spaans' },
  ]);
  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [newLearnSubject, setNewLearnSubject] = useState('');



  const AddSkill = () => {
    setModalVisible(true);
  };

  const SaveSkill = () => {
    if (!newSubject || !newPrice) return;

    const newSkill: Skill = {
      id: Date.now().toString(),
      subject: newSubject,
      level: newLevel,
      price: `€${newPrice}/uur`,
    };
    setSkills([...skills, newSkill]);
    setModalVisible(false);

    setNewSubject('');
    setNewPrice('');
    setNewLevel('Beginner');
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const AddLearnSkill = () => {
    setLearnModalVisible(true);
  };

  const SaveLearnSkill = () => {
    if (!newLearnSubject) return;

    const newLearnSkill: LearnSkill = {
      id: Date.now().toString(),
      subject: newLearnSubject,
    };
    setLearnSkills([...learnSkills, newLearnSkill]);
    setLearnModalVisible(false);
    setNewLearnSubject('');
  };

  const handleDeleteLearnSkill = (id: string) => {
    setLearnSkills(learnSkills.filter(s => s.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBackground} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Ionicons name="arrow-back" size={20} color="#24253d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButtonWide} onPress={() => onNavigate?.('availability')}>
            <Ionicons name="calendar-outline" size={18} color="#24253d" />
            <Text style={styles.squareButtonText}>Beschikbaarheid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButtonWide}>
            <Ionicons name="create-outline" size={18} color="#24253d" />
            <Text style={styles.squareButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.profileImage} />

          <Text style={styles.nameText}>Sophie Bakker</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>Centrum, Amsterdam</Text>
          </View>

          <View style={styles.reviewsContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.reviewsText}>4.9 (15 reviews)</Text>
            <Text style={styles.punt}>•</Text>
            <Ionicons name="laptop-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.reviewsText}>Lid sinds Maart 2024</Text>
          </View>

          <Text style={styles.aboutText}>
            Gepassioneerd lerares met een liefde voor talen en koken.
          </Text>

          <View style={styles.tabsContainer}>
            <TouchableOpacity onPress={() => setActiveTab('skills')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'skills' && styles.tabTextActive]}>
                Vaardigheden
              </Text>
              {activeTab === 'skills' && <View style={styles.tabButtonActive} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('wilLeren')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'wilLeren' && styles.tabTextActive]}>
                Wil leren
              </Text>
              {activeTab === 'wilLeren' && <View style={styles.tabButtonActive} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('reviews')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                Reviews
              </Text>
              {activeTab === 'reviews' && <View style={styles.tabButtonActive} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {activeTab === 'skills' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wat ik kan aanleren</Text>
              <TouchableOpacity onPress={AddSkill} style={styles.plusButton}>
                <Ionicons name="add" size={20} color="#24253d" />
              </TouchableOpacity>
            </View>

            {skills.map((skill) => (
              <TouchableOpacity key={skill.id} style={styles.skillCard} activeOpacity={0.7}>
                <View style={styles.skillInfo}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillSubject}>{skill.subject}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{skill.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.priceText}>{skill.price}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteSkill(skill.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

        )}
        {activeTab === 'wilLeren' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wat ik wil leren</Text>

              <TouchableOpacity onPress={AddLearnSkill} style={styles.plusButton}>
                <Ionicons name="add" size={20} color="#24253d" />
              </TouchableOpacity>
            </View>
            {learnSkills.map((skill) => (
              <TouchableOpacity key={skill.id} style={styles.skillCard} activeOpacity={0.7}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillSubject}>{skill.subject}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLearnSkill(skill.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={learnModalVisible}
          onRequestClose={() => setLearnModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nieuwe Interesse</Text>

                <Text style={styles.inputLabel}>Onderwerp</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bijv. Piano"
                  value={newLearnSubject}
                  onChangeText={setNewLearnSubject}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setLearnModalVisible(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Annuleren</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={SaveLearnSkill} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Toevoegen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nieuwe Vaardigheid</Text>

                <Text style={styles.inputLabel}>Onderwerp</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bijv. Wiskunde"
                  value={newSubject}
                  onChangeText={setNewSubject}
                />

                <Text style={styles.inputLabel}>Prijs (per uur)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bijv. €25"
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Niveau</Text>
                <View style={styles.levelSelector}>
                  {(['Beginner', 'Gevorderd', 'Expert'] as SkillLevel[]).map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.levelOption, newLevel === lvl && styles.levelOptionActive]}
                      onPress={() => setNewLevel(lvl)}
                    >
                      <Text style={[styles.levelOptionText, newLevel === lvl && styles.levelOptionTextActive]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Annuleren</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={SaveSkill} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Toevoegen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView >
    </SafeAreaView >
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 430,
    backgroundColor: '#b832ff',
  },
  content: {

    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  squareButton: {
    height: 44,
    minWidth: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  squareButtonWide: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
  },
  squareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24253d',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  reviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  punt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#b832ff',
    fontWeight: '700',
  },
  tabButtonActive: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: '#b832ff',
    borderRadius: 1.5,
  },
  sectionContainer: {
    paddingTop: 24,
    paddingBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24253d',
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f0f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skillInfo: {
    flex: 1,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  skillSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24253d',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f5',
    borderRadius: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  priceText: {
    fontSize: 14,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#24253d',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#24253d',
  },
  input: {
    backgroundColor: '#f6f6f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    alignItems: 'center',
  },
  levelOptionActive: {
    backgroundColor: '#b832ff',
    borderColor: '#b832ff',
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  levelOptionTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f6f6f9',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#b832ff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
