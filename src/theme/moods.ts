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
import { MOOD_INFO, type MoodId, type MoodInfo } from './mood-data';

export type { MoodId };

export type MoodDefinition = MoodInfo & {
    Icon: LucideIcon;
};

// Icon layer on top of mood-data.ts's MOOD_INFO (which already carries
// tintBg/tintAccent/score — plain hex/numbers, safe for the headless widget
// bundle). Kept apart so widget code (src/widgets/) can depend on the
// label/score/tint data without dragging lucide-react-native into its
// headless render context. See mood-data.ts for why.
const MOOD_ICONS: Record<MoodId, LucideIcon> = {
    happy: Smile,
    calm: Cloud,
    sad: CloudRain,
    anxious: Sparkles,
    loved: Heart,
    tired: Moon,
    excited: Flame,
    angry: Angry,
};

// Canonical values — docs/Moodlet_Design_Guide_v1.0.docx §3.2 / §12
export const MOODS: MoodDefinition[] = MOOD_INFO.map((info) => ({ ...info, Icon: MOOD_ICONS[info.id] }));

export const MOOD_MAP: Record<MoodId, MoodDefinition> = MOODS.reduce(
    (acc, mood) => ({ ...acc, [mood.id]: mood }),
    {} as Record<MoodId, MoodDefinition>,
);
