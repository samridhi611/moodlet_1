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
import { MOOD_INFO, type MoodId } from './mood-data';

export type { MoodId };

export type MoodDefinition = {
    id: MoodId;
    label: string;
    /** Tint background — used only on entry cards and the check-in sheet, never on chrome. */
    tintBg: string;
    /** Tint accent — text/border/icon colour on top of the tint background. */
    tintAccent: string;
    Icon: LucideIcon;
    /**
     * Valence ranking (1-8, low-to-high) used for averages/comparisons —
     * hourly mood average, "N/M vibing" friend counts, week mood-wave, etc.
     * A judgment call, easy to retune; not shown to users directly.
     */
    score: number;
};

// Icon/tint layer on top of mood-data.ts's plain MOOD_INFO — kept apart so
// widget code (src/widgets/) can depend on the label/score data without
// dragging lucide-react-native into its headless render context. See
// mood-data.ts for why.
const MOOD_CHROME: Record<MoodId, { tintBg: string; tintAccent: string; Icon: LucideIcon }> = {
    happy: { tintBg: '#FAEEDA', tintAccent: '#BA7517', Icon: Smile },
    calm: { tintBg: '#E1F5EE', tintAccent: '#1D9E75', Icon: Cloud },
    sad: { tintBg: '#E6F1FB', tintAccent: '#378ADD', Icon: CloudRain },
    anxious: { tintBg: '#FAECE7', tintAccent: '#D85A30', Icon: Sparkles },
    loved: { tintBg: '#FBEAF0', tintAccent: '#D4537E', Icon: Heart },
    tired: { tintBg: '#F1EFE8', tintAccent: '#888780', Icon: Moon },
    excited: { tintBg: '#EAF3DE', tintAccent: '#639922', Icon: Flame },
    angry: { tintBg: '#FCEBEB', tintAccent: '#E24B4A', Icon: Angry },
};

// Canonical values — docs/Moodlet_Design_Guide_v1.0.docx §3.2 / §12
export const MOODS: MoodDefinition[] = MOOD_INFO.map((info) => ({ ...info, ...MOOD_CHROME[info.id] }));

export const MOOD_MAP: Record<MoodId, MoodDefinition> = MOODS.reduce(
    (acc, mood) => ({ ...acc, [mood.id]: mood }),
    {} as Record<MoodId, MoodDefinition>,
);
