import { useRouter } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import React, { useState } from "react";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

const index = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const theme = useTheme();

  if (!user) {
    return null;
  }

  const GROUP_DATA = [
    { id: "1", title: "Group Alpha", teacher: "Herr Müller", color: "#FF6B6B" },
    { id: "2", title: "Group Beta", teacher: "Frau Schmidt", color: "#FFD93D" },
    { id: "3", title: "Group Gamma", teacher: "Herr Meier", color: "#6BCB77" },
  ];

  const renderItem = ({ item }: { item: (typeof GROUP_DATA)[0] }) => (
    // Using ThemedView for the card ensures the card has the right colors
    <ThemedView style={[styles.card, { backgroundColor: item.color }]}>
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {item.teacher}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Welcome, {user.name}</ThemedText>
        <FlatList
          refreshControl={<RefreshControl refreshing={false} />}
          showsVerticalScrollIndicator={false}
          data={GROUP_DATA}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
        <Pressable
          style={[
            styles.button,
            { backgroundColor: theme.backgroundElement },
            isPressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/join-group")}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
        >
          <ThemedText type="subtitle">+</ThemedText>
        </Pressable>
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
    borderRadius: Spacing.three,
    borderWidth: 0,
    borderColor: "#ccc",
    gap: Spacing.one,
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
    borderRadius: 100,
    right: Spacing.four,
    bottom: 100,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
    shadowOpacity: 0.1,
    elevation: 0,
  },
});
