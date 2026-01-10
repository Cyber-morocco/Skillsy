import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, View, TouchableOpacity, ScrollView, Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ExploreSearchBar } from '../features/explore/ExploreSearchBar';
import { FiltersBar } from '../features/explore/FiltersBar';
import { MapViewLeaflet } from './logic/MapViewLeaflet';
import { useExploreMap } from './logic/useExploreMap';
import { exploreMapStyles as styles } from '../styles/exploreMapStyles';
import { Talent } from '../types';
import { Avatar } from '../components/Avatar';

interface ExploreMapScreenProps {
  onViewProfile?: (user: any) => void;
}

export default function ExploreMapScreen({ onViewProfile }: ExploreMapScreenProps) {
  const {
    CATEGORY_OPTIONS,
    DISTANCE_OPTIONS,
    clearCategories,
    filteredTalents,
    focusTalent,
    handleCategorySelect,
    handleDistanceSelect,
    handleSearch,
    isSearching,
    locationPermissionGranted,
    requestLocationPermission,
    resetSearch,
    searchQuery,
    searchType,
    selectedCategories,
    selectedDistance,
    setSearchQuery,
    setViewMode,
    setSearchType,
    skillSearch,
    toggleSearchType,
    userLocation,
    userLearnSkills,
    viewMode,
    profileReady,
  } = useExploreMap();

  const [filtersVisible, setFiltersVisible] = useState<boolean>(false);
  const [searchBarFocused, setSearchBarFocused] = useState<boolean>(false);
  const sectionTabsAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;

  const filtersActive = (selectedDistance !== null) || (selectedCategories.length > 0) || (Boolean(skillSearch && skillSearch.trim().length > 0));

  useEffect(() => {
    if (viewMode !== 'list') {
      setFiltersVisible(false);
    }
  }, [viewMode]);

  useEffect(() => {
    // Switch to map view when location search is selected, to list when skill is selected
    if (searchType === 'address' && viewMode === 'list') {
      setViewMode('map');
    } else if (searchType === 'skill' && viewMode === 'map') {
      setViewMode('list');
    }
  }, [searchType]);

  useEffect(() => {
    // Animate section tabs appearance/disappearance
    const showSections = isSearching || viewMode === 'list' || searchBarFocused;
    
    if (showSections) {
      // Reset to 0, then animate to 1 for smooth entry
      sectionTabsAnim.setValue(0);
      Animated.timing(sectionTabsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate out
      Animated.timing(sectionTabsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isSearching, viewMode, searchBarFocused, sectionTabsAnim]);

  useEffect(() => {
    // Animate filters appearance/disappearance
    if (filtersVisible) {
      // Reset to 0, then animate to 1 for smooth entry
      filtersAnim.setValue(0);
      Animated.timing(filtersAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate out
      Animated.timing(filtersAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [filtersVisible, filtersAnim]);

  const toggleFiltersVisible = () => {
    const next = !filtersVisible;
    setFiltersVisible(next);
  };

  const handleTalentPress = (talentId: string) => {
    const talent = filteredTalents.find(t => t.id === talentId);
    if (talent && onViewProfile) {
      onViewProfile({
        uid: talent.userId,
        name: talent.name,
        avatar: talent.avatar
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ExploreSearchBar
        searchQuery={searchQuery}
        searchType={searchType}
        isSearching={isSearching}
        onChangeQuery={setSearchQuery}
        onSubmit={handleSearch}
        onSelectSearchType={setSearchType}
        onClear={resetSearch}
        onToggleFilters={toggleFiltersVisible}
        filtersActive={filtersActive}
        onSearchBarFocus={() => setSearchBarFocused(true)}
        onSearchBarBlur={() => setSearchBarFocused(false)}
      />

      {filtersVisible && (
        <Animated.View
          style={{
            opacity: filtersAnim,
            transform: [
              {
                translateY: filtersAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          }}
        >
          <FiltersBar
            selectedDistance={selectedDistance}
            onSelectDistance={handleDistanceSelect}
            selectedCategories={selectedCategories}
            onToggleCategory={handleCategorySelect}
            onClearCategories={clearCategories}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            distanceOptions={DISTANCE_OPTIONS}
            categoryOptions={CATEGORY_OPTIONS}
          />
        </Animated.View>
      )}

      {(isSearching || viewMode === 'list' || searchBarFocused) && (
        <Animated.View
          style={[
            styles.sectionTabsContainer,
            {
              opacity: sectionTabsAnim,
              transform: [
                {
                  translateY: sectionTabsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sectionTab,
              searchType === 'address' && styles.sectionTabActive,
            ]}
            onPress={() => setSearchType('address')}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={searchType === 'address' ? '#10b981' : '#94A3B8'}
            />
            <Text
              style={[
                styles.sectionTabText,
                searchType === 'address' && styles.sectionTabTextActive,
              ]}
            >
              Locatie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sectionTab,
              searchType === 'skill' && styles.sectionTabActive,
            ]}
            onPress={() => setSearchType('skill')}
          >
            <MaterialCommunityIcons
              name="star-outline"
              size={20}
              color={searchType === 'skill' ? '#10b981' : '#94A3B8'}
            />
            <Text
              style={[
                styles.sectionTabText,
                searchType === 'skill' && styles.sectionTabTextActive,
              ]}
            >
              Skill
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.mapContainer}>
        {viewMode === 'map' ? (
          <View style={{ flex: 1 }}>
            {profileReady ? (
              <MapViewLeaflet
                userLocation={userLocation}
                radiusKm={selectedDistance}
                talents={filteredTalents}
                filtersActive={filtersActive}
                focusTalent={focusTalent}
                onTalentClick={handleTalentPress}
                onSwitchToList={() => setViewMode('list')}
              />
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <TouchableOpacity
              style={styles.locationButton}
              onPress={requestLocationPermission}
              activeOpacity={0.7}
            >
              <Ionicons
                name={locationPermissionGranted ? 'locate' : 'locate-outline'}
                size={28}
                color="#FFFFFF"
              />
              {locationPermissionGranted && (
                <View style={styles.activeLocationDot} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.listContainer}>
            {filteredTalents.map((talent: Talent) => (
              <TouchableOpacity
                key={talent.id}
                style={styles.talentCard}
                onPress={() => handleTalentPress(talent.id)}
              >
                <Avatar
                  uri={talent.avatar}
                  name={talent.name}
                  size={60}
                  style={styles.talentAvatar}
                />
                <View style={styles.talentInfo}>
                  <View style={styles.talentHeader}>
                    <Text style={styles.talentName}>{talent.name}</Text>
                    {talent.averageRating && talent.reviewCount && talent.reviewCount >= 5 ? (
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingIcon}>⭐</Text>
                        <Text style={styles.ratingText}>{talent.averageRating.toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>
                  {talent.location?.city && (
                    <Text style={styles.talentLocation}>📍 {talent.location.city}</Text>
                  )}
                  <View style={styles.skillsContainer}>
                    {(talent.skillsWithPrices || []).slice(0, 2).map((skill, index) => {
                      const isMatch = userLearnSkills.some(ls => ls.subject.toLowerCase() === skill.subject.toLowerCase());
                      return (
                        <View key={index} style={[styles.skillBadge, isMatch && styles.skillBadgeMatch]}>
                          {isMatch && <Text style={styles.matchIndicator}>✓</Text>}
                          <Text style={styles.skillText}>{skill.subject}</Text>
                          <Text style={styles.skillDivider}>·</Text>
                          <Text style={styles.priceText}>{skill.price || 'Ruilen'}</Text>
                        </View>
                      );
                    })}
                    {(talent.skillsWithPrices || []).length > 2 ? (
                      <View style={styles.moreSkillsBadge}>
                        <Text style={styles.moreSkillsText}>+{(talent.skillsWithPrices || []).length - 2} meer</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>{filteredTalents.length} talenten</Text>
        <Text style={styles.resultsSubtext}>
          {selectedDistance ? `${selectedDistance} km` : 'Alle'}
          {selectedCategories.length > 0 && ` · ${selectedCategories.length} cat.`}
          {skillSearch && ` · "${skillSearch}"`}
        </Text>
      </View>
    </SafeAreaView>
  );
}