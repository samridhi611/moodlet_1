import { Redirect, Tabs } from "expo-router";
import React from "react";

import { useAuth } from "@/context/AuthContext";
import { usePalette } from "@/context/PaletteContext";

import BottomBar from "@/components/ui/layout-components/bottombar"; // 👈 your custom component

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  const { tokens } = usePalette();

  if (!isSignedIn) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <BottomBar {...props} />} // 👈 KEY CHANGE
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />
    </Tabs>
  );
}