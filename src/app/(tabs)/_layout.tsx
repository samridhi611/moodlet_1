import * as Linking from "expo-linking";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

import { StreakConfetti } from "@/components/celebration/streak-confetti";
import { CheckInSheet } from "@/components/checkin/check-in-sheet";
import { EditEntrySheet } from "@/components/checkin/edit-entry-sheet";
import BottomBar from "@/components/ui/layout-components/bottombar";
import { useCheckInSheet } from "@/context/CheckInSheetContext";
import { useEntries } from "@/context/EntriesContext";
import { MOOD_MAP, MoodId } from "@/theme/moods";
import { WidgetSync } from "@/widgets/WidgetSync";

// Quick-log tiles on the mood widget (src/widgets/MoodCheckInWidget.tsx) fire
// `moodlet://check-in?mood=<id>` via an OPEN_URI clickAction. That deep link
// is handled here rather than as its own route, since it doesn't navigate
// anywhere — a tap should just log the mood and land on Home, Duolingo-style.
function useWidgetQuickLog() {
  const { addEntry } = useEntries();

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      if (parsed.hostname !== "check-in") return;

      const mood = parsed.queryParams?.mood;
      if (typeof mood !== "string" || !(mood in MOOD_MAP)) return;

      addEntry({ mood: mood as MoodId, activities: [], note: null }).catch(() => {});
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const subscription = Linking.addEventListener("url", handleUrl);
    return () => subscription.remove();
  }, [addEntry]);
}

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  const { isOpen, open } = useCheckInSheet();
  useWidgetQuickLog();

  if (!isSignedIn) {
    return <Redirect href="/welcome" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => (
          <BottomBar {...props} onOpenMoodSheet={open} isMoodSheetOpen={isOpen} />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: "Friends",
          }}
        />
        <Tabs.Screen
          name="memories"
          options={{
            title: "Memories",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
      <CheckInSheet />
      <EditEntrySheet />
      <StreakConfetti />
      <WidgetSync />
    </>
  );
}
