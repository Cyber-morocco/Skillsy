import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { mockTalents, Talent } from '../mockdummies/markers';

const { width, height } = Dimensions.get('window');

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const DISTANCE_OPTIONS = [1, 2, 5, 10, 15, 25, 50, 100];

const CATEGORY_OPTIONS = [
  'Dans',
  'Muziek',
  'Wiskunde',
  'Taal',
  'Schilderkunst',
  'Fotografie',
  'Programmeren',
  'Design',
  'Fitness',
  'Yoga',
  'Koken',
  'Gitaar',
  'Schrijven',
  'Theaterkunst',
  'Marketing',
  'Engels',
];

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function ExploreMapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<Location>({ lat: 52.3676, lng: 4.9041 });
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'skill' | 'address'>('skill');
  const webViewRef = useRef<WebView>(null);
  
  const allTalents = mockTalents;

  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<Location | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'Skillsy-App/1.0' } }
      );
      const data: GeocodingResult[] = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Unified search: try geocoding; if it fails, treat as skill search
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    if (searchType === 'address') {
      const result = await geocodeAddress(q);
      setIsSearching(false);

      if (result) {
        // It's a location search
        setUserLocation(result);
        // Keep the query visible in the input
        if (webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({
              type: 'updateLocation',
              location: result,
              radiusKm: selectedDistance,
              talents: filteredTalents
            })
          );
        }
      }
    } else {
      // Treat as skill search term: filter and focus on nearest matching talent
      const searchTerm = q.toLowerCase().trim();
      const matches = allTalents.filter((talent: Talent) => {
        // Distance filter
        if (selectedDistance !== null) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            talent.lat,
            talent.lng
          );
          if (distance > selectedDistance) return false;
        }
        // Category filter
        if (selectedCategories.length > 0) {
          const talentSkillNames = talent.skills.map((s: { name: string }) => s.name.toLowerCase());
          const hasMatchingCategory = selectedCategories.some(category =>
            talentSkillNames.some((skill: string) => skill.includes(category.toLowerCase()))
          );
          if (!hasMatchingCategory) return false;
        }
        // Skill match
        return talent.skills.some((skill: { name: string }) =>
          skill.name.toLowerCase().includes(searchTerm)
        );
      });

      setSkillSearch(q);
      setIsSearching(false);

      if (webViewRef.current) {
        // Update markers immediately with matches
        webViewRef.current.postMessage(
          JSON.stringify({
            type: 'updateRadius',
            radiusKm: selectedDistance,
            talents: matches
          })
        );

        // Focus map on nearest matching talent
        if (matches.length > 0) {
          let nearest = matches[0];
          let minDist = calculateDistance(userLocation.lat, userLocation.lng, nearest.lat, nearest.lng);
          for (let i = 1; i < matches.length; i++) {
            const d = calculateDistance(userLocation.lat, userLocation.lng, matches[i].lat, matches[i].lng);
            if (d < minDist) {
              minDist = d;
              nearest = matches[i];
            }
          }
          webViewRef.current.postMessage(
            JSON.stringify({
              type: 'focusTalent',
              talentId: nearest.id,
              lat: nearest.lat,
              lng: nearest.lng
            })
          );
        }
      }
    }
  };

  // Filter talents based on all filters (distance, categories, and skill search)
  const filteredTalents = allTalents.filter((talent: Talent) => {
    // Distance filter
    if (selectedDistance !== null) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        talent.lat,
        talent.lng
      );
      if (distance > selectedDistance) return false;
    }
    
    // Category filter (any selected category must match)
    if (selectedCategories.length > 0) {
      const talentSkillNames = talent.skills.map((s: { name: string }) => s.name.toLowerCase());
      const hasMatchingCategory = selectedCategories.some(category => 
        talentSkillNames.some((skill: string) => skill.includes(category.toLowerCase()))
      );
      if (!hasMatchingCategory) return false;
    }
    
    // Skill search filter
    if (skillSearch.trim()) {
      const searchTerm = skillSearch.toLowerCase().trim();
      const hasMatchingSkill = talent.skills.some((skill: { name: string }) => 
        skill.name.toLowerCase().includes(searchTerm)
      );
      if (!hasMatchingSkill) return false;
    }
    
    return true;
  });

  // Update map when filtered talents or filters change
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ 
        type: 'updateRadius', 
        radiusKm: selectedDistance,
        talents: filteredTalents
      }));
    }
  }, [selectedDistance, selectedCategories, skillSearch, filteredTalents]);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
          .custom-marker { 
            width: 50px; 
            height: 50px; 
            border-radius: 50%; 
            border: 3px solid #7c3aed;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .custom-marker img { 
            width: 100%; 
            height: 100%; 
            border-radius: 50%;
          }
          .user-marker {
            width: 40px;
            height: 40px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .radius-circle {
            fill: none;
            stroke: #7c3aed;
            stroke-width: 2;
            stroke-dasharray: 5, 5;
            opacity: 0.3;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            let centerLat = ${userLocation.lat};
            let centerLng = ${userLocation.lng};
            let radiusKm = 5;
            let radiusCircle = null;
            let talentMarkers = {};
            
            const map = L.map('map').setView([centerLat, centerLng], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap',
              maxZoom: 19
            }).addTo(map);

            // User location marker
            const userMarker = L.circleMarker([centerLat, centerLng], {
              radius: 8,
              fillColor: '#10b981',
              color: 'white',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map);
            userMarker.bindPopup('<strong>You</strong>');

            // Initial radius circle
            radiusCircle = L.circle([centerLat, centerLng], {
              radius: radiusKm * 1000,
              color: '#7c3aed',
              fillColor: '#7c3aed',
              fillOpacity: 0.05,
              weight: 2,
              dashArray: '5, 5'
            }).addTo(map);

            // Function to add talent markers
            const addTalentMarkers = (talents) => {
              // Remove old markers
              Object.values(talentMarkers).forEach(marker => {
                map.removeLayer(marker);
              });
              talentMarkers = {};

              const colors = ['#a78bfa', '#f472b6', '#60a5fa', '#fbbf24'];
              
              talents.forEach((talent, index) => {
                const customIcon = L.divIcon({
                  html: \`<div style="width: 50px; height: 50px; border-radius: 50%; border: 3px solid \${colors[index % 4]}; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"><img src="\${talent.avatar}" style="width: 100%; height: 100%; border-radius: 50%;"/></div>\`,
                  iconSize: [50, 50],
                  className: 'custom-marker'
                });

                const marker = L.marker([talent.lat, talent.lng], { icon: customIcon }).addTo(map);
                
                const popupContent = \`
                  <div style="font-family: Arial; padding: 10px; text-align: center; min-width: 150px;">
                    <img src="\${talent.avatar}" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 8px;"/>
                    <strong style="display: block; margin-bottom: 4px;">\${talent.name}</strong>
                    <small style="color: #666;">\${talent.shortBio}</small>
                  </div>
                \`;
                
                marker.bindPopup(popupContent);
                marker.on('click', () => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'talentClick', talentId: talent.id }));
                });
                
                talentMarkers[talent.id] = marker;
              });
            };

            // Initial talent markers
            const initialTalents = ${JSON.stringify(filteredTalents)};
            addTalentMarkers(initialTalents);

            // Handle messages from React Native
            document.addEventListener('message', (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'updateRadius') {
                  radiusKm = data.radiusKm;
                  if (radiusCircle) {
                    map.removeLayer(radiusCircle);
                  }
                  radiusCircle = L.circle([centerLat, centerLng], {
                    radius: radiusKm * 1000,
                    color: '#7c3aed',
                    fillColor: '#7c3aed',
                    fillOpacity: 0.05,
                    weight: 2,
                    dashArray: '5, 5'
                  }).addTo(map);

                  // Update talent markers
                  if (data.talents) {
                    addTalentMarkers(data.talents);
                  }
                }
                if (data.type === 'updateLocation') {
                  const { location, radiusKm: r, talents } = data;
                  centerLat = location.lat;
                  centerLng = location.lng;
                  map.setView([location.lat, location.lng], 13);
                  userMarker.setLatLng([location.lat, location.lng]);
                  
                  if (radiusCircle) {
                    map.removeLayer(radiusCircle);
                  }
                  radiusCircle = L.circle([location.lat, location.lng], {
                    radius: r * 1000,
                    color: '#7c3aed',
                    fillColor: '#7c3aed',
                    fillOpacity: 0.05,
                    weight: 2,
                    dashArray: '5, 5'
                  }).addTo(map);
                  
                  if (talents) {
                    addTalentMarkers(talents);
                  }
                }
                if (data.type === 'focusTalent') {
                  const { talentId, lat, lng } = data;
                  map.setView([lat, lng], 14);
                  if (talentMarkers[talentId]) {
                    talentMarkers[talentId].openPopup();
                  }
                }
              } catch (e) {
                console.error('Error handling message:', e);
              }
            });
            
          } catch (error) {
            document.body.innerHTML = '<div style="padding: 20px; color: red;">' + error.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  // Handle distance button press
  const handleDistancePress = (distance: number) => {
    if (selectedDistance === distance) {
      // If clicking the same button, deselect it
      setSelectedDistance(null);
    } else {
      // Otherwise, select the new distance
      setSelectedDistance(distance);
    }
  };

  // Handle distance selection
  const handleDistanceSelect = (distance: number) => {
    if (selectedDistance === distance) {
      // Deselect if clicking the same distance
      setSelectedDistance(null);
    } else {
      setSelectedDistance(distance);
    }
    setShowDistanceDropdown(false);
  };

  // Handle category selection (multiple selections allowed)
  const handleCategorySelect = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Remove if already selected
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      // Add if not selected
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Handle talent card press (for list view)
  const handleTalentPress = (talentId: number) => {
    // Navigate to talent profile or show details
    console.log('Talent pressed:', talentId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Skill/Address Toggle Button */}
        <TouchableOpacity
          style={styles.searchTypeToggleButton}
          onPress={() => setSearchType(searchType === 'skill' ? 'address' : 'skill')}
        >
          <MaterialCommunityIcons 
            name={searchType === 'skill' ? 'star-outline' : 'map-marker'} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'skill' ? 'Zoek skill (bv. Java)' : 'Zoek plaats (bv. Amsterdam)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSkillSearch(''); }} style={styles.searchButton}>
              <Ionicons name="close" size={18} color="#7c3aed" />
            </TouchableOpacity>
          )}
          {!isSearching && (
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Ionicons name="arrow-forward" size={18} color="#7c3aed" />
            </TouchableOpacity>
          )}
          {isSearching && (
            <View style={styles.searchButton}>
              <Text style={{ color: '#7c3aed' }}>...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterButtonsContainer}>
          {/* Distance Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedDistance !== null && styles.filterButtonActive
            ]}
            onPress={() => setShowDistanceDropdown(!showDistanceDropdown)}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={16} color={selectedDistance !== null ? '#fff' : '#7c3aed'} />
            <Text
              style={[
                styles.filterButtonText,
                selectedDistance !== null && styles.filterButtonTextActive
              ]}
            >
              {selectedDistance ? `${selectedDistance} km` : 'Afstand'}
            </Text>
            <Ionicons
              name={showDistanceDropdown ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={selectedDistance !== null ? '#fff' : '#7c3aed'}
            />
          </TouchableOpacity>

          {/* Category Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategories.length > 0 && styles.filterButtonActive
            ]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <MaterialCommunityIcons name="tag" size={16} color={selectedCategories.length > 0 ? '#fff' : '#7c3aed'} />
            <Text
              style={[
                styles.filterButtonText,
                selectedCategories.length > 0 && styles.filterButtonTextActive
              ]}
            >
              {selectedCategories.length > 0 ? `${selectedCategories.length} cat.` : 'Categorie'}
            </Text>
            <Ionicons
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={selectedCategories.length > 0 ? '#fff' : '#7c3aed'}
            />
          </TouchableOpacity>

          {/* Map/List Toggle Button */}
          <TouchableOpacity
            style={styles.viewModeToggleButton}
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            <MaterialCommunityIcons
              name={viewMode === 'map' ? 'format-list-bulleted' : 'map'}
              size={18}
              color="#7c3aed"
            />
          </TouchableOpacity>
        </View>

        {/* Distance Dropdown */}
        {showDistanceDropdown && (
          <View style={[styles.dropdownContainer, { left: 16 }]}>
            {DISTANCE_OPTIONS.map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.dropdownOption,
                  selectedDistance === distance && styles.dropdownOptionActive
                ]}
                onPress={() => handleDistanceSelect(distance)}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedDistance === distance && styles.dropdownOptionTextActive
                  ]}
                >
                  {`${distance} km`}
                </Text>
                {selectedDistance === distance && (
                  <Ionicons name="checkmark" size={18} color="#7c3aed" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Dropdown */}
        {showCategoryDropdown && (
          <View style={[styles.dropdownContainer, { maxHeight: 300 }]}>
            <ScrollView scrollEnabled showsVerticalScrollIndicator={true}>
              {CATEGORY_OPTIONS.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.dropdownOption,
                    selectedCategories.includes(category) && styles.dropdownOptionActive
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedCategories.includes(category) && styles.dropdownOptionTextActive
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategories.includes(category) && (
                    <Ionicons name="checkmark" size={18} color="#7c3aed" />
                  )}
                </TouchableOpacity>
              ))}
              
              {/* Clear Filter Option */}
              {selectedCategories.length > 0 && (
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSelectedCategories([]);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>Alles wissen</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Close dropdowns when clicking outside */}
      {(showDistanceDropdown || showCategoryDropdown) && (
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowDistanceDropdown(false);
            setShowCategoryDropdown(false);
          }}
        />
      )}

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: mapHTML }}
            style={styles.map}
            onMessage={(event) => {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'talentClick') {
                console.log('Clicked talent:', data.talentId);
              }
            }}
          />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {filteredTalents.map((talent: Talent) => (
            <TouchableOpacity key={talent.id} style={styles.talentCard} onPress={() => handleTalentPress(talent.id)}>
              <Image source={{ uri: talent.avatar }} style={styles.talentAvatar} />
              <View style={styles.talentInfo}>
                <Text style={styles.talentName}>{talent.name}</Text>
                <Text style={styles.talentBio}>{talent.shortBio}</Text>
                <View style={styles.skillsContainer}>
                  {talent.skills.map((skill: { name: string }, index: number) => (
                    <Text key={index} style={styles.skillTag}>{skill.name}</Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results Info */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  searchTypeToggleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 0,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8f9fa',
    gap: 4,
    minHeight: 36,
  },
  filterButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewModeToggleButton: {
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8f9fa',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 58,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 6,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 2,
  },
  dropdownOptionActive: {
    backgroundColor: '#f3f0ff',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  talentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  talentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  talentInfo: {
    flex: 1,
  },
  talentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  talentBio: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  skillTag: {
    fontSize: 11,
    backgroundColor: '#f0f0f0',
    color: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  resultsSubtext: {
    fontSize: 12,
    color: '#999',
  },
});