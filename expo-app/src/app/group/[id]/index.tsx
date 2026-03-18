import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { Group } from "@/types/group";
import { api } from "@/utils/api";
import { useAuth } from "@/hooks/use-auth";
import { AddButton } from "@/components/ui";

export default function GroupOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<Group>(`/groups/${id}`);
        setGroup(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load group");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading && !group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Loading group…</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error && !group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText themeColor="accent">{error}</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!group || !user) return null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <ThemedText type="link">← Back</ThemedText>
        </Pressable>
        <ThemedView style={[styles.card, { backgroundColor: group.color }]}>
          <ThemedText type="title">{group.name}</ThemedText>
          <ThemedText themeColor="textSecondary">
            Teacher:{" "}
            {typeof group.teacher === "string"
              ? "Teacher"
              : (group.teacher?.name ?? "Teacher")}
          </ThemedText>
          {user.role === "teacher" && (
            <View>
              <ThemedText type="subtitle">Code: {group.groupCode} </ThemedText>
            </View>
          )}
        </ThemedView>

        <AddButton onPress={() => router.push("/create-survey")} />

        {/* <ThemedView
          style={[styles.card, { backgroundColor: group.color ?? "#ffffff" }]}
        >
          <ThemedText type="subtitle">About this group</ThemedText>
          <ThemedText themeColor="textSecondary">
            Share the code with students so they can join. You can manage
            members from the Members tab.
          </ThemedText>
        </ThemedView> */}
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
  back: {
    alignSelf: "flex-start",
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 0,
    borderColor: "#ccc",
    gap: Spacing.one,
  },
});
