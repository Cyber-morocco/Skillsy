import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DiscoverScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Ontdek talenten</Text>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.iconText}>☰</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonOutline}>
                <Text style={styles.iconText}>📍</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Zoek vaardigheden..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipRow}>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>5 km</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}>
              <Text style={[styles.chipText, styles.chipTextActive]}>Alle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Talen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Muziek</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar} />

              <View style={styles.cardHeaderText}>
                <View style={styles.cardHeaderTopRow}>
                  <Text style={styles.cardName}>Emma Janssen</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingScore}>4.9</Text>
                    <Text style={styles.ratingCount}>(23)</Text>
                  </View>
                </View>

                <View style={styles.cardLocationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>Centrum, Amsterdam</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.distanceText}>0.8 km</Text>
                </View>

                <View style={styles.skillsSection}>
                  <Text style={styles.skillsLabel}>Kan aanleren:</Text>
                  <View style={styles.skillsChipsRow}>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Frans</Text>
                    </View>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Koken</Text>
                    </View>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Yoga</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.priceAndSwap}>
                    <Text style={styles.priceText}>€25/uur</Text>
                    <View style={styles.swapPill}>
                      <Text style={styles.swapPillText}>Ruil mogelijk</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>Bekijk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar} />

              <View style={styles.cardHeaderText}>
                <View style={styles.cardHeaderTopRow}>
                  <Text style={styles.cardName}>Sara de Vries</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingScore}>5.0</Text>
                    <Text style={styles.ratingCount}>(31)</Text>
                  </View>
                </View>

                <View style={styles.cardLocationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>De Pijp, Amsterdam</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.distanceText}>1.5 km</Text>
                </View>

                <View style={styles.skillsSection}>
                  <Text style={styles.skillsLabel}>Kan aanleren:</Text>
                  <View style={styles.skillsChipsRow}>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Timmeren</Text>
                    </View>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Tuinieren</Text>
                    </View>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Nederlands</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.priceAndSwap}>
                    <Text style={styles.priceText}>€20/uur</Text>
                    <View style={styles.swapPill}>
                      <Text style={styles.swapPillText}>Ruil mogelijk</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>Bekijk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar} />

              <View style={styles.cardHeaderText}>
                <View style={styles.cardHeaderTopRow}>
                  <Text style={styles.cardName}>Mark Peters</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingScore}>4.7</Text>
                    <Text style={styles.ratingCount}>(15)</Text>
                  </View>
                </View>

                <View style={styles.cardLocationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>Oost, Amsterdam</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.distanceText}>2.1 km</Text>
                </View>

                <View style={styles.skillsSection}>
                  <Text style={styles.skillsLabel}>Kan aanleren:</Text>
                  <View style={styles.skillsChipsRow}>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Gitaar</Text>
                    </View>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Muziektheorie</Text>
                    </View>
                    <View style={styles.skillPill}>
                      <Text style={styles.skillPillText}>Photoshop</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.priceAndSwap}>
                    <Text style={styles.priceText}>€35/uur</Text>
                    <View style={styles.swapPill}>
                      <Text style={styles.swapPillText}>Ruil mogelijk</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>Bekijk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  chip: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#020116',
  },
  chipText: {
    fontSize: 14,
    color: '#020617',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#020617',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#020116',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonOutline: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    color: '#020617',
  },
  card: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#020617',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: '#FACC15',
    marginRight: 4,
  },
  ratingScore: {
    fontSize: 14,
    color: '#020617',
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 4,
    color: '#6B7280',
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
  },
  bullet: {
    marginHorizontal: 4,
    color: '#6B7280',
  },
  distanceText: {
    fontSize: 14,
    color: '#4B5563',
  },
  skillsSection: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  skillsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillPill: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  skillPillText: {
    fontSize: 12,
    color: '#7C3AED',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceAndSwap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    color: '#020617',
    marginRight: 8,
  },
  swapPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  swapPillText: {
    fontSize: 12,
    color: '#15803D',
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#020116',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default DiscoverScreen;

