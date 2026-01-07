import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Talent } from '../../types';
import { exploreMapStyles as styles } from '../../styles/exploreMapStyles';

interface TalentListProps {
  talents: Talent[];
  onPress: (id: string) => void;
}

export const TalentList: React.FC<TalentListProps> = ({ talents, onPress }) => (
  <ScrollView style={styles.listContainer}>
    {talents.map((talent) => (
      <TouchableOpacity key={talent.id} style={styles.talentCard} onPress={() => onPress(talent.id)}>
        <Image source={{ uri: talent.avatar }} style={styles.talentAvatar} />
        <View style={styles.talentInfo}>
          <Text style={styles.talentName}>{talent.name}</Text>
          <Text style={styles.talentBio}>{talent.shortBio}</Text>
          <View style={styles.skillsContainer}>
            {talent.skills.map((skill) => (
              <Text key={`${talent.id}-${skill.name}`} style={styles.skillTag}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);
