import { usePalette } from '@/context/PaletteContext';
import { fontFamily, PaletteColors } from '@/theme/design';
import { Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function FriendsScreen() {
  const { colors } = usePalette();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <Users size={28} color={colors.primaryDark} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Friends is on its way</Text>
        <Text style={styles.copy}>
          Soon you&apos;ll be able to share moods with close friends, pin a special someone to your
          home screen, and see when they check in.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: PaletteColors) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      paddingHorizontal: 40,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 20,
      textAlign: 'center',
    },
    copy: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
    },
  });
