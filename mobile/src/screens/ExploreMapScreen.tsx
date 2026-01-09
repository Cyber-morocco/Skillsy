import React from 'react';
import { StatusBar, View, TouchableOpacity, ScrollView, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ExploreSearchBar } from '../features/explore/ExploreSearchBar';
import { FiltersBar } from '../features/explore/FiltersBar';
import { MapViewLeaflet } from './logic/MapViewLeaflet';
import { useExploreMap } from './logic/useExploreMap';
import { exploreMapStyles as styles } from '../styles/exploreMapStyles';
import { Talent } from '../types';

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
    skillSearch,
    toggleSearchType,
    userLocation,
    userLearnSkills,
    viewMode,
    profileReady,
  } = useExploreMap();

  const filtersActive = (selectedDistance !== null) || (selectedCategories.length > 0) || (Boolean(skillSearch && skillSearch.trim().length > 0));

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
        onToggleSearchType={toggleSearchType}
        onClear={resetSearch}
      />

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
                <Image source={{ uri: talent.avatar }} style={styles.talentAvatar} />
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