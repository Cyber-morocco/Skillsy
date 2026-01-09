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

    // Filter out undefined values as Firestore doesn't support them
    const sanitizedData = Object.fromEntries(
        Object.entries(appointmentData).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(appointmentsRef, {
        ...sanitizedData,
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
export const updateAppointmentReviewStatus = async (appointmentId: string, role: 'student' | 'tutor'): Promise<void> => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const updateData = role === 'student' ? { reviewedByStudent: true } : { reviewedByTutor: true };
    await updateDoc(appointmentRef, {
        ...updateData,
        updatedAt: serverTimestamp()
    });
};

export const updateAppointmentPaymentStatus = async (appointmentId: string, paymentStatus: Appointment['paymentStatus']): Promise<void> => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
        paymentStatus,
        updatedAt: serverTimestamp()
    });
};

export const updateAppointmentConfirmations = async (appointmentId: string, role: 'student' | 'tutor'): Promise<void> => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const field = role === 'student' ? 'confirmations.studentConfirmed' : 'confirmations.tutorConfirmed';
    await updateDoc(appointmentRef, {
        [field]: true,
        updatedAt: serverTimestamp()
    });
};
