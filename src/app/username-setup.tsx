import { Link, Redirect } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextInput as TextInputType,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { usePalette } from '@/context/PaletteContext';
import { createPaletteColors, fontFamily, PaletteColors } from '@/theme/design';
import { ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const { isSignedIn, continueAsGuest } = useAuth();
  const { tokens } = usePalette();
  const colors = useMemo(() => createPaletteColors(tokens), [tokens]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const inputRef = useRef<TextInputType>(null);
  const [username, setUsername] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanedUsername = useMemo(() => username.trim().replace(/\s+/g, ' '), [username]);
  const canSubmit = cleanedUsername.length > 0 && !isSubmitting;

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await continueAsGuest(cleanedUsername);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Nav */}
          <View style={styles.nav}>
            <Link href="/welcome" asChild>
              <Pressable
                style={({ pressed, hovered }) => [
                  styles.backButton,
                  hovered && styles.backButtonHovered,
                  pressed && styles.backButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <View style={styles.backContent}>
                  <ArrowLeft size={18} color={colors.buttonText} strokeWidth={2} />
                  <Text style={styles.backButtonText}>Back</Text>
                </View>
              </Pressable>
            </Link>
          </View>

          {/* Body */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.kicker}>set your vibe</Text>
              <Text style={styles.title}>What should Moodlet call you?</Text>
              <Text style={styles.subtitle}>Pick a name to get started — no account needed.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isInputFocused && styles.labelFocused]}>Username</Text>
                <Pressable
                  disabled={isSubmitting}
                  onHoverIn={() => setIsInputHovered(true)}
                  onHoverOut={() => setIsInputHovered(false)}
                  onPress={() => inputRef.current?.focus()}
                  style={[
                    styles.inputFrame,
                    isInputHovered && styles.inputHovered,
                    isInputFocused && styles.inputFocused,
                    Boolean(error) && styles.inputError,
                  ]}
                >
                  <TextInput
                    ref={inputRef}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    maxLength={32}
                    onBlur={() => setIsInputFocused(false)}
                    onChangeText={setUsername}
                    onFocus={() => setIsInputFocused(true)}
                    onSubmitEditing={canSubmit ? handleSubmit : undefined}
                    placeholder="e.g. sam"
                    placeholderTextColor={colors.softMuted}
                    returnKeyType="done"
                    style={styles.input}
                    value={username}
                  />
                </Pressable>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                disabled={!canSubmit}
                onHoverIn={() => setIsSubmitHovered(true)}
                onHoverOut={() => setIsSubmitHovered(false)}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  isSubmitHovered && canSubmit && styles.submitButtonHovered,
                  pressed && canSubmit && styles.submitButtonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.submitButtonText}>Start journaling</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: PaletteColors) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 22,
    },
    nav: {
      alignItems: 'flex-start',
    },
    backButton: {
      borderBottomColor: 'transparent',
      borderBottomWidth: 1,
      paddingVertical: 8,
    },
    backButtonHovered: {
      borderBottomColor: colors.inputHover,
    },
    backButtonPressed: {
      borderBottomColor: colors.ink,
    },
    backContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    backButtonText: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 14,
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
    kicker: {
      color: colors.accentText,
      fontFamily: fontFamily.extraBold,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.ink,
      fontFamily: fontFamily.extraBold,
      fontSize: 34,
      lineHeight: 40,
      maxWidth: 330,
    },
    subtitle: {
      color: colors.muted,
      fontFamily: fontFamily.medium,
      fontSize: 15,
      lineHeight: 23,
    },
    form: {
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      color: colors.softMuted,
      fontFamily: fontFamily.bold,
      fontSize: 13,
    },
    labelFocused: {
      color: colors.ink,
    },
    inputFrame: {
      backgroundColor: 'transparent',
      borderColor: colors.inputIdle,
      borderRadius: 8,
      borderWidth: 1.5,
      justifyContent: 'center',
      minHeight: 58,
    },
    inputHovered: {
      borderColor: colors.inputHover,
    },
    inputFocused: {
      borderColor: colors.inputFocus,
      borderWidth: 2,
    },
    inputError: {
      borderColor: colors.error,
    },
    input: {
      color: colors.ink,
      fontFamily: fontFamily.bold,
      fontSize: 18,
      paddingHorizontal: 15,
      paddingVertical: 0,
    },
    error: {
      color: colors.error,
      fontFamily: fontFamily.semiBold,
      fontSize: 13,
      lineHeight: 18,
    },
    submitButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 999,
      justifyContent: 'center',
      minHeight: 56,
    },
    submitButtonHovered: {
      backgroundColor: colors.primaryDark,
    },
    submitButtonPressed: {
      backgroundColor: colors.primaryDark,
      transform: [{ scale: 0.99 }],
    },
    submitButtonDisabled: {
      opacity: 0.42,
    },
    submitButtonText: {
      color: colors.buttonText,
      fontFamily: fontFamily.extraBold,
      fontSize: 16,
    },
  });