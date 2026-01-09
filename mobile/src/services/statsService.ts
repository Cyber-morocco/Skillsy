
import { collection, collectionGroup, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PlatformStats {
    activeUsers: number;
    totalSkills: number;
    completedSessions: number;
}

export const fetchPlatformStats = async (): Promise<PlatformStats> => {
    try {
        const usersColl = collection(db, 'users');
        const usersSnapshot = await getCountFromServer(usersColl);
        const activeUsers = usersSnapshot.data().count;

        const skillsColl = collectionGroup(db, 'skills');
        const skillsSnapshot = await getCountFromServer(skillsColl);
        const totalSkills = skillsSnapshot.data().count;

        const appointmentsColl = collection(db, 'appointments');
        const appointmentsSnapshot = await getCountFromServer(appointmentsColl);
        const completedSessions = appointmentsSnapshot.data().count;

        return {
            activeUsers,
            totalSkills,
            completedSessions
        };
    } catch (error: any) {
        console.error('Error fetching platform stats:', error);
        throw error;
    }
};
