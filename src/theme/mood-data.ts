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
};

// Icon-free subset of theme/moods.ts's MOOD_MAP. Kept separate — and free of
// any lucide-react-native import — because Android widget code (src/widgets/)
// runs headless via react-native-android-widget, which only supports
// FlexWidget/TextWidget/ImageWidget primitives. Pulling in lucide-react-native
// (and its react-native-svg native dependency) transitively through this data
// left widgets rendering blank; widget files must import MoodId/label/score
// from here, never from theme/moods.ts.
//
// Canonical values — docs/Moodlet_Design_Guide_v1.0.docx §3.2 / §12
export const MOOD_INFO: MoodInfo[] = [
    { id: 'happy', label: 'Happy', score: 7 },
    { id: 'calm', label: 'Calm', score: 5 },
    { id: 'sad', label: 'Sad', score: 2 },
    { id: 'anxious', label: 'Anxious', score: 3 },
    { id: 'loved', label: 'Loved', score: 6 },
    { id: 'tired', label: 'Tired', score: 4 },
    { id: 'excited', label: 'Excited', score: 8 },
    { id: 'angry', label: 'Angry', score: 1 },
];

export const MOOD_INFO_MAP: Record<MoodId, MoodInfo> = MOOD_INFO.reduce(
    (acc, mood) => ({ ...acc, [mood.id]: mood }),
    {} as Record<MoodId, MoodInfo>,
);
