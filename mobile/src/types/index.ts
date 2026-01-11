export type SkillLevel = 'Beginner' | 'Gevorderd' | 'Expert';

export interface Skill {
    id: string;
    subject: string;
    level: SkillLevel;
    price?: string;
    type?: 'paid' | 'swap';
    rootId?: string;
}

export interface LearnSkill {
    id: string;
    subject: string;
    rootId?: string;
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
    firstName?: string;
    lastName?: string;
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
    availabilityMode?: 'weekly' | 'specific';
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
    rootCategoryIds?: string[];
    learnSkillSubjects?: string[];
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
    type?: 'text' | 'appointmentRequest' | 'info';
    duration?: number;
    proposedPrice?: number;
    matchType?: 'pay' | 'swap';
    swapSkillName?: string;
    tutorSkillName?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentStatus?: 'pending' | 'accepted' | 'rejected' | 'countered';
    dateKey?: string;
    startTimeMinutes?: number;
    endTimeMinutes?: number;
    tutorId?: string;
    studentId?: string;
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
    dateKey: string; // YYYY-MM-DD for easier querying
    time: string;
    startTimeMinutes: number; // minutes from midnight
    endTimeMinutes: number;
    duration: number; // in hours
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    paymentStatus: 'none' | 'pending' | 'escrow' | 'released';
    price: number;
    type: 'pay' | 'swap';
    swapSkillId?: string;
    swapSkillName?: string;
    tutorSkillName?: string;
    location: 'fysiek' | 'online';
    confirmations: {
        studentConfirmed: boolean;
        tutorConfirmed: boolean;
    };
    availabilityMode?: 'weekly' | 'specific';
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
    fromUserId: string;
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
