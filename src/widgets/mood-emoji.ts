import { MoodId } from '@/theme/moods';

// Widget primitives (FlexWidget/TextWidget) can't render lucide-react-native
// icons, so widgets use emoji stand-ins for the same 8 moods instead.
export const MOOD_EMOJI: Record<MoodId, string> = {
    happy: '🙂',
    calm: '🌿',
    sad: '🌧️',
    anxious: '✨',
    loved: '💕',
    tired: '😴',
    excited: '🤩',
    angry: '😠',
};
