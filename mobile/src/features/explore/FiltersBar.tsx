import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Animated, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { exploreMapStyles as styles } from '../../styles/exploreMapStyles';

interface CategoryOption {
  id: string;
  label: string;
  icon: string;
}

interface FiltersBarProps {
  selectedDistance: number | null;
  onSelectDistance: (distance: number) => void;
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
  distanceOptions: number[];
  categoryOptions: CategoryOption[];
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedDistance,
  onSelectDistance,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  viewMode,
  onToggleViewMode,
  distanceOptions,
  categoryOptions,
}) => {
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [shouldRenderDistanceDropdown, setShouldRenderDistanceDropdown] = useState(false);
  const [shouldRenderCategoryDropdown, setShouldRenderCategoryDropdown] = useState(false);
  const [distanceLayout, setDistanceLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [categoryLayout, setCategoryLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const distanceDropdownAnim = useRef(new Animated.Value(0)).current;
  const categoryDropdownAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = useWindowDimensions();
  const dropdownMaxHeight = screenHeight * 0.6;

  useEffect(() => {
    if (showDistanceDropdown) {
      setShouldRenderDistanceDropdown(true);
      distanceDropdownAnim.setValue(0);
      Animated.timing(distanceDropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(distanceDropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setShouldRenderDistanceDropdown(false);
      });
    }
  }, [showDistanceDropdown, distanceDropdownAnim]);

  useEffect(() => {
    if (showCategoryDropdown) {
      setShouldRenderCategoryDropdown(true);
      categoryDropdownAnim.setValue(0);
      Animated.timing(categoryDropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(categoryDropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setShouldRenderCategoryDropdown(false);
      });
    }
  }, [showCategoryDropdown, categoryDropdownAnim]);

  const closeDropdowns = () => {
    setShowDistanceDropdown(false);
    setShowCategoryDropdown(false);
  };

  return (
    <View style={styles.filterSection}>
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedDistance !== null && styles.filterButtonActive]}
          onPress={() => {
            setShowDistanceDropdown(!showDistanceDropdown);
            setShowCategoryDropdown(false);
          }}
          onLayout={(e) => setDistanceLayout(e.nativeEvent.layout)}
        >
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={16}
            color={selectedDistance !== null ? '#fff' : '#7c3aed'}
          />
          <Text style={[styles.filterButtonText, selectedDistance !== null && styles.filterButtonTextActive]}>
            {selectedDistance ? `${selectedDistance} km` : 'Afstand'}
          </Text>
          <Ionicons
            name={showDistanceDropdown ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={selectedDistance !== null ? '#fff' : '#7c3aed'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedCategories.length > 0 && styles.filterButtonActive]}
          onPress={() => {
            setShowCategoryDropdown(!showCategoryDropdown);
            setShowDistanceDropdown(false);
          }}
          onLayout={(e) => setCategoryLayout(e.nativeEvent.layout)}
        >
          <MaterialCommunityIcons
            name="tag"
            size={16}
            color={selectedCategories.length > 0 ? '#fff' : '#7c3aed'}
          />
          <Text style={[styles.filterButtonText, selectedCategories.length > 0 && styles.filterButtonTextActive]}>
            {selectedCategories.length > 0 ? `${selectedCategories.length} cat.` : 'Categorie'}
          </Text>
          <Ionicons
            name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={selectedCategories.length > 0 ? '#fff' : '#7c3aed'}
          />
        </TouchableOpacity>
      </View>

      {shouldRenderDistanceDropdown && (
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              top: distanceLayout.y + distanceLayout.height + 6,
              left: distanceLayout.x + 16,
              minWidth: Math.max(distanceLayout.width, 120),
              maxWidth: Math.max(distanceLayout.width, 180),
              maxHeight: dropdownMaxHeight,
              overflow: 'hidden',
              opacity: distanceDropdownAnim,
              transform: [
                {
                  translateY: distanceDropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
                {
                  scale: distanceDropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {distanceOptions.map((distance) => (
            <TouchableOpacity
              key={distance}
              style={[styles.dropdownOption, selectedDistance === distance && styles.dropdownOptionActive]}
              onPress={() => {
                onSelectDistance(distance);
                setShowDistanceDropdown(false);
              }}
            >
              <Text
                style={[styles.dropdownOptionText, selectedDistance === distance && styles.dropdownOptionTextActive]}
              >
                {`${distance} km`}
              </Text>
              {selectedDistance === distance && <Ionicons name="checkmark" size={18} color="#7c3aed" />}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {shouldRenderCategoryDropdown && (
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              top: categoryLayout.y + categoryLayout.height + 6,
              left: categoryLayout.x + 16,
              minWidth: Math.max(categoryLayout.width, 160),
              maxWidth: Math.max(categoryLayout.width, 200),
              maxHeight: dropdownMaxHeight,
              overflow: 'hidden',
              opacity: categoryDropdownAnim,
              transform: [
                {
                  translateY: categoryDropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
                {
                  scale: categoryDropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView scrollEnabled showsVerticalScrollIndicator>
            {categoryOptions.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.dropdownOption, selectedCategories.includes(category.id) && styles.dropdownOptionActive]}
                onPress={() => onToggleCategory(category.id)}
              >
                <Text
                  style={[styles.dropdownOptionText, selectedCategories.includes(category.id) && styles.dropdownOptionTextActive]}
                >
                  {category.label}
                </Text>
                {selectedCategories.includes(category.id) && <Ionicons name="checkmark" size={18} color="#7c3aed" />}
              </TouchableOpacity>
            ))}

            {selectedCategories.length > 0 && (
              <TouchableOpacity style={styles.dropdownOption} onPress={onClearCategories}>
                <Text style={[styles.dropdownOptionText, styles.dropdownOptionTextActive]}>Reset</Text>
                <Ionicons name="close" size={18} color="#7c3aed" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {(showDistanceDropdown || showCategoryDropdown) && (
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={closeDropdowns} />
      )}
    </View>
  );
};
