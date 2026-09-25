import { FriendMoodEntry } from './widget-data';

// Friends is a "coming soon" tab with no backend yet (see src/app/(tabs)/friends.tsx),
// so the friends widget is seeded with sample data until the real friends/social
// layer (docs/Moodlet_Design_Guide_v1.0.docx §2.3) ships.
export const MOCK_FRIENDS: FriendMoodEntry[] = [
    {
        id: 'mock-1',
        name: 'Aanya',
        mood: 'excited',
        avatarColor: '#FF9F5A',
        status: 'shipped my first app 🚀',
        minutesAgo: 4,
        reacted: false,
    },
    {
        id: 'mock-2',
        name: 'Rohan',
        mood: 'calm',
        avatarColor: '#8E6CFF',
        status: 'sunday morning walk',
        minutesAgo: 120,
        reacted: false,
    },
    {
        id: 'mock-3',
        name: 'Priya',
        mood: 'tired',
        avatarColor: '#3DDC97',
        status: 'exam szn 😴',
        minutesAgo: 300,
        reacted: false,
    },
    {
        id: 'mock-4',
        name: 'Dev',
        mood: 'loved',
        avatarColor: '#FF5C8A',
        status: 'anniversary dinner tonight',
        minutesAgo: 1380,
        reacted: false,
    },
];
