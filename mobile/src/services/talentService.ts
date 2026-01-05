import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Talent } from '../types';

export const getTalents = async (): Promise<Talent[]> => {
    const talentsRef = collection(db, 'talents');
    const q = query(talentsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Talent));
};

export const subscribeToTalents = (
    onTalentsChange: (talents: Talent[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const talentsRef = collection(db, 'talents');
    const q = query(talentsRef, where('isActive', '==', true));

    return onSnapshot(
        q,
        (snapshot) => {
            const talents: Talent[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Talent));
            onTalentsChange(talents);
        },
        (error) => {
            console.error('Error subscribing to talents:', error);
            onError?.(error);
        }
    );
};
