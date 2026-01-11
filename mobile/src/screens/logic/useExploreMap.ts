import { useMemo, useState, useEffect, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Location, GeocodingResult, Talent, LearnSkill, Skill } from '../../types';
import { subscribeToTalents, subscribeToOtherUserSkills, subscribeToOtherUserReviews, subscribeToLearnSkills, subscribeToUserProfile, subscribeToSkills, subscribeToOtherUserLearnSkills } from '../../services/userService';
import { CATEGORY_OPTIONS, DISTANCE_OPTIONS } from '../../constants/exploreMap';
import { auth } from '../../config/firebase';
import { calculateDistance } from './distance';
import { calculateClusters, Cluster } from './clustering';

const DEFAULT_LOCATION: Location = { lat: 52.3676, lng: 4.9041 };

const filterTalents = (
  talents: Talent[],
  filters: {
    selectedDistance: number | null;
    selectedCategories: string[];
    skillSearch: string;
    userLocation: Location;
  }
): Talent[] => {
  const { selectedDistance, selectedCategories, skillSearch, userLocation } = filters;
  const searchTerm = skillSearch.trim().toLowerCase();

  return talents.filter((talent: Talent) => {
    if (selectedDistance !== null) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, talent.lat, talent.lng);
      if (distance > selectedDistance) return false;
    }

    if (selectedCategories.length > 0) {
      const talentCategories = talent.rootCategoryIds || [];
      const hasMatchingCategory = selectedCategories.some((categoryId) =>
        talentCategories.includes(categoryId)
      );
      if (!hasMatchingCategory) return false;
    }

    if (searchTerm) {
      const talentSkillNames = (talent.skillNames || []).map(s => s.toLowerCase());
      const hasMatchingSkill = talentSkillNames.some((skill) => skill.includes(searchTerm));
      if (!hasMatchingSkill) return false;
    }

    return true;
  });
};

// GDPR: Add random offset to coordinates (300-800m) to protect exact location
const fuzzyLocation = (lat: number, lng: number, seed: string): { lat: number; lng: number } => {
  // Use a simple hash of the seed for consistent randomness per user
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }

  // Random offset between 300m and 800m (~0.003 to 0.008 degrees)
  const offsetLat = ((Math.abs(hash % 1000) / 1000) * 0.005 + 0.003) * (hash % 2 === 0 ? 1 : -1);
  const offsetLng = ((Math.abs((hash >> 8) % 1000) / 1000) * 0.005 + 0.003) * ((hash >> 4) % 2 === 0 ? 1 : -1);

  return {
    lat: lat + offsetLat,
    lng: lng + offsetLng
  };
};

export const useExploreMap = () => {
  const [allTalents, setAllTalents] = useState<Talent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<Location>(DEFAULT_LOCATION);
  const [profileLocation, setProfileLocation] = useState<Location>(DEFAULT_LOCATION);
  const profileLocationRef = useRef<Location>(DEFAULT_LOCATION);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'skill' | 'address'>('skill');
  const [focusTalent, setFocusTalent] = useState<{ id: string; lat: number; lng: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [userLearnSkills, setUserLearnSkills] = useState<LearnSkill[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [profileReady, setProfileReady] = useState(false);

  // Default center on signup address; keep latest profile location in ref
  useEffect(() => {
    const unsubscribe = subscribeToUserProfile((profile) => {
      const loc = profile.location;
      const baseLocation = loc?.lat && loc.lng
        ? { lat: loc.lat, lng: loc.lng, address: loc.address }
        : DEFAULT_LOCATION;

      setProfileLocation(baseLocation);
      profileLocationRef.current = baseLocation;

      // Only override map center if we are not actively using GPS
      if (!locationPermissionGranted) {
        setUserLocation(baseLocation);
      }

      // Mark profile location as loaded so map can render centered correctly
      setProfileReady(true);
    });

    return () => unsubscribe();
  }, [locationPermissionGranted]);

  useEffect(() => {
    const unsubscribe = subscribeToTalents((fetchedTalents) => {
      // Filter out current user
      const currentUserId = auth.currentUser?.uid;
      const filteredFetchedTalents = fetchedTalents.filter((u: any) => u.id !== currentUserId);

      const mappedTalents: Talent[] = filteredFetchedTalents.map((u: any) => ({
        id: u.id,
        userId: u.id,
        name: u.displayName || 'Onbekend',
        lat: u.location?.lat || 0,
        lng: u.location?.lng || 0,
        shortBio: u.bio || '',
        avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || 'U'}`,
        skillNames: u.skillNames || [],
        skillsWithPrices: [],
        location: {
          city: u.location?.city,
          street: u.location?.street
        },
        rootCategoryIds: u.rootCategoryIds || [],
        averageRating: undefined,
        reviewCount: 0,
        isActive: true
      }));

      // For each talent, subscribe to their skills and reviews
      mappedTalents.forEach((talent) => {
        // Subscribe to skills
        subscribeToOtherUserSkills(talent.userId, (skills) => {
          setAllTalents((prev) =>
            prev.map((t) =>
              t.id === talent.id
                ? { ...t, skillsWithPrices: skills.map(s => ({ subject: s.subject, price: s.price || '' })) }
                : t
            )
          );
        });

        // Subscribe to reviews
        subscribeToOtherUserReviews(talent.userId, (reviews) => {
          const avgRating = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : undefined;

          setAllTalents((prev) =>
            prev.map((t) =>
              t.id === talent.id
                ? { ...t, averageRating: avgRating, reviewCount: reviews.length }
                : t
            )
          );
        });

        // Subscribe to learn skills (for reverse matching - what they want to learn)
        subscribeToOtherUserLearnSkills(talent.userId, (learnSkills) => {
          setAllTalents((prev) =>
            prev.map((t) =>
              t.id === talent.id
                ? { ...t, learnSkillSubjects: learnSkills.map(ls => ls.subject.toLowerCase()) }
                : t
            )
          );
        });
      });

      setAllTalents(mappedTalents);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to current user's learn skills
  useEffect(() => {
    const unsubscribe = subscribeToLearnSkills((learnSkills) => {
      setUserLearnSkills(learnSkills);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to current user's skills (for reverse matching - what I can teach)
  useEffect(() => {
    const unsubscribe = subscribeToSkills((skills) => {
      setUserSkills(skills);
    });
    return () => unsubscribe();
  }, []);

  // Apply fuzzy location to ALL talents first (GDPR)
  // This ensures map and list use consistent locations
  const fuzzyTalents = useMemo(() => {
    return allTalents.map(talent => {
      const fuzzy = fuzzyLocation(talent.lat, talent.lng, talent.id);
      return {
        ...talent,
        lat: fuzzy.lat,
        lng: fuzzy.lng
      };
    });
  }, [allTalents]);

  // Filter talents for LIST VIEW (respects all filters including distance)
  const filteredTalents = useMemo(() => {
    const filtered = filterTalents(fuzzyTalents, {
      selectedDistance,
      selectedCategories,
      skillSearch,
      userLocation,
    });

    // Sort talents: Priority: Distance > Match > Review
    const sorted = filtered.sort((a, b) => {
      // 1. Distance (Ascending)
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);

      // Use a small threshold (e.g. 100m) to treat distances as "equal" for secondary sorting
      // otherwise floating point differences make secondary sorts impossible.
      if (Math.abs(distA - distB) > 0.1) {
        return distA - distB;
      }

      // 2. Skill Match (Any Match > No Match)
      // Check if I want their skills
      const aUserWant = (a.skillsWithPrices || []).some(skill =>
        userLearnSkills.some(ls => ls.subject.toLowerCase() === skill.subject.toLowerCase())
      );
      const bUserWant = (b.skillsWithPrices || []).some(skill =>
        userLearnSkills.some(ls => ls.subject.toLowerCase() === skill.subject.toLowerCase())
      );

      // Check if they want my skills (Reverse Match)
      const aTheyWant = (a.learnSkillSubjects || []).some(subject =>
        userSkills.some(s => s.subject.toLowerCase() === subject.toLowerCase())
      );
      const bTheyWant = (b.learnSkillSubjects || []).some(subject =>
        userSkills.some(s => s.subject.toLowerCase() === subject.toLowerCase())
      );

      const aHasMatch = aUserWant || aTheyWant;
      const bHasMatch = bUserWant || bTheyWant;

      if (aHasMatch !== bHasMatch) {
        return aHasMatch ? -1 : 1; // Match first
      }

      // 3. Review (Average Rating Descending)
      const aRating = a.averageRating || 0;
      const bRating = b.averageRating || 0;

      return bRating - aRating;
    });

    return sorted;
  }, [fuzzyTalents, selectedDistance, selectedCategories, skillSearch, userLocation, userLearnSkills]);

  // Calculate clusters for MAP VIEW (ignores filters except implicit 30km limit in calculateClusters)
  // Prompt: "Skill/category filters: ... only affect the list view, not the map"
  // Prompt: "Distance filter: ... only hide overlapping clusters" (handled in mapHtml)
  const mapClusters = useMemo(() => {
    return calculateClusters(fuzzyTalents, userLocation);
  }, [fuzzyTalents, userLocation]);

  // Center map on user's actual GPS location
  const centerToUserLocation = async () => {
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        setUserLocation(profileLocationRef.current);
        setFocusTalent(null);
        // Show alert to user to go to settings
        Alert.alert(
          'Locatietoegang geweigerd',
          'Je hebt locatietoegang geweigerd. Ga naar je telefooninstellingen > Apps > Skillsy > Locatie en sta locatietoegang toe om deze functie te gebruiken.',
          [
            { text: 'Annuleren', style: 'cancel' },
            {
              text: 'Naar instellingen',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return;
      }

      setLocationPermissionGranted(true);

      // Try to get current position with timeout and fallback
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const newLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        setUserLocation(newLocation);
        setFocusTalent(null);
      } catch (currentError) {
        // Fallback to last known location
        console.log('Trying last known location...');
        const lastKnown = await Location.getLastKnownPositionAsync({});

        if (lastKnown) {
          const newLocation = {
            lat: lastKnown.coords.latitude,
            lng: lastKnown.coords.longitude
          };
          setUserLocation(newLocation);
          setFocusTalent(null);
        } else {
          setUserLocation(profileLocationRef.current);
          setFocusTalent(null);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Show alert on any error
      Alert.alert(
        'Fout bij ophalen locatie',
        'Er is een fout opgetreden bij het ophalen van je locatie. Controleer je locatie-instellingen.',
        [{ text: 'OK' }]
      );
      setLocationPermissionGranted(false);
      setUserLocation(profileLocationRef.current);
      setFocusTalent(null);
    }
  };

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
          address: data[0].display_name,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleDistanceSelect = (distance: number) => {
    setSelectedDistance((prev) => (prev === distance ? null : distance));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearCategories = () => setSelectedCategories([]);

  const toggleSearchType = () => {
    setSearchType((prev) => (prev === 'skill' ? 'address' : 'skill'));
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSkillSearch('');
    setFocusTalent(null);
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);

    if (searchType === 'address') {
      const result = await geocodeAddress(q);
      setIsSearching(false);
      if (result) {
        setUserLocation(result);
        setFocusTalent(null);
      }
      return;
    }

    const matches = filterTalents(allTalents, {
      selectedDistance,
      selectedCategories,
      skillSearch: q,
      userLocation,
    });

    setSkillSearch(q);
    setIsSearching(false);

    if (matches.length > 0) {
      let nearest = matches[0];
      let minDist = calculateDistance(userLocation.lat, userLocation.lng, nearest.lat, nearest.lng);
      for (let i = 1; i < matches.length; i++) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, matches[i].lat, matches[i].lng);
        if (distance < minDist) {
          minDist = distance;
          nearest = matches[i];
        }
      }
      setFocusTalent({ id: nearest.id, lat: nearest.lat, lng: nearest.lng });
    } else {
      setFocusTalent(null);
    }
  };

  // Reset map to user/profile location when address search is cleared
  useEffect(() => {
    if (searchType === 'address' && searchQuery === '') {
      if (locationPermissionGranted) {
        // If GPS is allowed, use it (centerToUserLocation handles fetching)
        centerToUserLocation();
      } else {
        // Fallback to profile location without triggering permission alert
        setUserLocation(profileLocationRef.current);
      }
    }
  }, [searchQuery, searchType, locationPermissionGranted]);

  return {
    CATEGORY_OPTIONS,
    DISTANCE_OPTIONS,
    allTalents,
    clearCategories,
    filteredTalents,
    mapClusters,
    focusTalent,
    handleCategorySelect,
    handleDistanceSelect,
    handleSearch,
    isSearching,
    locationPermissionGranted,
    requestLocationPermission: centerToUserLocation,
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
    userSkills,
    viewMode,
    centerToUserLocation,
    profileReady,
  };
};

