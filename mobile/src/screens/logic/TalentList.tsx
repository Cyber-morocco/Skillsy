import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Talent } from '../../types';
import { exploreMapStyles as styles } from '../../styles/exploreMapStyles';
import { Avatar } from '../../components/Avatar';

interface TalentListProps {
  talents: Talent[];
  onPress: (id: string) => void;
}

export const TalentList: React.FC<TalentListProps> = ({ talents, onPress }) => (
  <ScrollView style={styles.listContainer}>
    {talents.map((talent) => (
      <TouchableOpacity key={talent.id} style={styles.talentCard} onPress={() => onPress(talent.id)}>
        <Avatar uri={talent.avatar} name={talent.name} size={60} style={styles.talentAvatar} />
        <View style={styles.talentInfo}>
          <Text style={styles.talentName}>{talent.name}</Text>
          <Text style={styles.talentBio}>{talent.shortBio}</Text>
          <View style={styles.skillsContainer}>
            {talent.skills?.slice(0, 3).map((skill) => (
              <View key={`${talent.id}-${skill.name}`} style={styles.skillBadge}>
                <Text style={styles.skillText}>
                  {skill.name}
                </Text>
              </View>
            ))}
            {(talent.skills?.length || 0) > 3 && (
              <View style={styles.moreSkillsBadge}>
                <Text style={styles.moreSkillsText}>+{(talent.skills?.length || 0) - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);
