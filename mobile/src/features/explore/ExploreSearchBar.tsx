import React, { useState } from 'react';
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
  onSelectSearchType: (type: SearchType) => void;
  onClear: () => void;
  onToggleFilters: () => void;
  filtersActive: boolean;
  onSearchBarFocus?: () => void;
  onSearchBarBlur?: () => void;
  headerRight?: React.ReactNode;
}

const getPlaceholder = (searchType: SearchType): string => {
  return searchType === 'address' ? 'Zoek locatie...' : 'Zoek skill...';
};

export const ExploreSearchBar: React.FC<ExploreSearchBarProps> = ({
  searchQuery,
  searchType,
  isSearching,
  onChangeQuery,
  onSubmit,
  onSelectSearchType,
  onClear,
  onToggleFilters,
  filtersActive,
  onSearchBarFocus,
  onSearchBarBlur,
  headerRight,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder={getPlaceholder(searchType)}
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSubmit}
          onFocus={onSearchBarFocus}
          onBlur={onSearchBarBlur}
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
      {headerRight}
    </View>
  );
};
