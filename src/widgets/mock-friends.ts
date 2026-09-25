import { FriendMoodEntry } from './widget-data';

// Friends is a "coming soon" tab with no backend yet (see src/app/(tabs)/friends.tsx),
// so the friends widget is seeded with sample data until the real friends/social
// layer (docs/Moodlet_Design_Guide_v1.0.docx §2.3) ships.
export const MOCK_FRIENDS: FriendMoodEntry[] = [
    { id: 'mock-1', name: 'Aanya', mood: 'excited', timeLabel: 'Just now' },
    { id: 'mock-2', name: 'Rohan', mood: 'calm', timeLabel: '2h ago' },
    { id: 'mock-3', name: 'Priya', mood: 'tired', timeLabel: '5h ago' },
    { id: 'mock-4', name: 'Dev', mood: 'loved', timeLabel: 'Yesterday' },
];
