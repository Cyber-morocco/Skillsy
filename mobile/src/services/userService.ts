import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    setDoc,
    serverTimestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { db, auth, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Skill, LearnSkill, AvailabilityDay } from '../types';

const getCurrentUserId = (): string => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user.uid;
};

export const subscribeToUserProfile = (
    onProfileChange: (profile: any) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);

    return onSnapshot(
        userRef,
        (snapshot) => {
            if (snapshot.exists()) {
                onProfileChange({ uid: snapshot.id, ...snapshot.data() });
            } else {
                onProfileChange(null);
            }
        },
        (error) => {
            console.error('Error subscribing to user profile:', error);
            onError?.(error);
        }
    );
};

export const subscribeToSkills = (
    onSkillsChange: (skills: Skill[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
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
            console.error('Error subscribing to skills:', error);
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
    return docRef.id;
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
};

export const subscribeToLearnSkills = (
    onSkillsChange: (skills: LearnSkill[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const userId = getCurrentUserId();
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

export const saveAvailability = async (days: AvailabilityDay[]): Promise<void> => {
    const userId = getCurrentUserId();
    const availabilityRef = doc(db, 'users', userId, 'availability', 'weekly');
    await setDoc(availabilityRef, {
        days,
        updatedAt: serverTimestamp(),
    });
};

export const updateUserProfile = async (updates: any): Promise<void> => {
    const userId = getCurrentUserId();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

export const uploadProfileImage = async (uri: string): Promise<string> => {
    const userId = getCurrentUserId();

    // For React Native, we need to convert the file URI to a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileRef = ref(storage, `profile_images/${userId}`);
    await uploadBytes(fileRef, blob);

    return await getDownloadURL(fileRef);
};

export const deleteProfileImage = async (): Promise<void> => {
    const userId = getCurrentUserId();
    const fileRef = ref(storage, `profile_images/${userId}`);
    try {
        await deleteObject(fileRef);
    } catch (error: any) {
        // If the file doesn't exist, we can ignore the error
        if (error.code !== 'storage/object-not-found') {
            throw error;
        }
    }
};
