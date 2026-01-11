import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authColors } from '../styles/authStyles';
import { Ionicons } from '@expo/vector-icons';
import FeedItem from '../components/FeedItem';
import CreatePostModal from '../components/CreatePostModal';
import CommentsModal from '../components/CommentsModal';
import { Post, PostType } from '../types';
import { subscribeToPosts, createPost, toggleLike } from '../services/feedService';
import { auth } from '../config/firebase';

interface HomePageProps {
  onViewProfile?: (user: any) => void;
}

export default function HomePage({ onViewProfile }: HomePageProps) {
  const [activeTab, setActiveTab] = useState('Alle');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const tabs = ['Alle', 'Vragen', 'Successen', 'Materiaal'];

  useEffect(() => {
    const unsubscribe = subscribeToPosts((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (newPost: { type: PostType; content: string; imageUri?: string }) => {
    try {
      await createPost(newPost.type, newPost.content, newPost.imageUri);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleToggleLike = async (post: Post) => {
    try {
      const isLiked = post.likes?.includes(auth.currentUser?.uid || '');
      await toggleLike(post.id, !isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const filteredPosts = activeTab === 'Alle'
    ? posts
    : posts.filter(post => {
      if (activeTab === 'Vragen') return post.type === 'Vraag';
      if (activeTab === 'Successen') return post.type === 'Succes';
      return post.type === activeTab as PostType;
    });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.title}>Buurt Feed</Text>
          <Text style={styles.subtitle}>Jouw wijk in beeld</Text>
        </View>

      </View>

      <TouchableOpacity
        style={styles.composeTrigger}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.9}
      >
        <View style={styles.composeIconCircle}>
          <Ionicons name="create-outline" size={20} color={authColors.accent} />
        </View>
        <Text style={styles.composePlaceholder} numberOfLines={1} ellipsizeMode="tail">Deel een vraag, succes of materiaal...</Text>
      </TouchableOpacity>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={authColors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => (
            <FeedItem
              post={item}
              onUserPress={() => onViewProfile && onViewProfile({ uid: item.userId, name: item.userName, photoURL: item.userAvatar })}
              onLike={() => handleToggleLike(item)}
              onComment={() => {
                setSelectedPost(item);
                setIsCommentsVisible(true);
              }}
              onImagePress={() => {
                setSelectedPost(item);
                setIsCommentsVisible(true);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nog geen berichten in deze categorie.</Text>
            </View>
          }
        />
      )}

      <CreatePostModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreatePost}
      />

      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => {
          setIsCommentsVisible(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  headerContainer: {
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: authColors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: authColors.muted,
    fontWeight: '500',
  },
  composeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authColors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  composeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  composePlaceholder: {
    flex: 1,
    color: authColors.muted,
    fontSize: 15,
    fontWeight: '500',
  },
  tabsContainer: {
    marginTop: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: authColors.accent,
  },
  tabText: {
    color: authColors.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.7,
  },
  emptyText: {
    color: authColors.muted,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
