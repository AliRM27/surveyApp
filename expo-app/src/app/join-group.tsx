import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { InputField, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/utils/api";
import { Group } from "@/types/group";

export default function JoinGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [groupCode, setGroupCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinGroup = async () => {
    if (!groupCode.trim() || !user) return;
    setJoining(true);
    setError(null);
    try {
      const payload = {
        groupCode: groupCode.trim().toUpperCase(),
        memberId: user._id,
      };
      const group = await api.post<Group>("/groups/join", payload);
      router.replace(`/group/${group._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join group.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ gap: Spacing.one }}>
          {/* <ThemedText type="eyebrow">Join group</ThemedText> */}
          <ThemedText type="title">Enter group code</ThemedText>
          <ThemedText themeColor="textSecondary">
            Your teacher shares this code so you can access the group.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <InputField
            label="Group code"
            value={groupCode}
            onChangeText={setGroupCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="e.g. ABC123"
          />
          {error && (
            <ThemedText type="small" themeColor="accent">
              {error}
            </ThemedText>
          )}
          <PrimaryButton
            label={joining ? "Joining…" : "Join group"}
            onPress={handleJoinGroup}
            fullWidth
            disabled={!groupCode.trim() || joining}
          />
          <SecondaryButton
            label="Cancel"
            onPress={() => router.back()}
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
});
