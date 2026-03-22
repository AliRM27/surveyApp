import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { api } from "@/utils/api";
import { useAuth } from "@/hooks/use-auth";

export default function TakeSurveyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await api.get<any>(`/surveys/${id}`);
        setSurvey(data);
        if (user && data.submittedBy && data.submittedBy.includes(user._id)) {
          setAlreadySubmitted(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load survey.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMultipleChoice = (questionId: string, option: string) => {
    const current = answers[questionId] || [];
    if (current.includes(option)) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: current.filter((opt: string) => opt !== option),
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...current, option],
      }));
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    // Validate if all questions are answered and within scale limits
    for (const q of survey.questions) {
      if (
        !answers[q._id] ||
        (Array.isArray(answers[q._id]) && answers[q._id].length === 0)
      ) {
        Alert.alert(
          "Incomplete",
          "Please answer all questions before submitting.",
        );
        return;
      }

      if (q.type === "scale" && q.scale) {
        const val = Number(answers[q._id]);
        if (val < q.scale.min || val > q.scale.max) {
          Alert.alert(
            "Invalid Scale",
            `Please enter a value between ${q.scale.min} and ${q.scale.max} for question: "${q.prompt}".`
          );
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        userId: user?._id,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      };
      await api.post(`/surveys/${id}/responses`, payload);
      Alert.alert("Success", "Your response has been submitted!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit survey.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4D96FF" />
      </ThemedView>
    );
  }

  if (error || !survey) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText themeColor="accent">
          {error || "Survey not found."}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <ThemedText type="link">Close</ThemedText>
          </TouchableOpacity>
          <ThemedText
            type="subtitle"
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {survey.title}
          </ThemedText>
          <View style={styles.headerBtnRight} />
        </View>

        {alreadySubmitted ? (
          <ThemedView style={styles.centerContainer}>
            <ThemedText type="subtitle">Survey Completed</ThemedText>
            <ThemedText
              themeColor="textSecondary"
              style={{ marginTop: Spacing.two, textAlign: "center" }}
            >
              You have already submitted your response for this survey.
            </ThemedText>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <ThemedText type="link">Go Back</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedView style={styles.cardInfo}>
              <ThemedText>About this Survey</ThemedText>
              {survey.anonymous && (
                <ThemedText
                  themeColor="textSecondary"
                  style={{ marginTop: Spacing.half }}
                >
                  Your responses will be recorded anonymously.
                </ThemedText>
              )}
            </ThemedView>

            {survey.questions.map((q: any, i: number) => (
              <ThemedView key={q._id} style={styles.card}>
                <ThemedText style={styles.questionPrompt}>
                  {i + 1}. {q.prompt}
                </ThemedText>

                {q.type === "text" && (
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your answer"
                    placeholderTextColor="#9ca3af"
                    multiline
                    value={answers[q._id] || ""}
                    onChangeText={(text) => handleAnswerChange(q._id, text)}
                  />
                )}

                {q.type === "scale" && (
                  <View style={styles.scaleContainer}>
                    <ThemedText themeColor="textSecondary">
                      Min: {q.scale.min}
                    </ThemedText>
                    <TextInput
                      style={styles.numericInput}
                      placeholder="Enter number"
                      keyboardType="numeric"
                      value={
                        answers[q._id] !== undefined
                          ? String(answers[q._id])
                          : ""
                      }
                      onChangeText={(text) => {
                        const num = Number(text);
                        if (!isNaN(num)) {
                          handleAnswerChange(q._id, num);
                        }
                      }}
                    />
                    <ThemedText themeColor="textSecondary">
                      Max: {q.scale.max}
                    </ThemedText>
                  </View>
                )}

                {q.type === "multiple_choice" && (
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = (answers[q._id] || []).includes(opt);
                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={[
                            styles.optionBtn,
                            isSelected && styles.optionBtnActive,
                          ]}
                          onPress={() => toggleMultipleChoice(q._id, opt)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxActive,
                            ]}
                          />
                          <ThemedText
                            style={{
                              flex: 1,
                              color: isSelected ? "#3b82f6" : "#4b5563",
                            }}
                          >
                            {opt}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {q.type === "yes_no" && (
                  <View style={styles.yesNoContainer}>
                    {["Yes", "No"].map((opt) => {
                      const isSelected = answers[q._id] === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          style={[
                            styles.yesNoBtn,
                            isSelected && styles.yesNoBtnActive,
                          ]}
                          onPress={() => handleAnswerChange(q._id, opt)}
                        >
                          <ThemedText
                            style={[
                              styles.yesNoBtnText,
                              isSelected && styles.yesNoBtnTextActive,
                            ]}
                          >
                            {opt}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ThemedView>
            ))}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.submitBtnText}>
                  Submit Responses
                </ThemedText>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
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
  headerBtn: {
    flex: 1,
  },
  headerTitle: {
    flex: 2,
    textAlign: "center",
  },
  headerBtnRight: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  cardInfo: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: StyleSheet.hairlineWidth,
  },
  questionPrompt: {
    marginBottom: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#f9fafb",
    minHeight: 100,
    textAlignVertical: "top",
  },
  scaleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  numericInput: {
    flex: 1,
    marginHorizontal: Spacing.two,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Spacing.one,
    paddingVertical: Spacing.one,
    fontSize: 18,
    backgroundColor: "#ffffff",
  },
  optionsContainer: {
    gap: Spacing.two,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: Spacing.two,
    backgroundColor: "#f9fafb",
    gap: Spacing.two,
  },
  optionBtnActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
  checkboxActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  submitBtn: {
    backgroundColor: "#4D96FF",
    paddingVertical: Spacing.three,
    alignItems: "center",
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
    marginTop: Spacing.four,
  },
  yesNoContainer: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  yesNoBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: Spacing.two,
    backgroundColor: "#f9fafb",
  },
  yesNoBtnActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  yesNoBtnText: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "600",
  },
  yesNoBtnTextActive: {
    color: "#3b82f6",
  },
});
