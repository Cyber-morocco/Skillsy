import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { exploreMapStyles as styles } from '../../styles/exploreMapStyles';

type SearchType = 'skill' | 'address';

interface ExploreSearchBarProps {
  searchQuery: string;
  searchType: SearchType;
  isSearching: boolean;
  onChangeQuery: (text: string) => void;
  onSubmit: () => void;
  onToggleSearchType: () => void;
  onClear: () => void;
  onToggleFilters: () => void;
  filtersActive: boolean;
}

export const ExploreSearchBar: React.FC<ExploreSearchBarProps> = ({
  searchQuery,
  searchType,
  isSearching,
  onChangeQuery,
  onSubmit,
  onToggleSearchType,
  onClear,
  onToggleFilters,
  filtersActive,
}) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.searchTypeToggleButton} onPress={onToggleSearchType}>
      <MaterialCommunityIcons name={searchType === 'skill' ? 'star-outline' : 'map-marker'} size={20} color="#fff" />
    </TouchableOpacity>
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color="#94A3B8" />
      <TextInput
        style={styles.searchInput}
        placeholder={searchType === 'skill' ? 'Zoek skill (bv. Java)' : 'Zoek plaats (bv. Amsterdam)'}
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={onChangeQuery}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {/* Removed clear (close) and submit (arrow) buttons as requested */}
      {isSearching && (
        <View style={styles.searchButton}>
          <Text style={{ color: '#7c3aed' }}>...</Text>
        </View>
      )}
      <TouchableOpacity onPress={onToggleFilters} style={styles.searchButton}>
        <MaterialCommunityIcons
          name="filter-variant"
          size={20}
          color={filtersActive ? '#10b981' : '#7c3aed'}
        />
      </TouchableOpacity>
    </View>
  </View>
);
