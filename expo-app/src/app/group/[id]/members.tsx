import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { api } from "@/utils/api";

export default function GroupMembersScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Group>(`/groups/${id}`);
      setGroup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <ThemedText type="title">Members</ThemedText>
        </View>
        {error ? <ThemedText themeColor="accent">{error}</ThemedText> : null}
        <FlatList
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
          data={(group?.members as User[]) || []}
          keyExtractor={(item, index) => item._id ?? String(index)}
          renderItem={({ item }) => (
            <ThemedView style={styles.memberCard}>
              <ThemedText type="subtitle">{item.name ?? "Member"}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {item.email ?? ""}
              </ThemedText>
            </ThemedView>
          )}
          ListHeaderComponent={
            group ? (
              <View style={styles.teacherCard}>
                <ThemedText type="eyebrow">Teacher</ThemedText>
                <ThemedText type="subtitle">
                  {typeof group.teacher === "string"
                    ? "Teacher"
                    : (group.teacher?.name ?? "Teacher")}
                </ThemedText>
                {typeof group.teacher !== "string" && (
                  <ThemedText themeColor="textSecondary">
                    {group.teacher?.email}
                  </ThemedText>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <ThemedText themeColor="textSecondary">
                No members yet.
              </ThemedText>
            ) : null
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  teacherCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
    marginBottom: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  memberCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    marginBottom: Spacing.two,
  },
});
