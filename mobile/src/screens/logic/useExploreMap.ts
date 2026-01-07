import { useMemo, useState, useEffect } from 'react';
import * as ExpoLocation from 'expo-location';
import { Location, GeocodingResult, Talent } from '../../types';
import { subscribeToTalents } from '../../services/userService';
import { CATEGORY_OPTIONS, DISTANCE_OPTIONS } from '../../constants/exploreMap';
import { calculateDistance } from './distance';

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
      const talentSkillNames = talent.skills.map((s) => s.name.toLowerCase());
      const hasMatchingCategory = selectedCategories.some((category) =>
        talentSkillNames.some((skill) => skill.includes(category.toLowerCase()))
      );
      if (!hasMatchingCategory) return false;
    }

    if (searchTerm) {
      const hasMatchingSkill = talent.skills.some((skill) => skill.name.toLowerCase().includes(searchTerm));
      if (!hasMatchingSkill) return false;
    }

    return true;
  });
};

export const useExploreMap = () => {
  const [allTalents, setAllTalents] = useState<Talent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<Location>(DEFAULT_LOCATION);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'skill' | 'address'>('skill');
  const [focusTalent, setFocusTalent] = useState<{ id: string; lat: number; lng: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToTalents((fetchedTalents) => {
      const mappedTalents: Talent[] = fetchedTalents.map((u: any) => ({
        id: u.id,
        userId: u.id,
        name: u.displayName || 'Onbekend',
        lat: u.location?.lat || 0,
        lng: u.location?.lng || 0,
        shortBio: u.bio || '',
        avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || 'U'}`,
        skills: u.skills || [], // If denormalized, or empty for now
        isActive: true
      }));
      setAllTalents(mappedTalents);
    });
    return () => unsubscribe();
  }, []);

  // Check if location permission is already granted on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const { status } = await ExpoLocation.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermissionGranted(true);
          const location = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.Balanced,
          });
          const newLocation: Location = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setUserLocation(newLocation);
        }
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    };
    checkLocationPermission();
  }, []);

  const filteredTalents = useMemo(
    () =>
      filterTalents(allTalents, {
        selectedDistance,
        selectedCategories,
        skillSearch,
        userLocation,
      }),
    [allTalents, selectedDistance, selectedCategories, skillSearch, userLocation]
  );

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

  const requestLocationPermission = async () => {
    try {
      if (locationPermissionGranted) {
        const { status } = await ExpoLocation.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissionGranted(false);
          return false;
        }

        const location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Low,
          timeInterval: 5000,
          mayShowUserSettingsDialog: false,
        });

        const newLocation: Location = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        setUserLocation(newLocation);
        return true;
      }

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        return false;
      }

      setLocationPermissionGranted(true);
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Low,
        timeInterval: 5000,
        mayShowUserSettingsDialog: false,
      });

      const newLocation: Location = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setUserLocation(newLocation);
      return true;
    } catch (error) {
      setLocationPermissionGranted(false);
      return false;
    }
  };

  return {
    CATEGORY_OPTIONS,
    DISTANCE_OPTIONS,
    allTalents,
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
  };
};
