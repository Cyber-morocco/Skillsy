import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView, Alert, ActivityIndicator, Image, Platform, Linking, KeyboardAvoidingView } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
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
import { FullScreenVideoModal } from '../components/FullScreenVideoModal';

interface ProfileScreenProps {
  onNavigate?: (screen: 'availability') => void;
}

const ProfileVideoThumbnail: React.FC<{ url: string }> = ({ url }) => {
  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
    player.muted = true;
  });

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

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

  // Player State
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<{
    url: string;
    title: string;
    description: string;
  } | null>(null);

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
      Alert.alert('Fout', 'Sorry, we hebben toestemming nodig om de camera te gebruiken! Geef toestemming in de instellingen van jouw telefoon.');
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

      {/* Top Bar for Actions */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Mijn Profiel</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* Profile Header Block */}
          <View style={styles.profileHeader}>
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
              <Ionicons name="location" size={14} color={authColors.accent} />
              <Text style={styles.locationText}>
                {userProfile?.location?.city || userProfile?.location?.address || 'Geen locatie'}
              </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : 'New'}
                </Text>
              </View>
              <View style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color={authColors.accent} />
                <Text style={styles.statText}>{reviews.length} reviews</Text>
              </View>
              <View style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={authColors.accent} />
                <Text style={styles.statText}>Lid sinds {formatDate(userProfile?.createdAt).split(' ').slice(-1)[0]}</Text>
              </View>
            </View>

            <View style={styles.bioContainer}>
              <Text style={styles.aboutText}>
                {userProfile?.bio || 'Vertel je buren wie je bent en wat je leuk vindt...'}
              </Text>
            </View>

            {/* Main Action Action (Agenda) */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.agendaButton} onPress={() => onNavigate?.('availability')}>
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.agendaButtonText}>Mijn beschikbaarheden</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* Floating Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            <TouchableOpacity onPress={() => setActiveTab('skills')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'skills' && styles.tabTextActive]}>Vaardigheden</Text>
              {activeTab === 'skills' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('wilLeren')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'wilLeren' && styles.tabTextActive]}>Wil Leren</Text>
              {activeTab === 'wilLeren' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('promoVideo')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'promoVideo' && styles.tabTextActive]}>Video's</Text>
              {activeTab === 'promoVideo' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('reviews')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>Reviews</Text>
              {activeTab === 'reviews' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </ScrollView>
        </View>


        {/* Dynamic Content Section */}
        {activeTab === 'skills' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mijn Skills</Text>
              <TouchableOpacity onPress={AddSkill} style={styles.addButton}>
                <Ionicons name="add" size={24} color={authColors.accent} />
              </TouchableOpacity>
            </View>

            {skills.map((skill) => {
              const catColor = ROOT_CATEGORIES.find(c => c.id === skill.rootId)?.color || authColors.accent;
              return (
                <View key={skill.id} style={styles.skillCard}>
                  <View style={styles.skillContent}>
                    <View style={[styles.colorDot, { backgroundColor: catColor }]} />
                    <View style={styles.skillInfo}>
                      <Text style={styles.skillSubject}>{skill.subject}</Text>
                      <View style={styles.skillBadge}>
                        <Text style={styles.skillLevel}>{skill.level}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteSkill(skill.id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
            {skills.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="construct-outline" size={40} color={authColors.muted} />
                <Text style={styles.emptyText}>Je hebt nog geen skills toegevoegd.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'wilLeren' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wil ik leren</Text>
              <TouchableOpacity onPress={AddLearnSkill} style={styles.addButton}>
                <Ionicons name="add" size={24} color={authColors.accent} />
              </TouchableOpacity>
            </View>
            {learnSkills.map((skill) => (
              <View key={skill.id} style={styles.skillCard}>
                <View style={styles.skillContent}>
                  <View style={[styles.colorDot, { backgroundColor: '#FBBF24' }]} />
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillSubject}>{skill.subject}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLearnSkill(skill.id)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
            {learnSkills.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="school-outline" size={40} color={authColors.muted} />
                <Text style={styles.emptyText}>Nog niets dat je wilt leren?</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'promoVideo' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Promo Video's</Text>
            </View>

            <View style={styles.videoGrid}>
              {[0, 1, 2].map((index) => {
                const videoEntry = userProfile?.promoVideos?.[index];
                const videoUrl = typeof videoEntry === 'string' ? videoEntry : (videoEntry?.url || '');
                const videoTitleVal = typeof videoEntry === 'string' ? '' : (videoEntry?.title || '');
                const videoDescVal = typeof videoEntry === 'string' ? '' : (videoEntry?.description || '');
                const hasVideo = !!videoUrl;

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (hasVideo) {
                        setPlayingVideo({
                          url: videoUrl,
                          title: videoTitleVal,
                          description: videoDescVal
                        });
                        setPlayerModalVisible(true);
                      } else {
                        handleVideoPicker(index);
                      }
                    }}
                    style={[styles.videoCard, !hasVideo && styles.videoPlaceholder]}
                  >
                    {hasVideo ? (
                      <View style={{ flex: 1, width: '100%', height: '100%' }}>
                        <ProfileVideoThumbnail url={videoUrl} />

                        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
                        </View>

                        {videoTitleVal ? (
                          <View style={{ position: 'absolute', bottom: 0, width: '100%', padding: 4, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                            <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{videoTitleVal}</Text>
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

                        <TouchableOpacity onPress={() => handleDeleteVideo(index)} style={{ position: 'absolute', top: 5, right: 5, padding: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 }}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Ionicons name="add" size={24} color="rgba(255,255,255,0.5)" />
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
              <Text style={styles.sectionTitle}>Reviews</Text>
            </View>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{review.fromName || 'Anoniem'}</Text>
                    <Text style={styles.reviewRating}>⭐ {review.rating.toFixed(1)}</Text>
                  </View>
                  {/* Add review content if available in schema */}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={40} color={authColors.muted} />
                <Text style={styles.emptyText}>Nog geen reviews.</Text>
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
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', alignItems: 'center' }}
              >
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
              </KeyboardAvoidingView>
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
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', alignItems: 'center' }}
              >
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
                    style={[styles.input, { height: 100, textAlignVertical: 'top', marginBottom: 8 }]}
                    placeholder="Korte beschrijving (max 100 tekens)..."
                    value={videoDescription}
                    onChangeText={setVideoDescription}
                    multiline={true}
                    numberOfLines={4}
                    maxLength={100}
                  />
                  <Text style={{ color: authColors.muted, fontSize: 12, marginBottom: 20, fontStyle: 'italic' }}>
                    Je kan max 3 video's toevoegen van max 3 minuten.
                  </Text>

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
              </KeyboardAvoidingView>
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
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', alignItems: 'center' }}
              >
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
              </KeyboardAvoidingView>
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
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ width: '100%', alignItems: 'center' }}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Profiel Bewerken</Text>

                  <ScrollView
                    style={{ maxHeight: '80%' }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.inputLabel}>Gebruikersnaam</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Gebruikersnaam..."
                      value={tempName}
                      onChangeText={setTempName}
                    />

                    <Text style={{ color: authColors.muted, fontSize: 13, marginBottom: 16, marginTop: 8 }}>
                      Enkel de stad zal gedeeld worden met andere gebruikers.
                    </Text>

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
                  </ScrollView>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Annuleren</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>Opslaan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </ScrollView>

      {/* Full Screen Player Modal */}
      {playingVideo && userProfile && (
        <FullScreenVideoModal
          visible={playerModalVisible}
          videoUrl={playingVideo.url}
          title={playingVideo.title}
          description={playingVideo.description}
          onClose={() => {
            setPlayerModalVisible(false);
            setPlayingVideo(null);
          }}
          userProfile={{
            name: userProfile.displayName,
            avatar: userProfile.photoURL || '',
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    paddingHorizontal: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    zIndex: 10,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: authColors.text,
  },
  topIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 16,
    elevation: 8,
    shadowColor: authColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  profileImage: {
    borderWidth: 4,
    borderColor: authColors.background,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: authColors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 26,
    fontWeight: '800',
    color: authColors.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    color: authColors.muted,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.muted,
  },
  bioContainer: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  aboutText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  agendaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: authColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  agendaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    marginBottom: 20,
    backgroundColor: authColors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tabItem: {
    marginRight: 24,
    paddingVertical: 14,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: authColors.muted,
  },
  tabTextActive: {
    color: authColors.text,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: authColors.accent,
    borderRadius: 2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: authColors.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: authColors.card,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skillContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  skillInfo: {
    flex: 1,
  },
  skillSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: authColors.text,
    marginBottom: 4,
  },
  skillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillLevel: {
    fontSize: 12,
    color: authColors.accent,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    opacity: 0.7,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 30,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    color: authColors.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
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
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: authColors.accent,
    alignItems: 'center',
    shadowColor: authColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: { color: authColors.muted, fontWeight: '600', fontSize: 16 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  // Autocomplete
  autocompleteDropdown: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 2000,
    elevation: 5,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  suggestionText: { color: '#fff', fontWeight: '600' },
  suggestionSubtext: { color: '#94a3b8', fontSize: 12 },

  // Video Grid
  videoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  videoCard: {
    flex: 1,
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  videoPlaceholder: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    opacity: 0.6,
  },
  emptyText: {
    color: authColors.muted,
    marginTop: 12,
    fontSize: 15,
  },

  // Image Edit
  imageEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    justifyContent: 'center',
  },
  tempImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: authColors.accent,
  },
  tempImage: { width: '100%', height: '100%' },
  imageButtons: { gap: 10 },
  imagePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  imagePickerButtonText: { color: '#fff', fontWeight: '600' },

  // Level Selector
  levelSelector: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  levelOptionActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: authColors.accent,
  },
  levelOptionText: { color: authColors.muted, fontWeight: '600' },
  levelOptionTextActive: { color: authColors.accent },

  // Review Items
  reviewItem: {
    backgroundColor: authColors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewName: { color: '#fff', fontWeight: '700' },
  reviewRating: { color: '#FBBF24', fontWeight: '700' },
});
