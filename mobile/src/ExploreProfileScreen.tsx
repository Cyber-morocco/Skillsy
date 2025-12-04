import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ExploreProfileScreen: React.FC = () => {
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
              <Text style={styles.roundIconText}>⇪</Text>
            </TouchableOpacity>
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
});

export default ExploreProfileScreen;


