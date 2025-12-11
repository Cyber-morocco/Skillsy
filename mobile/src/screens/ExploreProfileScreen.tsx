import React, { useState } from 'react';
import {
  SafeAreaView  ,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ExploreProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vaardigheden' | 'reviews'>(
    'vaardigheden',
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Bovenste gekleurde balk */}
      <View style={styles.headerBackground} />

      <View style={styles.content}>
        {/* Navigatie-icoontjes */}
        <View style={styles.topRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.roundIconButton}>
            <Text style={styles.roundIconText}>←</Text>
          </TouchableOpacity>

          <View style={styles.topRightIcons}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.roundIconButton}
            
            >
              <Text style={styles.roundIconText}>♡</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profielfoto + naam + locatie + rating */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>TB</Text>
            </View>
          </View>

          <Text style={styles.nameText}>Thomas Berg</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Oud-Zuid, Amsterdam</Text>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>1.2 km</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingValue}>4.8</Text>
            <Text style={styles.ratingReviews}>(18 reviews)</Text>
          </View>
        </View>

        {/* Afspraakknop + bericht */}
        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Afspraak maken</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Bericht</Text>
          </TouchableOpacity>
        </View>

        {/* Over Thomas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Over Thomas</Text>
          <Text style={styles.cardBody}>
            Gepassioneerd leraar met jarenlange ervaring.
          </Text>
        </View>

        {/* Tabs: vaardigheden + reviews */}
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
          <Text style={styles.tabContentText}>
            {activeTab === 'vaardigheden'
              ? 'Hier komen de vaardigheden.'
              : 'Hier komen de reviews.'}
          </Text>
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
  roundIconText: {
    fontSize: 18,
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
  avatarInitials: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333752',
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


