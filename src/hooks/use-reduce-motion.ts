import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// docs/Moodlet_Design_Guide_v1.0.docx §9.1 — all animations disabled when the
// user enables the system "reduce motion" setting.
export function useReduceMotion(): boolean {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        let mounted = true;

        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            if (mounted) setReduceMotion(enabled);
        });

        const subscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setReduceMotion,
        );

        return () => {
            mounted = false;
            subscription.remove();
        };
    }, []);

    return reduceMotion;
}
