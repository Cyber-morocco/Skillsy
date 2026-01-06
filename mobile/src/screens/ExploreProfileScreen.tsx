import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Review } from '../types';

interface ExploreProfileScreenProps {
  user?: {
    name?: string;
    displayName?: string;
    avatar?: string;
    photoURL?: string;
  };
  reviews?: Review[];
  onBack?: () => void;
  onMakeAppointment?: () => void;
  onSendMessage?: () => void;
}

const ExploreProfileScreen: React.FC<ExploreProfileScreenProps> = ({ user, reviews = [], onBack, onMakeAppointment, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<'vaardigheden' | 'reviews'>(
    'vaardigheden',
  );
  const [liked, setLiked] = useState(false);

  const displayUser = {
    name: user?.name || user?.displayName || 'Thomas Berg',
    avatar: user?.avatar || user?.photoURL || '',
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8'; 
    
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
            {displayUser.avatar ? (
              <Image source={{ uri: displayUser.avatar }} style={styles.avatarCircle} />
            ) : (
              <View style={styles.avatarCircle} />
            )}
          </View>

          <Text style={styles.nameText}>{displayUser.name}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Oud-Zuid, Amsterdam</Text>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>1.2 km</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingValue}>{averageRating}</Text>
            <Text style={styles.ratingReviews}>({reviews.length > 0 ? reviews.length : 18} reviews)</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryButton}
            onPress={onMakeAppointment}
          >
            <Text style={styles.primaryButtonText}>Afspraak maken</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.ghostButton}
            onPress={onSendMessage}
          >
            <Text style={styles.ghostButtonText}>Bericht zenden</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Over Thomas</Text>
          <Text style={styles.cardBody}>
            Gepassioneerd leraar met jarenlange ervaring.
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
            onPress={() => setActiveTab('reviews')}
            style={[
              styles.tabButton,
              activeTab === 'reviews' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.tabTextActive,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'vaardigheden' ? (
            <Text style={styles.tabContentText}>Hier komen de vaardigheden.</Text>
          ) : (
            <View>
              {sortedReviews.length > 0 ? (
                sortedReviews.map((review) => (
                  <View key={review.id} style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f5', paddingBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '600', color: '#24253d' }}>{review.reviewerName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#FCD34D', marginRight: 2 }}>{review.rating.toFixed(1)}</Text>
                        <Text style={{ fontSize: 13, color: '#FCD34D' }}>★</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                      {review.createdAt.toLocaleDateString()}
                    </Text>
                    <View style={{ gap: 4 }}>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>• Uitleg: {review.questions.q1}/5</Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>• Afspraken: {review.questions.q2}/5</Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>• Samenwerking: {review.questions.q3}/5</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.tabContentText}>Nog geen nieuwe reviews.</Text>
              )}
            </View>
          )}
        </View>


      </View>
    </SafeAreaView>
  );
};

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f9',
  },
  headerBackground: {
    height: 180,
    backgroundColor: '#b832ff',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#f0f0f5',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#24253d',
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
    color: '#6b6c80',
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
    color: '#24253d',
    marginRight: 4,
  },
  ratingReviews: {
    fontSize: 12,
    color: '#6b6c80',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7c2cff',
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
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2f3042',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    color: '#666778',
    lineHeight: 18,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  tabButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#f0f0f5',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#e8e1ff',
    borderWidth: 1,
    borderColor: '#7c2cff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a4b63',
  },
  tabTextActive: {
    color: '#7c2cff',
  },
  tabContent: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tabContentText: {
    fontSize: 13,
    color: '#4a4b63',
  },
});

export default ExploreProfileScreen;
