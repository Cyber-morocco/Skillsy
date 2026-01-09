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
}

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
}) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleSelectType = (type: SearchType) => {
    onSelectSearchType(type);
    setShowTypeMenu(false);
  };

  return (
    <View style={styles.header}>
      <View style={{ position: 'relative' }}>
        <TouchableOpacity style={styles.searchTypeToggleButton} onPress={() => setShowTypeMenu((prev) => !prev)}>
          <MaterialCommunityIcons name={searchType === 'skill' ? 'star-outline' : 'map-marker'} size={20} color="#fff" />
        </TouchableOpacity>
        {showTypeMenu && (
          <View
            style={{
              position: 'absolute',
              top: 44,
              left: 0,
              backgroundColor: '#0f172a',
              borderRadius: 10,
              paddingVertical: 6,
              paddingHorizontal: 8,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              elevation: 12,
              gap: 6,
              minWidth: 150,
              zIndex: 50,
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}
              onPress={() => handleSelectType('skill')}
            >
              <MaterialCommunityIcons name="star-outline" size={18} color="#e0e7ff" />
              <Text style={{ color: '#e0e7ff', fontSize: 14 }}>zoek skill</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}
              onPress={() => handleSelectType('address')}
            >
              <MaterialCommunityIcons name="map-marker" size={18} color="#e0e7ff" />
              <Text style={{ color: '#e0e7ff', fontSize: 14 }}>zoek locatie</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Zoek hier voor..."
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
};
