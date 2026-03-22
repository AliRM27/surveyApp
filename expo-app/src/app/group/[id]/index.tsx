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
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [groupData, surveysData] = await Promise.all([
          api.get<Group>(`/groups/${id}`),
          api.get<any[]>(`/surveys/group/${id}`)
        ]);
        setGroup(groupData);
        setSurveys(surveysData);
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

  const teacherId = typeof group.teacher === "string" ? group.teacher : group.teacher?._id;
  const isTeacher = teacherId === user._id;

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

        {isTeacher && (
           <AddButton onPress={() => router.push({ pathname: "/create-survey", params: { groupId: id } })} />
        )}

        <View style={styles.surveysSection}>
          <ThemedText type="subtitle">Active Surveys</ThemedText>
          {surveys.length === 0 ? (
            <ThemedText themeColor="textSecondary">No surveys available.</ThemedText>
          ) : (
            surveys.map((survey) => (
              <Pressable
                key={survey._id}
                style={styles.surveyCard}
                onPress={() => {
                  if (isTeacher) {
                    router.push({ pathname: "/survey/[id]/results" as any, params: { id: survey._id } });
                  } else {
                    router.push({ pathname: "/survey/[id]" as any, params: { id: survey._id } });
                  }
                }}
              >
                <View>
                  <ThemedText type="default" style={{ fontWeight: "600" }}>{survey.title}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {survey.questions?.length || 0} Questions
                  </ThemedText>
                </View>
                <ThemedText type="link" style={{ fontWeight: "bold" }}>
                  {isTeacher ? "Results" : "Start"}
                </ThemedText>
              </Pressable>
            ))
          )}
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
  surveysSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  surveyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
});
