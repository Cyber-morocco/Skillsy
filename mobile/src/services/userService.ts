import {
    collection,
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
    const skillNames = snapshot.docs.map(doc => (doc.data() as Skill).subject);

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        skillNames,
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
    await setDoc(availabilityRef, {
        days,
        updatedAt: serverTimestamp(),
    });
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
    const docRef = await addDoc(datesRef, {
        date: Timestamp.fromDate(date),
        start,
        end,
        createdAt: serverTimestamp()
    });
    return docRef.id;
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

export const saveReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<void> => {
    const userId = review.userId; // The user being reviewed
    const reviewsRef = collection(db, 'users', userId, 'reviews');
    await addDoc(reviewsRef, {
        ...review,
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
    await deleteObject(storageRef);
};
