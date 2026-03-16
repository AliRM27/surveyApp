import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacing } from "@/constants/theme";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";

const Settings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText style={{ textAlign: "center" }} type="title">
          Settings
        </ThemedText>
        <View>
          <ThemedText type="subtitle" themeColor="textSecondary">
            Name
          </ThemedText>
          <ThemedText type="default" themeColor="text">
            {user?.name ?? "—"}
          </ThemedText>
        </View>
        <View>
          <ThemedText type="subtitle" themeColor="textSecondary">
            Email
          </ThemedText>
          <ThemedText type="default" themeColor="text">
            {user?.email ?? "—"}
          </ThemedText>
        </View>
        <View>
          <ThemedText type="subtitle" themeColor="textSecondary">
            Role
          </ThemedText>
          <ThemedText type="default" themeColor="text">
            {user?.role ? user.role.toUpperCase() : "—"}
          </ThemedText>
        </View>
        <PrimaryButton label="Logout" onPress={handleLogout} fullWidth />
        {/* <SecondaryButton
          label="Switch account"
          onPress={() => router.push("/auth/login")}
          fullWidth
        /> */}
      </SafeAreaView>
    </ThemedView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
});
