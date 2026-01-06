import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Skill, LearnSkill, SkillLevel, UserProfile } from '../types';
import {
  subscribeToSkills,
  subscribeToLearnSkills,
  subscribeToUserProfile,
  addSkill,
  deleteSkill,
  addLearnSkill,
  deleteLearnSkill,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from '../services/userService';
import * as ImagePicker from 'expo-image-picker';

interface ProfileScreenProps {
  onNavigate?: (screen: 'availability') => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'wilLeren' | 'reviews'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<LearnSkill[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newLevel, setNewLevel] = useState<SkillLevel>('Beginner');

  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [newLearnSubject, setNewLearnSubject] = useState('');

  const [profileName, setProfileName] = useState('Sophie Bakker');
  const [profileLocation, setProfileLocation] = useState('Centrum, Amsterdam');
  const [profileAbout, setProfileAbout] = useState('Gepassioneerd lerares met een liefde voor talen en koken.');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempAbout, setTempAbout] = useState('');
  const [tempImage, setTempImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeProfile = subscribeToUserProfile(
      (profile) => {
        setUserProfile(profile);
      },
      (error) => {
        console.error('Error loading profile:', error);
      }
    );

    const unsubscribeSkills = subscribeToSkills(
      (fetchedSkills) => {
        setSkills(fetchedSkills);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading skills:', error);
        Alert.alert('Fout', 'Kon vaardigheden niet laden');
        setLoading(false);
      }
    );

    const unsubscribeLearnSkills = subscribeToLearnSkills(
      (fetchedSkills) => {
        setLearnSkills(fetchedSkills);
      },
      (error) => {
        console.error('Error loading learn skills:', error);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeSkills();
      unsubscribeLearnSkills();
    };
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we hebben toestemming nodig om de camera te gebruiken! Geef toestemming in de instellingen van jouw telefoon.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
    }
  };

  const handleEditProfile = () => {
    setTempName(userProfile?.displayName || profileName);
    setTempLocation(userProfile?.location?.city || profileLocation);
    setTempAbout(userProfile?.bio || profileAbout);
    setTempImage(userProfile?.photoURL || profileImage);
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      let finalImageUrl = userProfile?.photoURL || profileImage;

      // If tempImage is null, it means the user wants to remove the photo
      if (tempImage === null) {
        if (userProfile?.photoURL) {
          await deleteProfileImage();
        }
        finalImageUrl = null;
      }
      // If tempImage exists and is a local URI (doesn't start with http), upload it
      else if (tempImage && !tempImage.startsWith('http')) {
        finalImageUrl = await uploadProfileImage(tempImage);
      }

      await updateUserProfile({
        displayName: tempName,
        'location.city': tempLocation,
        bio: tempAbout,
        photoURL: finalImageUrl,
      });

      setProfileName(tempName);
      setProfileLocation(tempLocation);
      setProfileAbout(tempAbout);
      setProfileImage(finalImageUrl);
      setEditModalVisible(false);
      Alert.alert('Succes', 'Profiel bijgewerkt');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Fout', 'Kon profiel niet bijwerken');
    } finally {
      setSaving(false);
    }
  };

  const AddSkill = () => {
    setModalVisible(true);
  };

  const SaveSkill = async () => {
    if (!newSubject || !newPrice) return;

    setSaving(true);
    try {
      await addSkill({
        subject: newSubject,
        level: newLevel,
        price: `€${newPrice}/uur`,
      });
      setModalVisible(false);
      setNewSubject('');
      setNewPrice('');
      setNewLevel('Beginner');
    } catch (error) {
      console.error('Error saving skill:', error);
      Alert.alert('Fout', 'Kon vaardigheid niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteSkill(id);
    } catch (error) {
      console.error('Error deleting skill:', error);
      Alert.alert('Fout', 'Kon vaardigheid niet verwijderen');
    }
  };

  const AddLearnSkill = () => {
    setLearnModalVisible(true);
  };

  const SaveLearnSkill = async () => {
    if (!newLearnSubject) return;

    setSaving(true);
    try {
      await addLearnSkill({
        subject: newLearnSubject,
      });
      setLearnModalVisible(false);
      setNewLearnSubject('');
    } catch (error) {
      console.error('Error saving learn skill:', error);
      Alert.alert('Fout', 'Kon interesse niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLearnSkill = async (id: string) => {
    try {
      await deleteLearnSkill(id);
    } catch (error) {
      console.error('Error deleting learn skill:', error);
      Alert.alert('Fout', 'Kon interesse niet verwijderen');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBackground} />
        <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#b832ff" />
          <Text style={{ marginTop: 16, color: '#fff', fontSize: 16 }}>Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Nooit';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
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

          <TouchableOpacity style={styles.squareButtonWide} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={18} color="#24253d" />
            <Text style={styles.squareButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            {(userProfile?.photoURL || profileImage) ? (
              <Image
                source={{ uri: (userProfile?.photoURL || profileImage) as string }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color="#ccc" />
              </View>
            )}
          </View>

          <Text style={styles.nameText}>{userProfile?.displayName || profileName}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>
              {userProfile?.location?.city || userProfile?.location?.address || profileLocation}
            </Text>
          </View>

          <View style={styles.reviewsContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.reviewsText}>4.9 (15 reviews)</Text>
            <Text style={styles.punt}>•</Text>
            <Ionicons name="laptop-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.reviewsText}>Lid sinds {formatDate(userProfile?.createdAt)}</Text>
          </View>

          <Text style={styles.aboutText}>
            {userProfile?.bio || profileAbout}
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Profiel Bewerken</Text>

                <Text style={styles.inputLabel}>Naam</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Naam"
                  value={tempName}
                  onChangeText={setTempName}
                />

                <Text style={styles.inputLabel}>Locatie</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Locatie"
                  value={tempLocation}
                  onChangeText={setTempLocation}
                />

                <Text style={styles.inputLabel}>Over mij</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Vertel iets over jezelf..."
                  value={tempAbout}
                  onChangeText={setTempAbout}
                  multiline={true}
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Profielfoto</Text>
                <View style={styles.imageEditContainer}>
                  <View style={styles.tempImageContainer}>
                    {tempImage ? (
                      <Image source={{ uri: tempImage as string }} style={styles.tempImage} />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Ionicons name="person" size={40} color="#ccc" />
                      </View>
                    )}
                  </View>
                  <View style={styles.imageButtons}>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                      <Ionicons name="image-outline" size={20} color="#24253d" />
                      <Text style={styles.imagePickerButtonText}>Galerij</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                      <Ionicons name="camera-outline" size={20} color="#24253d" />
                      <Text style={styles.imagePickerButtonText}>Camera</Text>
                    </TouchableOpacity>
                    {(tempImage || userProfile?.photoURL) && (
                      <TouchableOpacity
                        style={[styles.imagePickerButton, { borderColor: '#ff4444' }]}
                        onPress={() => setTempImage(null)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                        <Text style={[styles.imagePickerButtonText, { color: '#ff4444' }]}>Verwijder</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Annuleren</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Opslaan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Uitloggen',
                'Weet je zeker dat je wilt uitloggen?',
                [
                  { text: 'Annuleren', style: 'cancel' },
                  {
                    text: 'Uitloggen',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await signOut(auth);
                      } catch (error) {
                        Alert.alert('Fout', 'Kan niet uitloggen');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff4444" />
            <Text style={styles.logoutButtonText}>Uitloggen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f5',
    alignItems: 'center',
    justifyContent: 'center',
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
  imageEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    backgroundColor: '#f6f6f9',
    padding: 12,
    borderRadius: 16,
  },
  tempImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tempImage: {
    width: '100%',
    height: '100%',
  },
  imageButtons: {
    flex: 1,
    gap: 8,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  imagePickerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#24253d',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
});
