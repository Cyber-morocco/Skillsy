export type SkillLevel = 'Beginner' | 'Gevorderd' | 'Expert';

export interface Skill {
    id: string;
    subject: string;
    level: SkillLevel;
    price: string;
    type?: 'paid' | 'swap';
}

export interface LearnSkill {
    id: string;
    subject: string;
}

export interface PromoVideo {
    url: string;
    title: string;
    description: string;
}

export type PostType = 'Vraag' | 'Succes' | 'Materiaal';

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: PostType;
    content: string;
    imageURL?: string;
    likes: string[];
    commentCount: number;
    createdAt: any;
}

export interface PostComment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: any;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    profileComplete: boolean;
    photoURL?: string | null;
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
    promoVideos?: PromoVideo[];
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
    skills?: { name: string }[];
    skillNames?: string[];
    skillsWithPrices?: { subject: string; price: string }[];
    location?: {
        city?: string;
        street?: string;
    };
    averageRating?: number;
    reviewCount?: number;
    isActive: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    participantInfo: {
        [userId: string]: {
            name: string;
            initials: string;
            avatarColor: string;
            photoURL?: string;
        }
    };
    lastMessage?: string;
    lastMessageTime?: any;
    unreadCount?: { [userId: string]: number };
    updatedAt: any;
    status?: 'pending' | 'active' | 'rejected';
    matchInitiatorId?: string;
}

export interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
    type?: 'text' | 'appointmentRequest';
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface MatchRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserAvatar?: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'rejected';
    subject: string;
    createdAt: any;
}

export interface Appointment {
    id: string;
    tutorId: string;
    studentId: string;
    participantIds: string[];
    tutorName?: string;
    tutorAvatar?: string;
    studentName?: string;
    studentAvatar?: string;
    title: string;
    subtitle: string;
    date: string;
    time: string;
    location: 'fysiek' | 'online';
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    initials: string;
    fee?: number;
    address?: string;
    description?: string;
    tutorPhone?: string;
    tutorEmail?: string;
    createdAt: any;
    reviewedByStudent?: boolean;
    reviewedByTutor?: boolean;
}

export interface Review {
    id: string;
    userId: string;
    fromName: string;
    rating: number;
    createdAt: any;
}

export interface Location {
    lat: number;
    lng: number;
    address?: string;
}

export interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
}
