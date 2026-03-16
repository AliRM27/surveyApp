import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { InputField, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

const ROLE_OPTIONS = [
  { key: "student", label: "Student", copy: "Answer and join surveys" },
  { key: "teacher", label: "Teacher", copy: "Create and manage surveys" },
] as const;

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const theme = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create account.",
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ gap: Spacing.one }}>
          <ThemedText type="eyebrow">Create account</ThemedText>
          <ThemedText type="title">Join the survey app</ThemedText>
          <ThemedText themeColor="textSecondary">
            Set your role so we can tailor the experience.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <InputField label="Full name" value={name} onChangeText={setName} />
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            helper="At least 6 characters"
            autoComplete="password-new"
          />

          <View style={{ gap: Spacing.one }}>
            <ThemedText type="small">Role</ThemedText>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setRole(option.key)}
                  style={({ pressed }) => [
                    styles.roleCard,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.backgroundElement,
                    },
                    role === option.key && {
                      borderColor: theme.accent,
                      backgroundColor: theme.accentMuted,
                    },
                    pressed && styles.roleCardPressed,
                  ]}
                >
                  <ThemedText type="subtitle">{option.label}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {option.copy}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {error && (
            <ThemedText type="small" themeColor="accent">
              {error}
            </ThemedText>
          )}

          <PrimaryButton
            label={loading ? "Creating account…" : "Create account"}
            onPress={handleRegister}
            fullWidth
          />
          <SecondaryButton
            label="I already have an account"
            onPress={() => router.replace("/auth/login")}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  form: {
    gap: Spacing.two,
  },
  roleRow: {
    flexDirection: "row",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  roleCard: {
    flex: 1,
    minWidth: 150,
    gap: Spacing.half,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
  roleCardPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.9,
  },
});
