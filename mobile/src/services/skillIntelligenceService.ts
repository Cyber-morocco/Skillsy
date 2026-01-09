import { ROOT_CATEGORIES } from '../constants/categories';

// IMPORTANT: Replace this with your computer's local IP address
// You can find it by running 'ipconfig' on Windows
const LOCAL_PC_IP = "172.20.10.2"; // Placeholder, user will change this
const API_URL = `http://${LOCAL_PC_IP}:8000`;

export interface SkillResolutionResult {
    type: 'auto_map' | 'nudge' | 'discovery' | 'creation_required' | 'error';
    match?: {
        concept: {
            id: string;
            label: string;
            rootId: string;
            usage: number;
        };
        score: number;
    };
    suggestions?: Array<{
        concept: {
            id: string;
            label: string;
            rootId: string;
            usage: number;
        };
        score: number;
    }>;
    proposed?: {
        label: string;
        rootId: string;
        rootLabel: string;
    };
    isWebAugmented?: boolean;
    message?: string;
}

export const resolveSkillIntelligence = async (text: string): Promise<SkillResolutionResult> => {
    try {
        const response = await fetch(`${API_URL}/resolve-skill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, locale: 'nl' }),
        });

        if (!response.ok) {
            throw new Error('Intelligence service unreachable');
        }

        return await response.json();
    } catch (error) {
        console.error('Skill Intelligence Error:', error);
        return { type: 'error', message: 'Kan geen verbinding maken met de lokale LLM service.' };
    }
};

export const AbilityLevelLabels = {
    1: 'Ik kan een beginner initiëren',
    2: 'Ik kan helpen verbeteren',
    3: 'Ik kan gevorderden coachen',
};
