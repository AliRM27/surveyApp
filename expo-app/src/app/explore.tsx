import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { api } from "@/utils/api";
import { User } from "@/types/api";

export default function ActionsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [groupName, setGroupName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [memberIds, setMemberIds] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState<string | null>(null);

  const createUser = async () => {
    try {
      setStatus("Sende...");
      const user = await api.post<User>("/users", { name, email, role });
      setStatus(`Benutzer erstellt: ${user.name}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Fehler");
    }
  };

  const createGroup = async () => {
    try {
      setStatus("Gruppe wird erstellt...");
      await api.post("/groups", {
        name: groupName,
        teacherId,
        memberIds: memberIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setStatus("Gruppe gespeichert.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Fehler");
    }
  };

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await api.get<{ status: string }>("/health");
      setHealth(res.status);
    } catch (err) {
      setHealth(err instanceof Error ? err.message : "Fehler");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Aktionen</ThemedText>
          <ThemedText themeColor="textSecondary">
            Schnelle Tests für API-Endpoints. EXPO_PUBLIC_API_URL (z.B.
            http://192.168.0.10:7878/api).
          </ThemedText>

          <Section title="Health Check">
            <ThemedText>API: {api.baseUrl}</ThemedText>
            <PrimaryButton label="Ping /health" onPress={checkHealth} />
            <View style={styles.row}>
              {checking && <ActivityIndicator />}
              {health && <ThemedText>{health}</ThemedText>}
            </View>
          </Section>

          <Section title="Benutzer anlegen">
            <LabeledInput label="Name" value={name} onChangeText={setName} />
            <LabeledInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <View style={styles.row}>
              <PrimaryButton
                label={role === "teacher" ? "Lehrer" : "Schüler"}
                onPress={() =>
                  setRole(role === "teacher" ? "student" : "teacher")
                }
              />
              <SecondaryButton label="Speichern" onPress={createUser} />
            </View>
          </Section>

          <Section title="Gruppe anlegen">
            <LabeledInput
              label="Gruppenname"
              value={groupName}
              onChangeText={setGroupName}
            />
            <LabeledInput
              label="TeacherId"
              value={teacherId}
              onChangeText={setTeacherId}
              autoCapitalize="none"
            />
            <LabeledInput
              label="MemberIds (comma)"
              value={memberIds}
              onChangeText={setMemberIds}
              autoCapitalize="none"
            />
            <SecondaryButton label="Gruppe speichern" onPress={createGroup} />
          </Section>

          {status && (
            <ThemedView type="backgroundElement" style={styles.statusBox}>
              <ThemedText>{status}</ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <ThemedView type="backgroundElement" style={styles.section}>
    <ThemedText type="subtitle">{title}</ThemedText>
    <View style={{ gap: Spacing.two }}>{children}</View>
  </ThemedView>
);

const LabeledInput = ({
  label,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) => (
  <View style={{ gap: Spacing.half }}>
    <ThemedText type="small">{label}</ThemedText>
    <TextInput style={styles.input} placeholderTextColor="#888" {...props} />
  </View>
);

const PrimaryButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void | Promise<void>;
}) => (
  <ThemedView style={styles.buttonPrimary} type="backgroundSelected">
    <ThemedText onPress={onPress} style={styles.buttonText}>
      {label}
    </ThemedText>
  </ThemedView>
);

const SecondaryButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void | Promise<void>;
}) => (
  <ThemedView style={styles.buttonSecondary} type="backgroundElement">
    <ThemedText onPress={onPress} style={styles.buttonText}>
      {label}
    </ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  content: {
    gap: Spacing.three,
  },
  section: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  buttonPrimary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  buttonSecondary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    opacity: 0.9,
  },
  buttonText: {
    fontWeight: "600",
  },
  statusBox: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
});
