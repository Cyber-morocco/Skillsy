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
      <View style={styles.header}>
        <Text style={styles.title}>Buurt Feed</Text>
        <Text style={styles.subtitle}>
          Deel je vragen, successen en materialen met je buurt
        </Text>
      </View>

      <TouchableOpacity
        style={styles.newPostButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color={authColors.text} style={styles.icon} />
        <Text style={styles.buttonText}>Nieuw Bericht Plaatsen</Text>
      </TouchableOpacity>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
    padding: 24,
    paddingTop: 0,
  },
  headerContainer: {
    marginBottom: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: authColors.muted,
    lineHeight: 22,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.accent,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: authColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: authColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    marginTop: 24,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: authColors.card,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  activeTab: {
    backgroundColor: authColors.accent,
    borderColor: authColors.accent,
  },
  tabText: {
    color: authColors.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: authColors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: authColors.muted,
    fontSize: 16,
  },
});
