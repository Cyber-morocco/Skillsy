import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExploreSearchBar } from '../features/explore/ExploreSearchBar';
import { FiltersBar } from '../features/explore/FiltersBar';
import { MapViewLeaflet } from './logic/MapViewLeaflet';
import { TalentList } from './logic/TalentList';
import { useExploreMap } from './logic/useExploreMap';
import { exploreMapStyles as styles } from '../styles/exploreMapStyles';

export default function ExploreMapScreen() {
  const {
    CATEGORY_OPTIONS: categoryOptions,
    DISTANCE_OPTIONS: distanceOptions,
    clearCategories,
    filteredTalents,
    focusTalent,
    handleCategorySelect,
    handleDistanceSelect,
    handleSearch,
    isSearching,
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

  const handleTalentPress = (talentId: number) => {
    console.log('Talent pressed:', talentId);
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
        distanceOptions={distanceOptions}
        categoryOptions={categoryOptions}
      />

      {viewMode === 'map' ? (
        <MapViewLeaflet
          userLocation={userLocation}
          radiusKm={selectedDistance}
          talents={filteredTalents}
          focusTalent={focusTalent}
          onTalentClick={handleTalentPress}
        />
      ) : (
        <TalentList talents={filteredTalents} onPress={handleTalentPress} />
      )}

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