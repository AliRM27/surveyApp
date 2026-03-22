import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { api } from "@/utils/api";
import { useAuth } from "@/hooks/use-auth";

type QuestionType = "multiple_choice" | "scale" | "text" | "yes_no";

interface Question {
  prompt: string;
  type: QuestionType;
  options: string[];
  scale: { min: number; max: number; step: number };
}

export default function CreateSurveyScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        prompt: "",
        type: "text",
        options: [""],
        scale: { min: 1, max: 5, step: 1 },
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updates };
    setQuestions(newQs);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const addOption = (qIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options.push("");
    setQuestions(newQs);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...questions];
    newQs[qIndex].options[optIndex] = value;
    setQuestions(newQs);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options = newQs[qIndex].options.filter(
      (_, idx) => idx !== optIndex,
    );
    setQuestions(newQs);
  };

  const handleSubmit = async () => {
    if (!groupId) {
      return Alert.alert(
        "Error",
        "Missing group ID. Please enter from a group.",
      );
    }
    if (!title.trim()) {
      return Alert.alert("Error", "Please provide a survey title.");
    }
    if (questions.length === 0) {
      return Alert.alert("Error", "Please add at least one question.");
    }
    for (const q of questions) {
      if (!q.prompt.trim()) {
        return Alert.alert("Error", "All questions must have a prompt.");
      }
      if (q.type === "multiple_choice") {
        const validOptions = q.options.filter((opt) => opt.trim());
        if (validOptions.length < 1) {
          return Alert.alert(
            "Error",
            "Multiple choice questions must have at least one option.",
          );
        }
        q.options = validOptions;
      }
      if (q.type === "scale") {
        if (q.scale.min >= q.scale.max) {
          return Alert.alert(
            "Error",
            "Scale minimum must be less than maximum.",
          );
        }
      }
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        groupId,
        createdBy: user?._id,
        anonymous,
        questions: questions.map((q) => {
          if (q.type === "multiple_choice") {
            return { prompt: q.prompt, type: q.type, options: q.options };
          }
          if (q.type === "scale") {
            return { prompt: q.prompt, type: q.type, scale: q.scale };
          }
          return { prompt: q.prompt, type: q.type };
        }),
      };

      await api.post("/surveys", payload);
      Alert.alert("Success", "Survey created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create survey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <ThemedText type="link">Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            New Survey
          </ThemedText>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={styles.headerBtnRight}
          >
            {loading ? (
              <ActivityIndicator color="#4D96FF" />
            ) : (
              <ThemedText type="link" style={{ fontWeight: "bold" }}>
                Save
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={{ marginBottom: Spacing.one }}>
              General
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Survey Title"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.switchRow}>
              <ThemedText>Anonymous Responses</ThemedText>
              <Switch value={anonymous} onValueChange={setAnonymous} />
            </View>
          </ThemedView>

          <View style={styles.questionsHeader}>
            <ThemedText type="subtitle">Questions</ThemedText>
            <TouchableOpacity onPress={addQuestion} style={styles.addBtn}>
              <ThemedText style={styles.addBtnText}>+ Add Question</ThemedText>
            </TouchableOpacity>
          </View>

          {questions.map((q, qIndex) => (
            <ThemedView key={qIndex} style={styles.card}>
              <View style={styles.qHeader}>
                <ThemedText>Question {qIndex + 1}</ThemedText>
                <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                  <ThemedText style={styles.removeText}>Remove</ThemedText>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Question Prompt"
                placeholderTextColor="#9ca3af"
                value={q.prompt}
                onChangeText={(text) =>
                  updateQuestion(qIndex, { prompt: text })
                }
              />

              <View style={styles.typeRow}>
                {["text", "multiple_choice", "scale", "yes_no"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeBtn,
                      q.type === t && styles.typeBtnActive,
                    ]}
                    onPress={() =>
                      updateQuestion(qIndex, { type: t as QuestionType })
                    }
                  >
                    <ThemedText
                      style={[
                        styles.typeBtnText,
                        q.type === t && styles.typeBtnTextActive,
                      ]}
                    >
                      {t === "multiple_choice"
                        ? "Choice"
                        : t === "yes_no"
                        ? "Yes/No"
                        : t.charAt(0).toUpperCase() + t.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {q.type === "multiple_choice" && (
                <View style={styles.optionsContainer}>
                  {q.options.map((opt, optIndex) => (
                    <View key={optIndex} style={styles.optionRow}>
                      <TextInput
                        style={[styles.input, styles.optionInput]}
                        placeholder={`Option ${optIndex + 1}`}
                        placeholderTextColor="#9ca3af"
                        value={opt}
                        onChangeText={(text) =>
                          updateOption(qIndex, optIndex, text)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => removeOption(qIndex, optIndex)}
                      >
                        <ThemedText style={styles.removeText}>X</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => addOption(qIndex)}
                    style={{ marginTop: Spacing.one }}
                  >
                    <ThemedText type="link">+ Add Option</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {q.type === "scale" && (
                <View style={styles.scaleRow}>
                  <View style={styles.scaleInputWrapper}>
                    <ThemedText>Min</ThemedText>
                    <TextInput
                      style={[styles.input, styles.scaleInput]}
                      keyboardType="numeric"
                      value={String(q.scale.min)}
                      onChangeText={(text) =>
                        updateQuestion(qIndex, {
                          scale: { ...q.scale, min: Number(text) || 0 },
                        })
                      }
                    />
                  </View>
                  <View style={styles.scaleInputWrapper}>
                    <ThemedText>Max</ThemedText>
                    <TextInput
                      style={[styles.input, styles.scaleInput]}
                      keyboardType="numeric"
                      value={String(q.scale.max)}
                      onChangeText={(text) =>
                        updateQuestion(qIndex, {
                          scale: { ...q.scale, max: Number(text) || 0 },
                        })
                      }
                    />
                  </View>
                </View>
              )}
            </ThemedView>
          ))}
        </ScrollView>
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
    alignItems: "flex-end",
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    backgroundColor: "transparent",
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Spacing.one,
    padding: Spacing.two,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.one,
  },
  questionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  addBtn: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  addBtnText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  qHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeText: {
    color: "#ef4444",
    fontWeight: "500",
  },
  typeRow: {
    flexDirection: "row",
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.one,
    alignItems: "center",
    borderRadius: Spacing.one,
    backgroundColor: "#f3f4f6",
  },
  typeBtnActive: {
    backgroundColor: "#3b82f6",
  },
  typeBtnText: {
    fontSize: 14,
    color: "#4b5563",
  },
  typeBtnTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  optionsContainer: {
    marginTop: Spacing.one,
    paddingLeft: Spacing.one,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    gap: Spacing.one,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  optionInput: {
    flex: 1,
  },
  scaleRow: {
    flexDirection: "row",
    gap: Spacing.four,
    marginTop: Spacing.one,
  },
  scaleInputWrapper: {
    flex: 1,
    gap: Spacing.half,
  },
  scaleInput: {
    textAlign: "center",
  },
});
