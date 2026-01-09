import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  subscribeToOtherUserProfile,
  subscribeToOtherUserSkills,
  subscribeToOtherUserReviews,
  subscribeToOtherUserLearnSkills
} from '../services/userService';
import { UserProfile, Skill, Review, LearnSkill } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Separate component for video item to avoid hook violation
const VideoItem: React.FC<{ url: string; title: string; description: string }> = ({ url, title, description }) => {
  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        allowsFullscreen
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{title}</Text>
        {description ? <Text style={styles.videoDescription}>{description}</Text> : null}
      </View>
    </View>
  );
};

const colors = {
  background: '#050816',
  card: '#101936',
  primary: '#7C3AED',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: 'rgba(148, 163, 184, 0.25)',
  accent: '#7C3AED',
};

interface ExploreProfileScreenProps {
  userId: string;
  onBack?: () => void;
  onMakeAppointment?: () => void;
  onSendMessage?: () => void;
}

const ExploreProfileScreen: React.FC<ExploreProfileScreenProps> = ({ userId, onBack, onMakeAppointment, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<'vaardigheden' | 'wilLeren' | 'videos'>('vaardigheden');
  const [liked, setLiked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<LearnSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const unsubscribeProfile = subscribeToOtherUserProfile(userId, (fetchedProfile) => {
      setProfile(fetchedProfile);
    });

    const unsubscribeSkills = subscribeToOtherUserSkills(userId, (fetchedSkills) => {
      setSkills(fetchedSkills);
    });

    const unsubscribeLearnSkills = subscribeToOtherUserLearnSkills(userId, (fetchedLearnSkills) => {
      setLearnSkills(fetchedLearnSkills);
    });

    const unsubscribeReviews = subscribeToOtherUserReviews(userId, (fetchedReviews) => {
      setReviews(fetchedReviews);
      setLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeSkills();
      unsubscribeLearnSkills();
      unsubscribeReviews();
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayName = profile?.displayName || 'Laden...';
  const avatar = profile?.photoURL || '';
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerBackground} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.roundIconButton} onPress={onBack}>
            <Text style={styles.roundIconText}>←</Text>
          </TouchableOpacity>

          <View style={styles.topRightIcons}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.roundIconButton,
                liked && styles.roundIconButtonLiked,
              ]}
              onPress={() => setLiked((prev) => !prev)}
            >
              <Text
                style={[
                  styles.roundIconText,
                  liked && styles.roundIconTextLiked,
                ]}
              >
                {liked ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarCircle} />
            ) : (
              <View style={styles.avatarCircle} />
            )}
          </View>

          <Text style={styles.nameText}>{displayName}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{profile?.location?.city || 'Locatie onbekend'}</Text>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>-- km</Text>
          </View>

          {reviews.length >= 5 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingValue}>{averageRating}</Text>
              <Text style={styles.ratingReviews}>({reviews.length} reviews)</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryButton}
            onPress={onSendMessage}
          >
            <Text style={styles.primaryButtonText}>Match</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Over {displayName}</Text>
          <Text style={styles.cardBody}>
            {profile?.bio || 'Geen biografie beschikbaar.'}
          </Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setActiveTab('vaardigheden')}
            style={[
              styles.tabButton,
              activeTab === 'vaardigheden' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'vaardigheden' && styles.tabTextActive,
              ]}
            >
              Vaardigheden
            </Text>
          </TouchableOpacity>



          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setActiveTab('wilLeren')}
            style={[
              styles.tabButton,
              activeTab === 'wilLeren' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'wilLeren' && styles.tabTextActive,
              ]}
            >
              Wil leren
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setActiveTab('videos')}
            style={[
              styles.tabButton,
              activeTab === 'videos' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'videos' && styles.tabTextActive,
              ]}
            >
              Video's
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.tabContent}>
          {activeTab === 'vaardigheden' ? (
            skills.length > 0 ? (
              skills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <View style={styles.skillMain}>
                    <Text style={styles.skillName}>{skill.subject}</Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{skill.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.priceText}>{skill.price}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Geen vaardigheden opgegeven.</Text>
            )
          ) : activeTab === 'wilLeren' ? (
            learnSkills.length > 0 ? (
              learnSkills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <View style={styles.skillMain}>
                    <Text style={styles.skillName}>{skill.subject}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Geen leerdoelen opgegeven.</Text>
            )

          ) : (
            profile?.promoVideos && profile.promoVideos.some(v => typeof v === 'string' ? !!v : !!v?.url) ? (
              profile.promoVideos.map((videoEntry, index) => {
                const url = typeof videoEntry === 'string' ? videoEntry : (videoEntry?.url || '');
                const title = typeof videoEntry === 'string' ? `Promo video ${index + 1}` : (videoEntry?.title || `Promo video ${index + 1}`);
                const description = typeof videoEntry === 'string' ? '' : (videoEntry?.description || '');

                if (!url) return null;

                return (
                  <VideoItem
                    key={index}
                    url={url}
                    title={title}
                    description={description}
                  />
                );
              })
            ) : (
              <Text style={styles.emptyText}>Geen video's beschikbaar.</Text>
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBackground: {
    height: 180,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    marginTop: -140,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: 10,
  } as const,
  roundIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  roundIconButtonLiked: {
    backgroundColor: '#ffe5ec',
  },
  roundIconText: {
    fontSize: 18,
    color: colors.text,
  },
  roundIconTextLiked: {
    color: '#e0245e',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 24,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
    fontSize: 13,
  },
  locationText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  locationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9c9db0',
    marginHorizontal: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  ratingReviews: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  ghostButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d7d7e3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  ghostButtonText: {
    color: '#4a4b63',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    marginTop: 12,
    gap: 12,
  },
  skillItem: {
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
  },
  priceText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  reviewItem: {
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewRating: {
    fontSize: 13,
    color: '#fbbf24',
  },
  reviewComment: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  videoContainer: {
    marginBottom: 20,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  videoInfo: {
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});

export default ExploreProfileScreen;
