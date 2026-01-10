import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView, Alert, ActivityIndicator, Image, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth, } from '../config/firebase';
import { Avatar } from '../components/Avatar';
import { authColors } from '../styles/authStyles';
import { Skill, LearnSkill, SkillLevel, UserProfile, Review } from '../types';
import {
  subscribeToSkills,
  subscribeToLearnSkills,
  subscribeToUserProfile,
  subscribeToOtherUserReviews,
  addSkill,
  deleteSkill,
  addLearnSkill,
  deleteLearnSkill,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  uploadVideo,
  deleteVideo,
} from '../services/userService';
import * as ImagePicker from 'expo-image-picker';
import { resolveSkillIntelligence, SkillResolutionResult } from '../services/skillIntelligenceService';
import { ROOT_CATEGORIES } from '../constants/categories';
import { useRef } from 'react';

interface ProfileScreenProps {
  onNavigate?: (screen: 'availability') => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'wilLeren' | 'promoVideo' | 'reviews'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<LearnSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newLevel, setNewLevel] = useState<SkillLevel>('Beginner');
  const [intelligenceResult, setIntelligenceResult] = useState<SkillResolutionResult | null>(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [learnModalVisible, setLearnModalVisible] = useState(false);
  const [newLearnSubject, setNewLearnSubject] = useState('');

  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileAbout, setProfileAbout] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAbout, setTempAbout] = useState('');
  const [tempImage, setTempImage] = useState<string | null>(null);

  // Structured address states
  const [tempStreet, setTempStreet] = useState('');
  const [tempZipCode, setTempZipCode] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

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

    const unsubscribeReviews = auth.currentUser?.uid ? subscribeToOtherUserReviews(
      auth.currentUser.uid,
      (fetchedReviews) => {
        setReviews(fetchedReviews);
      },
      (error) => {
        console.error('Error loading reviews:', error);
      }
    ) : () => { };

    return () => {
      unsubscribeProfile();
      unsubscribeSkills();
      unsubscribeLearnSkills();
      unsubscribeReviews();
    };
  }, []);

  useEffect(() => {
    if (newSubject.length < 3) {
      setIntelligenceResult(null);
      setLoadingIntelligence(false);
      return;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setLoadingIntelligence(true);
    typingTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await resolveSkillIntelligence(newSubject);
        setIntelligenceResult(result);
      } catch (error) {
        console.error("Intelligence error:", error);
      } finally {
        setLoadingIntelligence(false);
      }
    }, 600);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newSubject]);

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

  const searchAddress = async (text: string) => {
    setTempStreet(text);
    if (text.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowAddressSuggestions((data.features || []).length > 0);
    } catch (error) {
      console.error('Photon API error:', error);
    }
  };

  const selectAddressSuggestion = (feature: any) => {
    const { properties, geometry } = feature;

    const streetName = properties.street || properties.name || '';
    const houseNumber = properties.housenumber ? ` ${properties.housenumber}` : '';
    const fullStreet = `${streetName}${houseNumber}`.trim();

    setTempStreet(fullStreet);
    setTempZipCode(properties.postcode || '');
    setTempCity(properties.city || '');

    if (geometry && geometry.coordinates) {
      setTempCoords({
        lat: geometry.coordinates[1],
        lng: geometry.coordinates[0]
      });
    }

    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const geocodeAddress = async (street: string, city: string, zipCode: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const address = `${street}, ${zipCode} ${city}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'Skillsy-App/1.0' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
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
    setTempName(userProfile?.displayName || '');
    setTempStreet(userProfile?.location?.street || '');
    setTempZipCode(userProfile?.location?.zipCode || '');
    setTempCity(userProfile?.location?.city || '');
    setTempCoords(
      userProfile?.location?.lat && userProfile?.location?.lng
        ? { lat: userProfile.location.lat, lng: userProfile.location.lng }
        : null
    );
    setTempAbout(userProfile?.bio || '');
    setTempImage(userProfile?.photoURL || null);
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    if (!tempName.trim() || !tempStreet.trim() || !tempZipCode.trim() || !tempCity.trim()) {
      Alert.alert('Fout', 'Vul alle verplichte velden in');
      return;
    }

    setSaving(true);
    try {
      let finalCoords = tempCoords;

      // Fallback to geocoding if coords were not set by autocomplete
      if (!finalCoords) {
        finalCoords = await geocodeAddress(tempStreet, tempCity, tempZipCode);
      }

      if (!finalCoords) {
        Alert.alert(
          'Adres niet gevonden',
          'We konden dit adres niet verifiëren. Controleer of de straatnaam, postcode en stad correct zijn.'
        );
        setSaving(false);
        return;
      }

      let finalImageUrl = userProfile?.photoURL || null;

      if (tempImage === null) {
        if (userProfile?.photoURL) {
          await deleteProfileImage();
        }
        finalImageUrl = null;
      }
      else if (tempImage && !tempImage.startsWith('http')) {
        finalImageUrl = await uploadProfileImage(tempImage);
      }

      await updateUserProfile({
        displayName: tempName.trim(),
        location: {
          street: tempStreet.trim(),
          zipCode: tempZipCode.trim(),
          city: tempCity.trim(),
          lat: finalCoords.lat,
          lng: finalCoords.lng,
        },
        bio: tempAbout.trim(),
        photoURL: finalImageUrl,
      });

      setProfileName(tempName.trim());
      setProfileLocation(tempCity.trim());
      setProfileAbout(tempAbout.trim());
      setProfileImage(finalImageUrl as string);
      setEditModalVisible(false);
      Alert.alert('Succes', 'Profiel bijgewerkt');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Fout', error.message || 'Kon profiel niet bijwerken');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
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
  };

  const handleVideoPicker = async (index: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 180,
    });

    if (!result.canceled) {
      setSelectedVideoUri(result.assets[0].uri);
      setEditingVideoIndex(index);
      setVideoTitle('');
      setVideoDescription('');
      setVideoModalVisible(true);
    }
  };

  const handleSaveVideoMetadata = async () => {
    if (editingVideoIndex === null) return;

    if (!videoTitle.trim()) {
      Alert.alert('Fout', 'Voer een titel in');
      return;
    }
    if (videoDescription.length > 100) {
      Alert.alert('Fout', 'Beschrijving mag maximaal 100 karakters bevatten');
      return;
    }

    setSaving(true);
    try {
      const currentVideos = [...(userProfile?.promoVideos || [])];

      while (currentVideos.length <= editingVideoIndex) {
        currentVideos.push({ url: '', title: '', description: '' });
      }

      if (selectedVideoUri) {
        const videoUrl = await uploadVideo(selectedVideoUri, editingVideoIndex);
        currentVideos[editingVideoIndex] = {
          url: videoUrl,
          title: videoTitle.trim(),
          description: videoDescription.trim(),
        };
      } else {
        const existing = currentVideos[editingVideoIndex];
        const existingUrl = typeof existing === 'string' ? existing : (existing?.url || '');

        currentVideos[editingVideoIndex] = {
          url: existingUrl,
          title: videoTitle.trim(),
          description: videoDescription.trim(),
        };
      }

      await updateUserProfile({ promoVideos: currentVideos });
      setVideoModalVisible(false);
      setSelectedVideoUri(null);
    } catch (error) {
      console.error('Error saving video metadata:', error);
      Alert.alert('Fout', 'Kon gegevens niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (index: number) => {
    Alert.alert(
      'Video verwijderen',
      'Weet je zeker dat je deze video wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await deleteVideo(index);
              const currentVideos = [...(userProfile?.promoVideos || [])];
              currentVideos[index] = { url: '', title: '', description: '' };
              await updateUserProfile({ promoVideos: currentVideos });
              Alert.alert('Succes', 'Video verwijderd');
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('Fout', 'Kon video niet verwijderen');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const AddSkill = () => {
    setModalVisible(true);
  };

  const SaveSkill = async () => {
    if (!newSubject) return;
    setSaving(true);

    let rootId = 'overig';
    let finalSubject = newSubject.trim();

    if (intelligenceResult?.type === 'auto_map' && intelligenceResult.match) {
      rootId = intelligenceResult.match.concept.rootId;
      finalSubject = intelligenceResult.match.concept.label;
    } else if (intelligenceResult?.type === 'discovery' && intelligenceResult.proposed) {
      rootId = intelligenceResult.proposed.rootId;
    }

    try {
      await addSkill({
        subject: finalSubject,
        level: newLevel,
        rootId: rootId,
      });
      setModalVisible(false);
      setNewSubject('');
      setNewLevel('Beginner');
      setIntelligenceResult(null);
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
        <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: authColors.background }]}>
          <ActivityIndicator size="large" color={authColors.accent} />
          <Text style={{ marginTop: 16, color: authColors.text, fontSize: 16 }}>Laden...</Text>
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
          <TouchableOpacity style={styles.squareButtonWide} onPress={() => onNavigate?.('availability')}>
            <Ionicons name="calendar-outline" size={18} color={authColors.text} />
            <Text style={styles.squareButtonText}>Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButtonWide} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={18} color={authColors.text} />
            <Text style={styles.squareButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <Avatar
              uri={userProfile?.photoURL}
              name={userProfile?.displayName || 'Gebruiker'}
              size={110}
              style={styles.profileImage}
            />
          </View>

          <Text style={styles.nameText}>{userProfile?.displayName || 'Naamloos'}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>
              {userProfile?.location?.city || userProfile?.location?.address || 'Geen locatie'}
            </Text>
          </View>

          <View style={styles.reviewsContainer}>
            {reviews.length >= 5 ? (
              <>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.reviewsText}>
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length} reviews)
                </Text>
              </>
            ) : (
              <Text style={styles.reviewsText}>Nieuw profiel</Text>
            )}
            <Text style={styles.punt}>•</Text>
            <Ionicons name="laptop-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.reviewsText}>Lid sinds {formatDate(userProfile?.createdAt)}</Text>
          </View>

          <Text style={styles.aboutText}>
            {userProfile?.bio || 'Geen beschrijving beschikbaar.'}
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

            <TouchableOpacity onPress={() => setActiveTab('promoVideo')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'promoVideo' && styles.tabTextActive]}>
                Promo video
              </Text>
              {activeTab === 'promoVideo' && <View style={styles.tabButtonActive} />}
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
                <Ionicons name="add" size={20} color={authColors.text} />
              </TouchableOpacity>
            </View>

            {skills.map((skill) => {
              const catColor = ROOT_CATEGORIES.find(c => c.id === skill.rootId)?.color || 'rgba(255,255,255,0.2)';
              return (
                <TouchableOpacity key={skill.id} style={styles.skillCard} activeOpacity={0.7}>
                  <View style={styles.skillInfo}>
                    <View style={styles.skillHeader}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: catColor, marginRight: 4 }} />
                      <Text style={styles.skillSubject}>{skill.subject}</Text>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{skill.level}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteSkill(skill.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {activeTab === 'wilLeren' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wat ik wil leren</Text>

              <TouchableOpacity onPress={AddLearnSkill} style={styles.plusButton}>
                <Ionicons name="add" size={20} color={authColors.text} />
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

        {activeTab === 'promoVideo' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mijn Promo Video's</Text>
            </View>

            <View style={{ marginBottom: 20, backgroundColor: 'rgba(124, 58, 237, 0.1)', padding: 15, borderRadius: 12 }}>
              <Text style={{ color: authColors.text, fontSize: 13, lineHeight: 18 }}>
                Stel jezelf voor en vertel over je skills! Je kunt maximaal 3 video's van elk max 3 minuten uploaden.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[0, 1, 2].map((index) => {
                const videoEntry = userProfile?.promoVideos?.[index];
                const videoUrl = typeof videoEntry === 'string' ? videoEntry : (videoEntry?.url || '');
                const videoTitleVal = typeof videoEntry === 'string' ? '' : (videoEntry?.title || '');
                const videoDescVal = typeof videoEntry === 'string' ? '' : (videoEntry?.description || '');
                const hasVideo = !!videoUrl;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (hasVideo) {
                        Linking.openURL(videoUrl).catch(err => {
                          console.error('Error opening video URL:', err);
                          Alert.alert('Fout', 'Kon de video niet openen');
                        });
                      } else {
                        handleVideoPicker(index);
                      }
                    }}
                    style={{
                      flex: 1,
                      aspectRatio: 9 / 16,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderStyle: hasVideo ? 'solid' : 'dashed',
                      overflow: 'hidden'
                    }}
                  >
                    {hasVideo ? (
                      <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="play-circle" size={40} color={authColors.accent} />

                        {videoTitleVal ? (
                          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4 }}>
                            <Text numberOfLines={1} style={{ color: '#fff', fontSize: 10, textAlign: 'center' }}>{videoTitleVal}</Text>
                          </View>
                        ) : null}

                        <TouchableOpacity
                          onPress={() => {
                            setEditingVideoIndex(index);
                            setVideoTitle(videoTitleVal);
                            setVideoDescription(videoDescVal);
                            setVideoModalVisible(true);
                          }}
                          style={{
                            position: 'absolute',
                            top: 5,
                            left: 5,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: 4,
                            borderRadius: 12
                          }}
                        >
                          <Ionicons name="create-outline" size={16} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteVideo(index)}
                          style={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: 4,
                            borderRadius: 12
                          }}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Ionicons name="add" size={30} color={authColors.muted} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        {activeTab === 'reviews' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            </View>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{review.fromName || 'Anoniem'}</Text>
                    <Text style={styles.reviewRating}>⭐ {review.rating.toFixed(1)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={authColors.muted} style={{ opacity: 0.5 }} />
                <Text style={styles.emptyText}>Je hebt nog geen reviews ontvangen.</Text>
              </View>
            )}
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
          visible={videoModalVisible}
          onRequestClose={() => {
            setVideoModalVisible(false);
            setSelectedVideoUri(null);
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedVideoUri ? 'Video toevoegen' : 'Video bewerken'}</Text>

                <Text style={styles.inputLabel}>Titel</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Titel..."
                  value={videoTitle}
                  onChangeText={setVideoTitle}
                />

                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Beschrijving</Text>
                  <Text style={styles.charCount}>{videoDescription.length}/100</Text>
                </View>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Korte beschrijving (max 100 tekens)..."
                  value={videoDescription}
                  onChangeText={setVideoDescription}
                  multiline={true}
                  numberOfLines={4}
                  maxLength={100}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setVideoModalVisible(false);
                      setSelectedVideoUri(null);
                      setVideoTitle('');
                      setVideoDescription('');
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Annuleren</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveVideoMetadata}
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>{selectedVideoUri ? 'Plaatsen' : 'Opslaan'}</Text>
                    )}
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
                {loadingIntelligence && (
                  <View style={{ position: 'absolute', right: 36, top: 105 }}>
                    <ActivityIndicator size="small" color={authColors.accent} />
                  </View>
                )}

                {intelligenceResult?.type === 'auto_map' && intelligenceResult.match && (
                  <View style={{ marginTop: -10, marginBottom: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(124, 58, 237, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                    <Ionicons name="checkmark-circle" size={16} color={authColors.accent} />
                    <Text style={{ color: authColors.text, fontSize: 13, marginLeft: 8 }}>
                      Gevonden: <Text style={{ fontWeight: '700' }}>{intelligenceResult.match.concept.label}</Text>
                    </Text>
                  </View>
                )}

                {intelligenceResult?.type === 'discovery' && intelligenceResult.proposed && (
                  <View style={{ marginTop: -10, marginBottom: 15, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>✨ Nieuwe vaardigheid herkend</Text>
                    <Text style={{ color: authColors.muted, fontSize: 13 }}>In categorie: <Text style={{ color: authColors.text, fontWeight: '600' }}>{intelligenceResult.proposed.rootLabel}</Text></Text>
                  </View>
                )}

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


                <Text style={styles.inputLabel}>Gebruikersnaam</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Gebruikersnaam..."
                  value={tempName}
                  onChangeText={setTempName}
                />

                <Text style={styles.inputLabel}>Adres of Straat</Text>
                <View style={{ zIndex: 1000 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Typ je adres..."
                    value={tempStreet}
                    onChangeText={searchAddress}
                    onFocus={() => addressSuggestions.length > 0 && setShowAddressSuggestions(true)}
                  />
                  {showAddressSuggestions && (
                    <ScrollView
                      style={[styles.autocompleteDropdown, { maxHeight: 150 }]}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {addressSuggestions.map((item, index) => {
                        const { properties } = item;
                        const mainText = properties.street
                          ? `${properties.street}${properties.housenumber ? ' ' + properties.housenumber : ''}`
                          : properties.name;
                        const subText = `${properties.postcode || ''} ${properties.city || ''} ${properties.country || ''}`.trim();

                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => selectAddressSuggestion(item)}
                          >
                            <Text style={styles.suggestionText}>{mainText}</Text>
                            {subText ? (
                              <Text style={styles.suggestionSubtext}>{subText}</Text>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 0.48 }}>
                    <Text style={styles.inputLabel}>Postcode</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Bijv. 1030"
                      value={tempZipCode}
                      onChangeText={setTempZipCode}
                    />
                  </View>
                  <View style={{ flex: 0.48 }}>
                    <Text style={styles.inputLabel}>Stad</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Bijv. Brussel"
                      value={tempCity}
                      onChangeText={setTempCity}
                    />
                  </View>
                </View>

                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Over mij</Text>
                  <Text style={styles.charCount}>{tempAbout?.length || 0}/175</Text>
                </View>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Vertel iets over jezelf..."
                  value={tempAbout}
                  onChangeText={setTempAbout}
                  multiline={true}
                  numberOfLines={4}
                  maxLength={175}
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
                      <Ionicons name="image-outline" size={20} color={authColors.text} />
                      <Text style={styles.imagePickerButtonText}>Galerij</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                      <Ionicons name="camera-outline" size={20} color={authColors.text} />
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

      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.accent,
  },
  scrollView: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 0,
    backgroundColor: authColors.accent,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
    backgroundColor: authColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  squareButtonWide: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: authColors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  squareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.text,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: authColors.card,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: authColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: authColors.text,
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
    color: authColors.muted,
  },
  reviewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: authColors.muted,
    fontWeight: '500',
  },
  punt: {
    fontSize: 14,
    color: authColors.muted,
    opacity: 0.6,
  },
  aboutText: {
    fontSize: 14,
    color: authColors.text,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 5,
    paddingTop: 18,
    backgroundColor: authColors.background,
    marginHorizontal: -20,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 15,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: authColors.muted,
  },
  tabTextActive: {
    color: authColors.accent,
    fontWeight: '700',
  },
  tabButtonActive: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: authColors.accent,
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
    color: authColors.text,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: authColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: authColors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
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
    color: authColors.text,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: authColors.accent,
  },
  priceText: {
    fontSize: 14,
    color: authColors.muted,
  },
  reviewItem: {
    padding: 16,
    backgroundColor: authColors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.text,
  },
  reviewRating: {
    fontSize: 13,
    color: '#fbbf24',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: authColors.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: authColors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: authColors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: authColors.text,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: authColors.muted,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: authColors.text,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
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
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  levelOptionActive: {
    backgroundColor: authColors.accent,
    borderColor: authColors.accent,
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.muted,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: authColors.accent,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: authColors.muted,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 16,
  },
  tempImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: authColors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  imagePickerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: authColors.text,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
  autocompleteDropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 2000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
});
