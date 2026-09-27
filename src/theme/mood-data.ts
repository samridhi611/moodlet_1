export type MoodId =
    | 'happy'
    | 'calm'
    | 'sad'
    | 'anxious'
    | 'loved'
    | 'tired'
    | 'excited'
    | 'angry';

export type MoodInfo = {
    id: MoodId;
    label: string;
    /**
     * Valence ranking (1-8, low-to-high) used for averages/comparisons —
     * hourly mood average, "N/M vibing" friend counts, week mood-wave, etc.
     * A judgment call, easy to retune; not shown to users directly.
     */
    score: number;
    /** Tint background — pale per-mood color, safe for widget chrome (plain hex, no icon attached). */
    tintBg: string;
    /** Tint accent — the saturated counterpart, used for text/bars/rings on top of tintBg. */
    tintAccent: string;
};

// Icon-free subset of theme/moods.ts's MOOD_MAP. Kept separate — and free of
// any lucide-react-native import — because Android widget code (src/widgets/)
// runs headless via react-native-android-widget, which only supports
// FlexWidget/TextWidget/ImageWidget primitives. Pulling in lucide-react-native
// (and its react-native-svg native dependency) transitively through this data
// left widgets rendering blank; widget files must import MoodId/label/score
// from here, never from theme/moods.ts. tintBg/tintAccent are plain hex
// strings (no icon), so widgets CAN use them for per-mood color coding —
// theme/moods.ts's MOOD_CHROME just adds the lucide Icon on top of these.
//
// Canonical values — docs/Moodlet_Design_Guide_v1.0.docx §3.2 / §12
export const MOOD_INFO: MoodInfo[] = [
    { id: 'happy', label: 'Happy', score: 7, tintBg: '#FAEEDA', tintAccent: '#BA7517' },
    { id: 'calm', label: 'Calm', score: 5, tintBg: '#E1F5EE', tintAccent: '#1D9E75' },
    { id: 'sad', label: 'Sad', score: 2, tintBg: '#E6F1FB', tintAccent: '#378ADD' },
    { id: 'anxious', label: 'Anxious', score: 3, tintBg: '#FAECE7', tintAccent: '#D85A30' },
    { id: 'loved', label: 'Loved', score: 6, tintBg: '#FBEAF0', tintAccent: '#D4537E' },
    { id: 'tired', label: 'Tired', score: 4, tintBg: '#F1EFE8', tintAccent: '#888780' },
    { id: 'excited', label: 'Excited', score: 8, tintBg: '#EAF3DE', tintAccent: '#639922' },
    { id: 'angry', label: 'Angry', score: 1, tintBg: '#FCEBEB', tintAccent: '#E24B4A' },
];

export const MOOD_INFO_MAP: Record<MoodId, MoodInfo> = MOOD_INFO.reduce(
    (acc, mood) => ({ ...acc, [mood.id]: mood }),
    {} as Record<MoodId, MoodInfo>,
);
