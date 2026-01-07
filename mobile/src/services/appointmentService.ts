import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Unsubscribe,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Appointment } from '../types';

export const createAppointment = async (appointmentData: Partial<Appointment>): Promise<string> => {
    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        status: 'confirmed', 
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const subscribeToAppointments = (
    userId: string,
    onUpdate: (appointments: Appointment[]) => void
): Unsubscribe => {
    
    const q = query(
        collection(db, 'appointments'),
        where('participantIds', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
            } as Appointment;
        });

        appointments.sort((a, b) => {
            return (a.date > b.date) ? 1 : -1;
        });

        onUpdate(appointments);
    });
};

export const updateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'pending' | 'cancelled' | 'completed'): Promise<void> => {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { status });
};
