export interface RootCategory {
    id: string;
    name: {
        nl: string;
        en: string;
    };
    icon: string;
    color: string;
}

export const ROOT_CATEGORIES: RootCategory[] = [
    { id: 'muziek', name: { nl: 'Muziek', en: 'Music' }, icon: 'musical-note', color: '#6366f1' },
    { id: 'sport', name: { nl: 'Sport & Fitness', en: 'Sports & Fitness' }, icon: 'fitness', color: '#10b981' },
    { id: 'talen', name: { nl: 'Talen', en: 'Languages' }, icon: 'language', color: '#f59e0b' },
    { id: 'academisch', name: { nl: 'Academisch', en: 'Academic' }, icon: 'book', color: '#3b82f6' },
    { id: 'creatief', name: { nl: 'Creatief & Kunst', en: 'Creative & Art' }, icon: 'brush', color: '#ec4899' },
    { id: 'tech', name: { nl: 'Technology & Dev', en: 'Technology & Dev' }, icon: 'code-slash', color: '#06b6d4' },
    { id: 'design', name: { nl: 'Design & Multimedia', en: 'Design & Multimedia' }, icon: 'color-palette', color: '#8b5cf6' },
    { id: 'koken', name: { nl: 'Koken & Culinaire', en: 'Cooking & Culinary' }, icon: 'restaurant', color: '#ef4444' },
    { id: 'business', name: { nl: 'Business & Marketing', en: 'Business & Marketing' }, icon: 'briefcase', color: '#14b8a6' },
    { id: 'zorg', name: { nl: 'Gezondheid & Zorg', en: 'Health & Care' }, icon: 'heart', color: '#f43f5e' },
    { id: 'ambacht', name: { nl: 'Ambacht & DIY', en: 'Craft & DIY' }, icon: 'hammer', color: '#78350f' },
    { id: 'fotografie', name: { nl: 'Fotografie & Video', en: 'Photography & Video' }, icon: 'camera', color: '#64748b' },
    { id: 'overig', name: { nl: 'Overig', en: 'Other' }, icon: 'apps', color: '#94a3b8' },
];
