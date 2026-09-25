import {
    Briefcase,
    Dumbbell,
    Film,
    HeartPulse,
    Home,
    Moon,
    Palette,
    Plane,
    UsersRound,
    Utensils,
    type LucideIcon,
} from 'lucide-react-native';

export type ActivityId =
    | 'work'
    | 'family'
    | 'friends'
    | 'exercise'
    | 'sleep'
    | 'food'
    | 'hobby'
    | 'travel'
    | 'health'
    | 'entertainment';

export type ActivityDefinition = {
    id: ActivityId;
    label: string;
    Icon: LucideIcon;
};

// docs/Moodlet_Design_Guide_v1.0.docx §7.3 — icon-based, categorised activity chips
export const ACTIVITIES: ActivityDefinition[] = [
    { id: 'work', label: 'Work', Icon: Briefcase },
    { id: 'family', label: 'Family', Icon: Home },
    { id: 'friends', label: 'Friends', Icon: UsersRound },
    { id: 'exercise', label: 'Exercise', Icon: Dumbbell },
    { id: 'sleep', label: 'Sleep', Icon: Moon },
    { id: 'food', label: 'Food', Icon: Utensils },
    { id: 'hobby', label: 'Hobby', Icon: Palette },
    { id: 'travel', label: 'Travel', Icon: Plane },
    { id: 'health', label: 'Health', Icon: HeartPulse },
    { id: 'entertainment', label: 'Fun', Icon: Film },
];

export const ACTIVITY_MAP: Record<ActivityId, ActivityDefinition> = ACTIVITIES.reduce(
    (acc, activity) => ({ ...acc, [activity.id]: activity }),
    {} as Record<ActivityId, ActivityDefinition>,
);
