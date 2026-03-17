import { StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { InputField, PrimaryButton, SecondaryButton } from "@/components/ui";
import { router } from "expo-router";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/utils/api";
import { Group } from "@/types/group";

const createGroup = () => {
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const palette = useMemo(
    () => ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9B8CFF", "#FF8FAB"],
    [],
  );

  const generateGroupCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let groupCode = "";
    for (let i = 0; i < 6; i++) {
      groupCode += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return groupCode;
  };

  const randomColor = () =>
    palette[Math.floor(Math.random() * palette.length)];

  const handleCreateGroup = async () => {
    if (!user) return;
    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }
    setCreating(true);
    setError(null);

    try {
      const payload = {
        name: groupName.trim(),
        teacherId: user._id,
        groupCode: generateGroupCode(),
        color: randomColor(),
      };

      const created = await api.post<Group>("/groups", payload);
      console.log("Created group", created);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create group.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ gap: Spacing.one }}>
          {/* <ThemedText type="eyebrow">Join group</ThemedText> */}
          <ThemedText type="title">Create group</ThemedText>
          <ThemedText themeColor="textSecondary">
            Create a group and share the code with your students.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <InputField
            label="Group name"
            value={groupName}
            onChangeText={setGroupName}
            autoCapitalize="words"
            autoCorrect={true}
            placeholder="e.g. Math 101"
          />

          {error && (
            <ThemedText type="small" themeColor="accent">
              {error}
            </ThemedText>
          )}

          <PrimaryButton
            label={creating ? "Creating…" : "Create group"}
            onPress={handleCreateGroup}
            fullWidth
            isActive={groupName.trim().length > 0 && !creating}
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
};

export default createGroup;

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
    gap: Spacing.three,
  },
});
