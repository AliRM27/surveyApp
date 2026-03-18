import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Group } from "@/types/group";
import { api } from "@/utils/api";
import { AddButton } from "@/components/ui";

const index = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const query =
        user.role === "teacher"
          ? `?teacherId=${encodeURIComponent(user._id)}`
          : `?memberId=${encodeURIComponent(user._id)}`;
      const data = await api.get<Group[]>(`/groups${query}`);
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchGroups();
  //   }, [fetchGroups]),
  // );

  if (!user) {
    return null;
  }
  const renderItem = ({ item }: { item: Group }) => (
    // Using ThemedView for the card ensures the card has the right colors
    <Pressable onPress={() => router.push(`/group/${item._id}`)}>
      <ThemedView
        style={[
          styles.card,
          { backgroundColor: item.color || theme.backgroundElement },
        ]}
      >
        <ThemedText type="subtitle">{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {typeof item.teacher === "string"
            ? "Teacher"
            : (item.teacher?.name ?? "Teacher")}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Welcome, {user.name}</ThemedText>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchGroups} />
          }
          showsVerticalScrollIndicator={false}
          data={groups}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <ThemedText themeColor="textSecondary">
                {error ?? "No groups yet."}
              </ThemedText>
            ) : null
          }
          ListFooterComponent={
            user.role === "teacher" ? (
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.createGroupButton}
                onPress={() => router.push("/create-group")}
              >
                <ThemedText type="subtitle">Create Group</ThemedText>
              </TouchableOpacity>
            ) : null
          }
        />

        <AddButton onPress={() => router.push("/join-group")} />
        {/* <Pressable
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
        </Pressable> */}
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
  createGroupButton: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Spacing.three,
    borderStyle: "dashed",
    borderWidth: 1,
  },
});
