export type SkillLevel = 'Beginner' | 'Gevorderd' | 'Expert';

export interface Skill {
    id: string;
    subject: string;
    level: SkillLevel;
    price: string;
}

export interface LearnSkill {
    id: string;
    subject: string;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    profileComplete: boolean;
    photoURL?: string;
    bio?: string;
    location?: {
        lat?: number;
        lng?: number;
        address?: string;
        street?: string;
        zipCode?: string;
        city?: string;
    };
    createdAt: any;
}

export interface AvailabilityDay {
    name: string;
    enabled: boolean;
    start: string;
    end: string;
}

export interface Talent {
    id: string;
    userId: string;
    name: string;
    shortBio: string;
    avatar: string;
    lat: number;
    lng: number;
    skills: { name: string }[];
    isActive: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    participantNames: { [userId: string]: string };
    participantInitials: { [userId: string]: string };
    participantColors: { [userId: string]: string };
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: { [userId: string]: number };
}

export interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: Date;
    read: boolean;
}

export interface Appointment {
    id: string;
    tutorId: string;
    studentId: string;
    title: string;
    subtitle: string;
    date: string;
    time: string;
    location: 'fysiek' | 'online';
    status: 'confirmed' | 'pending' | 'cancelled';
    initials: string;
    fee?: number;
    address?: string;
    description?: string;
    tutorPhone?: string;
    tutorEmail?: string;
    createdAt: Date;
}

export interface Review {
    id: string;
    reviewerName: string;
    reviewerAvatar?: string;
    rating: number; // Overall average
    questions: {
        q1: number;
        q2: number;
        q3: number;
    };
    createdAt: Date;
    text?: string; // Optional text if we ever re-add it
}
