// Shared TypeScript types for Skillsy app

// User skill levels
export type SkillLevel = 'Beginner' | 'Gevorderd' | 'Expert';

// A skill the user can teach
export interface Skill {
    id: string;
    subject: string;
    level: SkillLevel;
    price: string;
}

// A skill the user wants to learn
export interface LearnSkill {
    id: string;
    subject: string;
}

// User profile data
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

// Availability day configuration
export interface AvailabilityDay {
    name: string;
    enabled: boolean;
    start: string;
    end: string;
}

// Talent shown on explore map
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

// Chat contact/conversation
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

// Chat message
export interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: Date;
    read: boolean;
}

// Appointment data
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
