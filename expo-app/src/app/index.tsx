import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

const index = () => {
  const GROUP_DATA = [
    { id: "1", title: "Group Alpha" },
    { id: "2", title: "Group Beta" },
    { id: "3", title: "Group Gamma" },
  ];

  const renderItem = ({ item }: { item: (typeof GROUP_DATA)[0] }) => (
    // Using ThemedView for the card ensures the card has the right colors
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">{item.title}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          refreshControl={<RefreshControl refreshing={false} />}
          showsVerticalScrollIndicator={false}
          data={GROUP_DATA}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
        <ThemedView type="backgroundSelected" style={styles.button}>
          <ThemedText type="subtitle">+</ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default index;

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
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  listContent: {
    gap: Spacing.three,
  },
  button: {
    width: 60,
    height: 60,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    right: Spacing.four,
    bottom: 100,
    borderWidth: 1,
  },
});
