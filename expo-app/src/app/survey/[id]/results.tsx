import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { api } from "@/utils/api";

export default function SurveyResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await api.get<any>(`/surveys/${id}/results`);
        setResults(data);
      } catch (err: any) {
        setError(err.message || "Failed to load survey results.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4D96FF" />
      </ThemedView>
    );
  }

  if (error || !results) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="accent">
          {error || "Results not found."}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText type="link">← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Survey Results
          </ThemedText>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.summaryCard}>
            <ThemedText type="title">{results.totalResponses}</ThemedText>
            <ThemedText themeColor="textSecondary">Total Responses</ThemedText>
          </ThemedView>

          {results.questions.map((q: any, index: number) => {
            return (
              <ThemedView key={q.questionId} style={styles.card}>
                <ThemedText style={styles.prompt}>
                  {index + 1}. {q.prompt}
                </ThemedText>

                {(q.type === "multiple_choice" || q.type === "yes_no") && (
                  <View style={styles.metricsContainer}>
                    {Object.entries(q.summary.counts || {}).map(
                      ([option, count]) => (
                        <View key={option} style={styles.metricRow}>
                          <ThemedText style={{ flex: 1 }}>{option}</ThemedText>
                          <ThemedText style={{ width: 40, textAlign: "right" }}>
                            {String(count)}
                          </ThemedText>
                        </View>
                      ),
                    )}
                    {Object.keys(q.summary.counts || {}).length === 0 && (
                      <ThemedText themeColor="textSecondary">
                        No options selected yet.
                      </ThemedText>
                    )}
                  </View>
                )}

                {q.type === "scale" && (
                  <View style={styles.scaleMetrics}>
                    <View style={styles.statBox}>
                      <ThemedText type="title" style={styles.statVal}>
                        {q.summary.average !== null
                          ? q.summary.average.toFixed(1)
                          : "-"}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={{ fontSize: 12 }}
                      >
                        Average
                      </ThemedText>
                    </View>
                    <View style={styles.statBox}>
                      <ThemedText type="subtitle" style={styles.statVal}>
                        {q.summary.min !== null ? q.summary.min : "-"}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={{ fontSize: 12 }}
                      >
                        Min
                      </ThemedText>
                    </View>
                    <View style={styles.statBox}>
                      <ThemedText type="subtitle" style={styles.statVal}>
                        {q.summary.max !== null ? q.summary.max : "-"}
                      </ThemedText>
                      <ThemedText
                        themeColor="textSecondary"
                        style={{ fontSize: 12 }}
                      >
                        Max
                      </ThemedText>
                    </View>
                  </View>
                )}

                {q.type === "text" && (
                  <View style={styles.metricsContainer}>
                    {(q.summary.responses || []).length > 0 ? (
                      (q.summary.responses || []).map(
                        (resp: string, idx: number) => (
                          <View key={idx} style={styles.textResponseCard}>
                            <ThemedText style={{ fontStyle: "italic" }}>
                              "{resp}"
                            </ThemedText>
                          </View>
                        ),
                      )
                    ) : (
                      <ThemedText themeColor="textSecondary">
                        No text responses yet.
                      </ThemedText>
                    )}
                  </View>
                )}
              </ThemedView>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    textAlign: "center",
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  summaryCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  prompt: {
    marginBottom: Spacing.two,
  },
  metricsContainer: {
    gap: Spacing.one,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.half,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  scaleMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.one,
  },
  statBox: {
    alignItems: "center",
    padding: Spacing.two,
    backgroundColor: "#f9fafb",
    borderRadius: Spacing.two,
    minWidth: 80,
  },
  statVal: {
    color: "#3b82f6",
  },
  textResponseCard: {
    padding: Spacing.two,
    backgroundColor: "#f9fafb",
    borderRadius: Spacing.two,
    marginBottom: Spacing.one,
  },
  backBtn: {
    marginTop: Spacing.four,
  },
});
