import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacing } from "@/constants/theme";

const Settings = () => {
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
            Ali Lotuz
          </ThemedText>
        </View>
        <View>
          <ThemedText type="subtitle" themeColor="textSecondary">
            Email
          </ThemedText>
          <ThemedText type="default" themeColor="text">
            [EMAIL_ADDRESS]
          </ThemedText>
        </View>
        <View>
          <ThemedText type="subtitle" themeColor="textSecondary">
            Password
          </ThemedText>
          <ThemedText type="default" themeColor="text">
            ********
          </ThemedText>
        </View>
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
