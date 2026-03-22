import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { api } from "@/utils/api";
import { useAuth } from "@/hooks/use-auth";

export default function GroupMembersScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isTeacher =
    group && user
      ? (typeof group.teacher === "string"
          ? group.teacher
          : group.teacher?._id) === user._id
      : false;

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/groups/${id}/members/${memberId}`);
              await load();
            } catch (err) {
              Alert.alert("Error", "Failed to remove member");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

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
            <View style={styles.memberRow}>
              <ThemedView style={styles.memberCard}>
                <ThemedText type="subtitle">{item.name ?? "Member"}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {item.email ?? ""}
                </ThemedText>
              </ThemedView>
              {isTeacher && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMember(item._id!)}
                  disabled={loading}
                >
                  <ThemedText style={styles.removeButtonText}>-</ThemedText>
                </TouchableOpacity>
              )}
            </View>
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
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  memberCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
});
