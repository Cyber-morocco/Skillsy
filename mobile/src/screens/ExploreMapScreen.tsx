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
  const [searchLocation, setSearchLocation] = useState('Amsterdam');
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const webViewRef = useRef<WebView>(null);
  
  const userLocation = { lat: 52.3676, lng: 4.9041 }; // Amsterdam center
  
  const allTalents: Talent[] = [
    // Amsterdam Center
    { id: 1, name: 'John', lat: 52.3676, lng: 4.9041, shortBio: 'Web Developer', avatar: 'https://i.pravatar.cc/150?img=1', skills: [{ name: 'React' }, { name: 'Node.js' }] },
    { id: 2, name: 'Jane', lat: 52.3750, lng: 4.9050, shortBio: 'UI Designer', avatar: 'https://i.pravatar.cc/150?img=2', skills: [{ name: 'Figma' }, { name: 'CSS' }] },
    { id: 3, name: 'Bob', lat: 52.3600, lng: 4.8950, shortBio: 'Mobile Dev', avatar: 'https://i.pravatar.cc/150?img=3', skills: [{ name: 'React Native' }, { name: 'Flutter' }] },
    { id: 4, name: 'Lisa', lat: 52.3700, lng: 4.9100, shortBio: 'Product Manager', avatar: 'https://i.pravatar.cc/150?img=4', skills: [{ name: 'Leadership' }, { name: 'Analytics' }] },
    
    // Amsterdam - nearby (1-3 km)
    { id: 5, name: 'Mark', lat: 52.3710, lng: 4.8980, shortBio: 'DevOps Engineer', avatar: 'https://i.pravatar.cc/150?img=5', skills: [{ name: 'Docker' }, { name: 'Kubernetes' }] },
    { id: 6, name: 'Sarah', lat: 52.3640, lng: 4.9120, shortBio: 'Data Scientist', avatar: 'https://i.pravatar.cc/150?img=6', skills: [{ name: 'Python' }, { name: 'ML' }] },
    { id: 7, name: 'Tom', lat: 52.3720, lng: 4.9000, shortBio: 'Backend Developer', avatar: 'https://i.pravatar.cc/150?img=7', skills: [{ name: 'Java' }, { name: 'Spring' }] },
    { id: 8, name: 'Emma', lat: 52.3650, lng: 4.9080, shortBio: 'UX Researcher', avatar: 'https://i.pravatar.cc/150?img=8', skills: [{ name: 'Research' }, { name: 'Usability' }] },
    { id: 9, name: 'Lucas', lat: 52.3690, lng: 4.9020, shortBio: 'Full Stack Dev', avatar: 'https://i.pravatar.cc/150?img=9', skills: [{ name: 'Vue.js' }, { name: 'Express' }] },
    
    // Amsterdam - slightly further (3-8 km)
    { id: 10, name: 'Sophie', lat: 52.3800, lng: 4.9200, shortBio: 'QA Engineer', avatar: 'https://i.pravatar.cc/150?img=10', skills: [{ name: 'Testing' }, { name: 'Automation' }] },
    { id: 11, name: 'Alex', lat: 52.3500, lng: 4.8850, shortBio: 'Security Expert', avatar: 'https://i.pravatar.cc/150?img=11', skills: [{ name: 'Cybersecurity' }, { name: 'Pentesting' }] },
    { id: 12, name: 'Nina', lat: 52.3820, lng: 4.9150, shortBio: 'Scrum Master', avatar: 'https://i.pravatar.cc/150?img=12', skills: [{ name: 'Agile' }, { name: 'Coaching' }] },
    { id: 13, name: 'Daniel', lat: 52.3550, lng: 4.8900, shortBio: 'Cloud Architect', avatar: 'https://i.pravatar.cc/150?img=13', skills: [{ name: 'AWS' }, { name: 'Azure' }] },
    { id: 14, name: 'Laura', lat: 52.3900, lng: 4.9100, shortBio: 'Content Strategist', avatar: 'https://i.pravatar.cc/150?img=14', skills: [{ name: 'SEO' }, { name: 'Copywriting' }] },
    
    // Rotterdam (60 km from Amsterdam)
    { id: 15, name: 'Peter', lat: 51.9225, lng: 4.4792, shortBio: 'Blockchain Dev', avatar: 'https://i.pravatar.cc/150?img=15', skills: [{ name: 'Solidity' }, { name: 'Web3' }] },
    { id: 16, name: 'Maria', lat: 51.9244, lng: 4.4777, shortBio: 'Brand Designer', avatar: 'https://i.pravatar.cc/150?img=16', skills: [{ name: 'Branding' }, { name: 'Illustration' }] },
    { id: 17, name: 'Kevin', lat: 51.9200, lng: 4.4800, shortBio: 'iOS Developer', avatar: 'https://i.pravatar.cc/150?img=17', skills: [{ name: 'Swift' }, { name: 'SwiftUI' }] },
    
    // The Hague (50 km from Amsterdam)
    { id: 18, name: 'Julia', lat: 52.0705, lng: 4.3007, shortBio: 'Game Developer', avatar: 'https://i.pravatar.cc/150?img=18', skills: [{ name: 'Unity' }, { name: 'C#' }] },
    { id: 19, name: 'Mike', lat: 52.0800, lng: 4.3100, shortBio: 'AI Specialist', avatar: 'https://i.pravatar.cc/150?img=19', skills: [{ name: 'TensorFlow' }, { name: 'Deep Learning' }] },
    
    // Utrecht (35 km from Amsterdam)
    { id: 20, name: 'Anna', lat: 52.0907, lng: 5.1214, shortBio: 'Frontend Lead', avatar: 'https://i.pravatar.cc/150?img=20', skills: [{ name: 'TypeScript' }, { name: 'Angular' }] },
    { id: 21, name: 'Chris', lat: 52.0850, lng: 5.1150, shortBio: 'Systems Engineer', avatar: 'https://i.pravatar.cc/150?img=21', skills: [{ name: 'Linux' }, { name: 'Networking' }] },
    { id: 22, name: 'Eva', lat: 52.0950, lng: 5.1300, shortBio: 'Video Editor', avatar: 'https://i.pravatar.cc/150?img=22', skills: [{ name: 'Premiere' }, { name: 'After Effects' }] },
    
    // Berlin, Germany
    { id: 23, name: 'Hans', lat: 52.5200, lng: 13.4050, shortBio: 'Hardware Engineer', avatar: 'https://i.pravatar.cc/150?img=23', skills: [{ name: 'IoT' }, { name: 'Embedded' }] },
    { id: 24, name: 'Ingrid', lat: 52.5150, lng: 13.3900, shortBio: 'Tech Writer', avatar: 'https://i.pravatar.cc/150?img=24', skills: [{ name: 'Documentation' }, { name: 'API Docs' }] },
    { id: 25, name: 'Franz', lat: 52.5300, lng: 13.4100, shortBio: 'AR/VR Developer', avatar: 'https://i.pravatar.cc/150?img=25', skills: [{ name: 'Unity' }, { name: 'AR Kit' }] },
    
    // Paris, France
    { id: 26, name: 'Pierre', lat: 48.8566, lng: 2.3522, shortBio: 'Fashion Tech', avatar: 'https://i.pravatar.cc/150?img=26', skills: [{ name: '3D Modeling' }, { name: 'Blender' }] },
    { id: 27, name: 'Camille', lat: 48.8600, lng: 2.3500, shortBio: 'Growth Hacker', avatar: 'https://i.pravatar.cc/150?img=27', skills: [{ name: 'Marketing' }, { name: 'Analytics' }] },
    
    // London, UK
    { id: 28, name: 'James', lat: 51.5074, lng: -0.1278, shortBio: 'FinTech Developer', avatar: 'https://i.pravatar.cc/150?img=28', skills: [{ name: 'Rust' }, { name: 'Trading Systems' }] },
    { id: 29, name: 'Emily', lat: 51.5100, lng: -0.1200, shortBio: 'Voice UI Designer', avatar: 'https://i.pravatar.cc/150?img=29', skills: [{ name: 'Alexa' }, { name: 'Voice Design' }] },
    { id: 30, name: 'Oliver', lat: 51.5050, lng: -0.1300, shortBio: 'Crypto Analyst', avatar: 'https://i.pravatar.cc/150?img=30', skills: [{ name: 'DeFi' }, { name: 'Research' }] },
    
    // Barcelona, Spain
    { id: 31, name: 'Carlos', lat: 41.3851, lng: 2.1734, shortBio: 'Motion Designer', avatar: 'https://i.pravatar.cc/150?img=31', skills: [{ name: 'Animation' }, { name: 'Cinema 4D' }] },
    { id: 32, name: 'Isabella', lat: 41.3900, lng: 2.1700, shortBio: 'Startup Advisor', avatar: 'https://i.pravatar.cc/150?img=32', skills: [{ name: 'Strategy' }, { name: 'Fundraising' }] },
    
    // Copenhagen, Denmark
    { id: 33, name: 'Lars', lat: 55.6761, lng: 12.5683, shortBio: 'Green Tech Dev', avatar: 'https://i.pravatar.cc/150?img=33', skills: [{ name: 'Sustainability' }, { name: 'Clean Tech' }] },
    
    // Stockholm, Sweden
    { id: 34, name: 'Astrid', lat: 59.3293, lng: 18.0686, shortBio: 'EdTech Designer', avatar: 'https://i.pravatar.cc/150?img=34', skills: [{ name: 'E-learning' }, { name: 'Instructional Design' }] },
    
    // Brussels, Belgium
    { id: 35, name: 'Maxime', lat: 50.8503, lng: 4.3517, shortBio: 'Legal Tech', avatar: 'https://i.pravatar.cc/150?img=35', skills: [{ name: 'Legal Tech' }, { name: 'Compliance' }] },
  ];

  // Filter talents based on selected distance
  const filteredTalents = allTalents.filter((talent) => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      talent.lat,
      talent.lng
    );
    return distance <= selectedDistance;
  });

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