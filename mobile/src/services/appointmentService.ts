import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    Unsubscribe,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Appointment } from '../types';

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> => {
    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

/**
 * Subscribe to appointments for the current user
 * Returns appointments where the user is a participant
 */
export const subscribeToAppointments = (userId: string, onUpdate: (appointments: Appointment[]) => void): Unsubscribe => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
        appointmentsRef,
        where('participantIds', 'array-contains', userId),
        orderBy('date', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Handle complex types if necessary
            } as Appointment;
        });
        onUpdate(appointments);
    });
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']): Promise<void> => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
        status,
        updatedAt: serverTimestamp()
    });
};
