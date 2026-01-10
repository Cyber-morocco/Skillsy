import {
    collection,
    collectionGroup,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    setDoc,
    serverTimestamp,
    query,
    orderBy,
    Timestamp,
    writeBatch,
    Unsubscribe,
    where,
} from 'firebase/firestore';
import { db, auth, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Skill, LearnSkill, AvailabilityDay, Review, UserProfile } from '../types';

const getCurrentUserId = (): string => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user.uid;
};

export const subscribeToUserProfile = (
    onProfileChange: (profile: UserProfile) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);

    return onSnapshot(
        userRef,
        (snapshot) => {
            if (snapshot.exists()) {
                onProfileChange({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
            }
        },
        (error) => {
            console.error('Error subscribing to user profile:', error);
            onError?.(error);
        }
    );
};

export const subscribeToOtherUserProfile = (
    userId: string,
    onProfileChange: (profile: UserProfile) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userRef = doc(db, 'users', userId);

    return onSnapshot(
        userRef,
        (snapshot) => {
            if (snapshot.exists()) {
                onProfileChange({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
            }
        },
        (error) => {
            console.error('Error subscribing to other user profile:', error);
            onError?.(error);
        }
    );
};

export const subscribeToSkills = (
    onSkillsChange: (skills: Skill[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    return subscribeToOtherUserSkills(userId, onSkillsChange, onError);
};

export const subscribeToOtherUserSkills = (
    userId: string,
    onSkillsChange: (skills: Skill[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const skillsRef = collection(db, 'users', userId, 'skills');

    return onSnapshot(
        skillsRef,
        (snapshot) => {
            const skills: Skill[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Skill));
            onSkillsChange(skills);
        },
        (error) => {
            console.error('Error subscribing to user skills:', error);
            onError?.(error);
        }
    );
};

export const fetchOtherUserSkills = async (userId: string): Promise<Skill[]> => {
    const skillsRef = collection(db, 'users', userId, 'skills');
    const snapshot = await getDocs(skillsRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Skill));
};

export const addSkill = async (skill: Omit<Skill, 'id'>): Promise<string> => {
    const userId = getCurrentUserId();
    const skillsRef = collection(db, 'users', userId, 'skills');
    const docRef = await addDoc(skillsRef, {
        ...skill,
        createdAt: serverTimestamp(),
    });
    await updateUserSkillNames(userId);
    return docRef.id;
};

export const addSkills = async (skills: Omit<Skill, 'id'>[]): Promise<void> => {
    const userId = getCurrentUserId();
    const batch = writeBatch(db);

    skills.forEach(skill => {
        const skillsRef = doc(collection(db, 'users', userId, 'skills'));
        batch.set(skillsRef, {
            ...skill,
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();
    await updateUserSkillNames(userId);
};

export const updateSkill = async (skillId: string, updates: Partial<Skill>): Promise<void> => {
    const userId = getCurrentUserId();
    const skillRef = doc(db, 'users', userId, 'skills', skillId);
    await updateDoc(skillRef, updates);
};

export const deleteSkill = async (skillId: string): Promise<void> => {
    const userId = getCurrentUserId();
    const skillRef = doc(db, 'users', userId, 'skills', skillId);
    await deleteDoc(skillRef);
    await updateUserSkillNames(userId);
};

export const updateUserSkillNames = async (userId: string): Promise<void> => {
    const skillsRef = collection(db, 'users', userId, 'skills');
    const snapshot = await getDocs(skillsRef);
    const skills = snapshot.docs.map(doc => doc.data() as Skill);
    const skillNames = skills.map(s => s.subject);
    const rootCategoryIds = Array.from(new Set(skills.map(s => s.rootId).filter(Boolean)));

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        skillNames,
        rootCategoryIds,
        updatedAt: serverTimestamp()
    });
};

export const subscribeToLearnSkills = (
    onSkillsChange: (skills: LearnSkill[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    return subscribeToOtherUserLearnSkills(userId, onSkillsChange, onError);
};

export const subscribeToOtherUserLearnSkills = (
    userId: string,
    onSkillsChange: (skills: LearnSkill[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const skillsRef = collection(db, 'users', userId, 'learnSkills');

    return onSnapshot(
        skillsRef,
        (snapshot) => {
            const skills: LearnSkill[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as LearnSkill));
            onSkillsChange(skills);
        },
        (error) => {
            console.error('Error subscribing to learn skills:', error);
            onError?.(error);
        }
    );
};

export const addLearnSkill = async (skill: Omit<LearnSkill, 'id'>): Promise<string> => {
    const userId = getCurrentUserId();
    const skillsRef = collection(db, 'users', userId, 'learnSkills');
    const docRef = await addDoc(skillsRef, {
        ...skill,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const deleteLearnSkill = async (skillId: string): Promise<void> => {
    const userId = getCurrentUserId();
    const skillRef = doc(db, 'users', userId, 'learnSkills', skillId);
    await deleteDoc(skillRef);
};

export const subscribeToAvailability = (
    onAvailabilityChange: (days: AvailabilityDay[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    const availabilityRef = doc(db, 'users', userId, 'availability', 'weekly');

    return onSnapshot(
        availabilityRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                onAvailabilityChange(data.days as AvailabilityDay[]);
            } else {
                onAvailabilityChange([
                    { name: 'Maandag', enabled: false, start: '08:00', end: '22:00' },
                    { name: 'Dinsdag', enabled: false, start: '08:00', end: '22:00' },
                    { name: 'Woensdag', enabled: false, start: '08:00', end: '22:00' },
                    { name: 'Donderdag', enabled: false, start: '08:00', end: '22:00' },
                    { name: 'Vrijdag', enabled: false, start: '08:00', end: '22:00' },
                    { name: 'Zaterdag', enabled: false, start: '08:00', end: '22:00' },
                    { name: 'Zondag', enabled: false, start: '08:00', end: '22:00' },
                ]);
            }
        },
        (error) => {
            console.error('Error subscribing to availability:', error);
            onError?.(error);
        }
    );
};

export const fetchUserAvailability = async (userId: string): Promise<AvailabilityDay[]> => {
    const availabilityRef = doc(db, 'users', userId, 'availability', 'weekly');
    const snapshot = await getDoc(availabilityRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        return data.days as AvailabilityDay[];
    }

    // Default fallback
    return [
        { name: 'Maandag', enabled: false, start: '08:00', end: '22:00' },
        { name: 'Dinsdag', enabled: false, start: '08:00', end: '22:00' },
        { name: 'Woensdag', enabled: false, start: '08:00', end: '22:00' },
        { name: 'Donderdag', enabled: false, start: '08:00', end: '22:00' },
        { name: 'Vrijdag', enabled: false, start: '08:00', end: '22:00' },
        { name: 'Zaterdag', enabled: false, start: '08:00', end: '22:00' },
        { name: 'Zondag', enabled: false, start: '08:00', end: '22:00' },
    ];
};

export const saveAvailability = async (days: AvailabilityDay[]): Promise<void> => {
    const userId = getCurrentUserId();
    const availabilityRef = doc(db, 'users', userId, 'availability', 'weekly');
    const userRef = doc(db, 'users', userId);

    const batch = writeBatch(db);
    batch.set(availabilityRef, {
        days,
        updatedAt: serverTimestamp(),
    });
    batch.update(userRef, {
        availabilityMode: 'weekly',
        updatedAt: serverTimestamp()
    });

    await batch.commit();
};

export const subscribeToSpecificDates = (
    onDatesChange: (dates: any[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    const datesRef = collection(db, 'users', userId, 'availability', 'specific', 'dates');
    const q = query(datesRef, orderBy('date', 'asc'));

    return onSnapshot(
        q,
        (snapshot) => {
            const dates = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
                };
            });
            onDatesChange(dates);
        },
        (error) => {
            console.error('Error subscribing to specific dates:', error);
            onError?.(error);
        }
    );
};

export const addSpecificDate = async (date: Date, start: string, end: string): Promise<string> => {
    const userId = getCurrentUserId();
    const datesRef = collection(db, 'users', userId, 'availability', 'specific', 'dates');
    const userRef = doc(db, 'users', userId);

    const docRef = await addDoc(datesRef, {
        date: Timestamp.fromDate(date),
        start,
        end,
        createdAt: serverTimestamp()
    });

    await updateDoc(userRef, {
        availabilityMode: 'specific',
        updatedAt: serverTimestamp()
    });

    return docRef.id;
};

export const fetchOtherUserSpecificDates = async (userId: string): Promise<any[]> => {
    const datesRef = collection(db, 'users', userId, 'availability', 'specific', 'dates');
    const q = query(datesRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        };
    });
};

export const updateSpecificDate = async (dateId: string, updates: Partial<{ date: Date, start: string, end: string }>): Promise<void> => {
    const userId = getCurrentUserId();
    const dateRef = doc(db, 'users', userId, 'availability', 'specific', 'dates', dateId);

    const firestoreUpdates: any = { ...updates };
    if (updates.date) {
        firestoreUpdates.date = Timestamp.fromDate(updates.date);
    }

    await updateDoc(dateRef, {
        ...firestoreUpdates,
        updatedAt: serverTimestamp()
    });
};

export const deleteSpecificDate = async (dateId: string): Promise<void> => {
    const userId = getCurrentUserId();
    const dateRef = doc(db, 'users', userId, 'availability', 'specific', 'dates', dateId);
    await deleteDoc(dateRef);
};

export const subscribeToOtherUserReviews = (
    userId: string,
    onReviewsChange: (reviews: Review[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const reviewsRef = collection(db, 'users', userId, 'reviews');

    return onSnapshot(
        reviewsRef,
        (snapshot) => {
            const reviews: Review[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Review));
            onReviewsChange(reviews);
        },
        (error) => {
            console.error('Error subscribing to user reviews:', error);
            onError?.(error);
        }
    );
};

export const saveReview = async (review: Omit<Review, 'id' | 'createdAt' | 'fromUserId'>): Promise<void> => {
    const userId = review.userId; // The user being reviewed
    const fromUserId = getCurrentUserId();
    const reviewsRef = collection(db, 'users', userId, 'reviews');
    await addDoc(reviewsRef, {
        ...review,
        fromUserId,
        createdAt: serverTimestamp()
    });
};

export const subscribeToTalents = (
    onTalentsChange: (talents: any[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const usersRef = collection(db, 'users');
    return onSnapshot(
        usersRef,
        (snapshot) => {
            const talents = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((u: any) => u.profileComplete && u.location && u.location.lat && u.location.lng);
            onTalentsChange(talents);
        },
        (error) => {
            console.error('Error subscribing to talents:', error);
            onError?.(error);
        }
    );
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });

    if (updates.displayName || updates.photoURL !== undefined) {
        try {
            // 1. Update Posts
            const postsRef = collection(db, 'posts');
            const postsQ = query(postsRef, where('userId', '==', userId));
            const postsSnap = await getDocs(postsQ);

            // 2. Update Chats
            const chatsRef = collection(db, 'chats');
            const chatsQ = query(chatsRef, where('participants', 'array-contains', userId));
            const chatsSnap = await getDocs(chatsQ);

            // 3. Update Matches
            const matchesRef = collection(db, 'matches');
            const matchesQ = query(matchesRef, where('fromUserId', '==', userId));
            const matchesSnap = await getDocs(matchesQ);

            // 4. Update Appointments (Tutor)
            const appointmentsRef = collection(db, 'appointments');
            const tutorAppQ = query(appointmentsRef, where('tutorId', '==', userId));
            const tutorAppSnap = await getDocs(tutorAppQ);

            // 5. Update Appointments (Student)
            const studentAppQ = query(appointmentsRef, where('studentId', '==', userId));
            const studentAppSnap = await getDocs(studentAppQ);

            // 6. Update Comments (Collection Group)
            const commentsQ = query(collectionGroup(db, 'comments'), where('userId', '==', userId));
            const commentsSnap = await getDocs(commentsQ);

            // 7. Update Reviews (Collection Group - where user is reviewer)
            const reviewsQ = query(collectionGroup(db, 'reviews'), where('fromUserId', '==', userId));
            const reviewsSnap = await getDocs(reviewsQ);

            const batch = writeBatch(db);

            // Sync Posts
            postsSnap.docs.forEach((postDoc) => {
                const postUpdate: any = {};
                if (updates.displayName) postUpdate.userName = updates.displayName;
                if (updates.photoURL !== undefined) postUpdate.userAvatar = updates.photoURL || `https://ui-avatars.com/api/?name=${updates.displayName || 'U'}`;
                batch.update(postDoc.ref, postUpdate);
            });

            // Sync Chats
            chatsSnap.docs.forEach((chatDoc) => {
                const chatUpdate: any = {};
                if (updates.displayName) {
                    chatUpdate[`participantInfo.${userId}.name`] = updates.displayName;
                    chatUpdate[`participantInfo.${userId}.initials`] = updates.displayName.charAt(0).toUpperCase();
                }
                if (updates.photoURL !== undefined) {
                    chatUpdate[`participantInfo.${userId}.photoURL`] = updates.photoURL;
                }
                batch.update(chatDoc.ref, chatUpdate);
            });

            // Sync Matches
            matchesSnap.docs.forEach((matchDoc) => {
                const matchUpdate: any = {};
                if (updates.displayName) matchUpdate.fromUserName = updates.displayName;
                if (updates.photoURL !== undefined) matchUpdate.fromUserAvatar = updates.photoURL;
                batch.update(matchDoc.ref, matchUpdate);
            });

            // Sync Appointments (Tutor)
            tutorAppSnap.docs.forEach((appDoc) => {
                const appUpdate: any = {};
                if (updates.displayName) appUpdate.tutorName = updates.displayName;
                if (updates.photoURL !== undefined) appUpdate.tutorAvatar = updates.photoURL;
                batch.update(appDoc.ref, appUpdate);
            });

            // Sync Appointments (Student)
            studentAppSnap.docs.forEach((appDoc) => {
                const appUpdate: any = {};
                if (updates.displayName) appUpdate.studentName = updates.displayName;
                if (updates.photoURL !== undefined) appUpdate.studentAvatar = updates.photoURL;
                batch.update(appDoc.ref, appUpdate);
            });

            // Sync Comments
            commentsSnap.docs.forEach((commentDoc) => {
                const commentUpdate: any = {};
                if (updates.displayName) commentUpdate.userName = updates.displayName;
                if (updates.photoURL !== undefined) commentUpdate.userAvatar = updates.photoURL || `https://ui-avatars.com/api/?name=${updates.displayName || 'U'}`;
                batch.update(commentDoc.ref, commentUpdate);
            });

            // Sync Reviews
            reviewsSnap.docs.forEach((reviewDoc) => {
                if (updates.displayName) {
                    batch.update(reviewDoc.ref, { fromName: updates.displayName });
                }
            });

            if (postsSnap.size > 0 || chatsSnap.size > 0 || matchesSnap.size > 0 || tutorAppSnap.size > 0 || studentAppSnap.size > 0 || commentsSnap.size > 0 || reviewsSnap.size > 0) {
                await batch.commit();
                console.log(`Synchronized profile updates across all collections (including comments and reviews)`);
            }
        } catch (error) {
            console.error('Error synchronizing profile updates:', error);
        }
    }
};

export const uploadProfileImage = async (uri: string): Promise<string> => {
    const userId = getCurrentUserId();
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profiles/${userId}`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
};

export const deleteProfileImage = async (): Promise<void> => {
    const userId = getCurrentUserId();
    const storageRef = ref(storage, `profiles/${userId}`);
    await deleteObject(storageRef);
    await updateUserProfile({ photoURL: "" });
};

export const uploadProfileVideo = async (uri: string, filename?: string): Promise<{ downloadURL: string; storagePath: string }> => {
    const userId = getCurrentUserId();
    const response = await fetch(uri);
    const blob = await response.blob();
    const name = filename || `${Date.now()}.mp4`;
    const storagePath = `profiles/${userId}/videos/${name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return { downloadURL, storagePath };
};

export const addProfileVideo = async (video: { title: string; description: string; downloadURL: string; storagePath: string; }): Promise<string> => {
    const userId = getCurrentUserId();
    const videosRef = collection(db, 'users', userId, 'videos');
    const docRef = await addDoc(videosRef, {
        ...video,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};
export const uploadVideo = async (uri: string, index: number): Promise<string> => {
    const userId = getCurrentUserId();
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `videos/${userId}/promo_${index}.mp4`);
    const metadata = {
        contentType: blob.type || 'video/mp4',
    };
    await uploadBytes(storageRef, blob, metadata);
    return getDownloadURL(storageRef);
};

export const deleteVideo = async (index: number): Promise<void> => {
    const userId = getCurrentUserId();
    const storageRef = ref(storage, `videos/${userId}/promo_${index}.mp4`);
    try {
        await deleteObject(storageRef);
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
            console.warn('Video not found in storage, proceeding to update profile.');
        } else {
            console.error('Error deleting video from storage:', error);

        }
    }
};
