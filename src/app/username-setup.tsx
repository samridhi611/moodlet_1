import { BackButton } from '@/components/ui/back-button';
import { UsernameInput } from '@/components/ui/inputs/user-name-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { usePalette } from '@/context/PaletteContext';
import { useProfile } from '@/context/ProfileContext';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function UsernameSetupScreen() {
  const { saveUsername, profile } = useProfile()
  const { colors, styles: s } = usePalette();

  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(profile)

  const cleanedUsername = useMemo(() => username.trim().replace(/\s+/g, ' '), [username]);
  const canSubmit = cleanedUsername.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await saveUsername(cleanedUsername);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[s.layout.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.layout.flex1}
      >
        <View style={[s.layout.screenPad, s.layout.flex1]}>
          <View style={styles.nav}>
            <Link href="/welcome" asChild>
              <BackButton onPress={() => { }} />
            </Link>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={s.type.kicker}>one last thing</Text>
              <Text style={s.type.screenTitle}>
                {/* Hey {profile?.user_metadata?.full_name}, pick a username */}
              </Text>
              <Text style={s.type.subtitle}>
                This is how others will see you on Moodlet.
              </Text>
            </View>

            <View style={styles.form}>
              <UsernameInput
                value={username}
                onChange={(val) => { setError(null); setUsername(val); }}
                onSubmit={canSubmit ? handleSubmit : undefined}
                error={error}
                disabled={isSubmitting}
              />
              <PrimaryButton
                label="Let's go"
                onPress={handleSubmit}
                disabled={!canSubmit}
                loading={isSubmitting}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nav: {
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    gap: 34,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  header: {
    gap: 9,
  },
  form: {
    gap: 20,
  },
});