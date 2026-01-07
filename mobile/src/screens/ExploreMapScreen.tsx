import React from 'react';
import { StatusBar, View, TouchableOpacity, ScrollView, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ExploreSearchBar } from '../features/explore/ExploreSearchBar';
import { FiltersBar } from '../features/explore/FiltersBar';
import { MapViewLeaflet } from './logic/MapViewLeaflet';
import { TalentList } from './logic/TalentList';
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
    viewMode,
  } = useExploreMap();

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
            <MapViewLeaflet
              userLocation={userLocation}
              radiusKm={selectedDistance}
              talents={filteredTalents}
              focusTalent={focusTalent}
              onTalentClick={handleTalentPress}
            />

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
                  <Text style={styles.talentName}>{talent.name}</Text>
                  <Text style={styles.talentBio}>{talent.shortBio}</Text>
                  <View style={styles.skillsContainer}>
                    {(talent.skillNames || []).slice(0, 3).map((skill, index) => (
                      <Text key={index} style={styles.skillTag}>{skill}</Text>
                    ))}
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