import {
    Angry,
    Cloud,
    CloudRain,
    Flame,
    Heart,
    Moon,
    Smile,
    Sparkles,
    type LucideIcon,
} from 'lucide-react-native';

export type MoodId =
    | 'happy'
    | 'calm'
    | 'sad'
    | 'anxious'
    | 'loved'
    | 'tired'
    | 'excited'
    | 'angry';

export type MoodDefinition = {
    id: MoodId;
    label: string;
    /** Tint background — used only on entry cards and the check-in sheet, never on chrome. */
    tintBg: string;
    /** Tint accent — text/border/icon colour on top of the tint background. */
    tintAccent: string;
    Icon: LucideIcon;
};

// Canonical values — docs/Moodlet_Design_Guide_v1.0.docx §3.2 / §12
export const MOODS: MoodDefinition[] = [
    { id: 'happy', label: 'Happy', tintBg: '#FAEEDA', tintAccent: '#BA7517', Icon: Smile },
    { id: 'calm', label: 'Calm', tintBg: '#E1F5EE', tintAccent: '#1D9E75', Icon: Cloud },
    { id: 'sad', label: 'Sad', tintBg: '#E6F1FB', tintAccent: '#378ADD', Icon: CloudRain },
    { id: 'anxious', label: 'Anxious', tintBg: '#FAECE7', tintAccent: '#D85A30', Icon: Sparkles },
    { id: 'loved', label: 'Loved', tintBg: '#FBEAF0', tintAccent: '#D4537E', Icon: Heart },
    { id: 'tired', label: 'Tired', tintBg: '#F1EFE8', tintAccent: '#888780', Icon: Moon },
    { id: 'excited', label: 'Excited', tintBg: '#EAF3DE', tintAccent: '#639922', Icon: Flame },
    { id: 'angry', label: 'Angry', tintBg: '#FCEBEB', tintAccent: '#E24B4A', Icon: Angry },
];

export const MOOD_MAP: Record<MoodId, MoodDefinition> = MOODS.reduce(
    (acc, mood) => ({ ...acc, [mood.id]: mood }),
    {} as Record<MoodId, MoodDefinition>,
);
