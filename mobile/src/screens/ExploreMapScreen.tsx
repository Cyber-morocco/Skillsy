import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Talent {
  id: number;
  name: string;
  lat: number;
  lng: number;
  shortBio: string;
  avatar: string;
  skills: { name: string }[];
}

const DISTANCE_OPTIONS = [1, 2, 5, 10, 15];

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
/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * @param address - The address to search for
 * @returns Location with lat/lng or null if not found
 */
const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    const response = await fetch(
      `${NOMINATIM_API}?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Skillsy-App/1.0' // Required by Nominatim
        }
      }
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

// ========================================
// 🗂️ Mock Data
// ========================================

const MOCK_SKILL_CATEGORIES: SkillCategory[] = [
  { id: 1, name: 'Development', icon: 'code-slash' },
  { id: 2, name: 'Design', icon: 'color-palette' },
  { id: 3, name: 'Business', icon: 'briefcase' },
  { id: 4, name: 'Marketing', icon: 'megaphone' },
];

const MOCK_TALENTS: Talent[] = [
  {
    id: 1,
    name: 'John',
    location: { lat: 52.3676, lng: 4.9041 },
    shortBio: 'Web Developer',
    avatar: 'https://i.pravatar.cc/150?img=1',
    skills: [
      { id: 1, name: 'React', categoryId: 1, level: 'expert' },
      { id: 2, name: 'Node.js', categoryId: 1, level: 'intermediate' }
    ]
  },
  {
    id: 2,
    name: 'Jane',
    location: { lat: 52.3750, lng: 4.9050 },
    shortBio: 'UI Designer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    skills: [
      { id: 3, name: 'Figma', categoryId: 2, level: 'expert' },
      { id: 4, name: 'CSS', categoryId: 2, level: 'intermediate' }
    ]
  },
  {
    id: 3,
    name: 'Bob',
    location: { lat: 52.3600, lng: 4.8950 },
    shortBio: 'Mobile Dev',
    avatar: 'https://i.pravatar.cc/150?img=3',
    skills: [
      { id: 5, name: 'React Native', categoryId: 1, level: 'expert' },
      { id: 6, name: 'Flutter', categoryId: 1, level: 'beginner' }
    ]
  },
  {
    id: 4,
    name: 'Lisa',
    location: { lat: 52.3700, lng: 4.9100 },
    shortBio: 'Product Manager',
    avatar: 'https://i.pravatar.cc/150?img=4',
    skills: [
      { id: 7, name: 'Leadership', categoryId: 3, level: 'expert' },
      { id: 8, name: 'Analytics', categoryId: 3, level: 'intermediate' }
    ]
  },
];

// ========================================
// 📱 Main Component
// ========================================

export default function ExploreMapScreen() {
  // ========================================
  // 🔄 State Management
  // ========================================

  const [searchLocation, setSearchLocation] = useState('Amsterdam');
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const webViewRef = useRef<WebView>(null);
  
  const userLocation = { lat: 52.3676, lng: 4.9041 }; // Amsterdam center
  
  const allTalents: Talent[] = [
    { 
      id: 1, 
      name: 'John', 
      lat: 52.3676, 
      lng: 4.9041, 
      shortBio: 'Web Developer',
      avatar: 'https://i.pravatar.cc/150?img=1',
      skills: [{ name: 'React' }, { name: 'Node.js' }] 
    },
    { 
      id: 2, 
      name: 'Jane', 
      lat: 52.3750, 
      lng: 4.9050, 
      shortBio: 'UI Designer',
      avatar: 'https://i.pravatar.cc/150?img=2',
      skills: [{ name: 'Figma' }, { name: 'CSS' }] 
    },
    { 
      id: 3, 
      name: 'Bob', 
      lat: 52.3600, 
      lng: 4.8950, 
      shortBio: 'Mobile Dev',
      avatar: 'https://i.pravatar.cc/150?img=3',
      skills: [{ name: 'React Native' }, { name: 'Flutter' }] 
    },
    { 
      id: 4, 
      name: 'Lisa', 
      lat: 52.3700, 
      lng: 4.9100, 
      shortBio: 'Product Manager',
      avatar: 'https://i.pravatar.cc/150?img=4',
      skills: [{ name: 'Leadership' }, { name: 'Analytics' }] 
    },
  ];

  const allTalents: Talent[] = MOCK_TALENTS;

  // ========================================
  // 🧮 Filtering Logic
  // ========================================

  // Filter talents based on selected distance
  const filteredTalents = allTalents.filter((talent) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      talent.lat,
      talent.lng
    );
<<<<<<< HEAD
    return distance <= selectedDistance;
  });

=======

    // Distance filter
    if (distance > selectedDistance) return false;

    // Category filter (if any selected)
    if (selectedCategories.length > 0) {
      const hasMatchingSkill = talent.skills.some(skill =>
        selectedCategories.includes(skill.categoryId)
      );
      return hasMatchingSkill;
    }

    return true;
  });

  // ========================================
  // 🔍 Address Search Handler
  // ========================================

  const handleSearchLocation = async () => {
    if (!searchLocation.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    setIsSearching(true);
    const result = await geocodeAddress(searchLocation);
    setIsSearching(false);

    if (result) {
      setUserLocation(result);

      // Update map to new location
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          location: result,
          radiusKm: selectedDistance,
          talents: filteredTalents
        }));
      }

      Alert.alert('Success', `Location found: ${result.address || searchLocation}`);
    } else {
      Alert.alert('Not Found', 'Could not find that location. Try another search term.');
    }
  };

  // ========================================
  // ⚡ Effects
  // ========================================

>>>>>>> 09e9b1647cf905177481de8f58ffd1fa3cde903c
  // Update map when filtered talents or selectedDistance changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateRadius',
        radiusKm: selectedDistance,
        talents: filteredTalents
      }));
    }
  }, [selectedDistance, filteredTalents]);

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
            const centerLat = ${userLocation.lat};
            const centerLng = ${userLocation.lng};
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

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#7c3aed" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            value={searchLocation}
            onChangeText={setSearchLocation}
          />
        </View>
      </View>

      {/* Distance Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.distanceSelector}
        contentContainerStyle={styles.distanceContent}
      >
        {DISTANCE_OPTIONS.map((distance) => (
          <TouchableOpacity
            key={distance}
            style={[
              styles.distanceButton,
              selectedDistance === distance && styles.distanceButtonActive
            ]}
            onPress={() => setSelectedDistance(distance)}
          >
            <Text
              style={[
                styles.distanceText,
                selectedDistance === distance && styles.distanceTextActive
              ]}
            >
              {distance} km
            </Text>
=======
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#7c3aed" />
>>>>>>> 09e9b1647cf905177481de8f58ffd1fa3cde903c
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              value={searchLocation}
              onChangeText={setSearchLocation}
              onSubmitEditing={handleSearchLocation}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#7c3aed" />
            ) : (
              <TouchableOpacity onPress={handleSearchLocation} style={styles.searchButton}>
                <Ionicons name="arrow-forward" size={18} color="#7c3aed" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Distance Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.distanceSelector}
          contentContainerStyle={styles.distanceContent}
        >
          {DISTANCE_OPTIONS.map((distance) => (
            <TouchableOpacity
              key={distance}
              style={[
                styles.distanceButton,
                selectedDistance === distance && styles.distanceButtonActive
              ]}
              onPress={() => setSelectedDistance(distance)}
            >
              <Text
                style={[
                  styles.distanceText,
                  selectedDistance === distance && styles.distanceTextActive
                ]}
              >
                {distance} km
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Map or List View */}
        {viewMode === 'map' ? (
          <View style={styles.mapContainer}>
            <WebView
              ref={webViewRef}
              source={{ html: mapHTML }}
              style={styles.map}
              onMessage={(event: { nativeEvent: { data: string } }) => {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'talentClick') {
                  console.log('Clicked talent:', data.talentId);
                }
              }}
            />
          </View>
        ) : (
          <ScrollView style={styles.listContainer}>
            {filteredTalents.map((talent) => (
              <TouchableOpacity key={talent.id} style={styles.talentCard}>
                <Image source={{ uri: talent.avatar }} style={styles.talentAvatar} />
                <View style={styles.talentInfo}>
                  <Text style={styles.talentName}>{talent.name}</Text>
                  <Text style={styles.talentBio}>{talent.shortBio}</Text>
                  <View style={styles.skillsContainer}>
                    {talent.skills.map((skill, index) => (
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
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsCount}>{filteredTalents.length} talenten gevonden</Text>
            <Text style={styles.resultsSubtext}>In een straal van {selectedDistance} km</Text>
          </View>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            <MaterialCommunityIcons
              name={viewMode === 'map' ? 'format-list-bulleted' : 'map'}
              size={20}
              color="#7c3aed"
            />
          </TouchableOpacity>
        </View>

<<<<<<< HEAD
      {/* View Toggle Button */}
      <TouchableOpacity style={styles.listViewButton}>
        <Text style={styles.listViewButtonText}>
          {viewMode === 'map' ? 'Toon lijstweersgave' : 'Toon kaart'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
=======
        {/* View Toggle Button */}
        <TouchableOpacity style={styles.listViewButton}>
          <Text style={styles.listViewButtonText}>
            {viewMode === 'map' ? 'Toon lijstweersgave' : 'Toon kaart'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
>>>>>>> 09e9b1647cf905177481de8f58ffd1fa3cde903c
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  distanceSelector: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    maxHeight: 40,
  },
  distanceContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  distanceButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  distanceButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  distanceTextActive: {
    color: '#fff',
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resultsInfo: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  resultsSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listViewButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  listViewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});