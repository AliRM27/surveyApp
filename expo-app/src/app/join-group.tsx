import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { InputField, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Spacing } from "@/constants/theme";

export default function JoinGroupScreen() {
  const router = useRouter();
  const [groupCode, setGroupCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) return;
    setJoining(true);
    try {
      // TODO: connect to backend join endpoint
      console.log("Joining group with code:", groupCode.trim());
      router.back();
    } finally {
      setJoining(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ gap: Spacing.one }}>
          <ThemedText type="eyebrow">Join group</ThemedText>
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
          <PrimaryButton
            label={joining ? "Joining…" : "Join group"}
            onPress={handleJoinGroup}
            fullWidth
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
