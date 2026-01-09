import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    Unsubscribe,
    increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import { Post, PostType, PostComment } from '../types';

/**
 * Subscribe to all posts in the neighborhood feed
 */
export const subscribeToPosts = (onUpdate: (posts: Post[]) => void): Unsubscribe => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Post));
        onUpdate(posts);
    });
};

/**
 * Upload an image to Firebase Storage and return the download URL
 */
const uploadPostImage = async (imageUri: string, userId: string): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const filename = `posts/${userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
};

/**
 * Create a new post with optional image
 */
export const createPost = async (type: PostType, content: string, imageUri?: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    let imageURL: string | undefined;

    if (imageUri) {
        imageURL = await uploadPostImage(imageUri, user.uid);
    }

    const postsRef = collection(db, 'posts');
    await addDoc(postsRef, {
        userId: user.uid,
        userName: user.displayName || 'Anoniem',
        userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}`,
        type,
        content,
        ...(imageURL && { imageURL }),
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp()
    });
};

/**
 * Toggle like on a post
 */
export const toggleLike = async (postId: string, isLiked: boolean): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
        likes: isLiked ? arrayUnion(user.uid) : arrayRemove(user.uid)
    });
};

/**
 * Subscribe to comments for a specific post
 */
export const subscribeToComments = (postId: string, onUpdate: (comments: PostComment[]) => void): Unsubscribe => {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PostComment));
        onUpdate(comments);
    });
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId: string, content: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const commentsRef = collection(db, 'posts', postId, 'comments');
    const postRef = doc(db, 'posts', postId);

    await addDoc(commentsRef, {
        postId,
        userId: user.uid,
        userName: user.displayName || 'Anoniem',
        userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}`,
        content,
        createdAt: serverTimestamp()
    });

    await updateDoc(postRef, {
        commentCount: increment(1)
    });
};
