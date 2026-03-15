import React, { forwardRef } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";

import { ThemedText } from "./themed-text";
import { ThemedView, type ThemedViewProps } from "./themed-view";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  fullWidth?: boolean;
};

export function Surface({
  style,
  type = "backgroundElement",
  children,
  ...props
}: ThemedViewProps) {
  const theme = useTheme();
  return (
    <ThemedView
      {...props}
      type={type}
      style={[
        styles.surface,
        { borderColor: theme.border, shadowColor: theme.text },
        type === "backgroundSelected" && { borderColor: "transparent" },
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
}

export function PrimaryButton({ label, onPress, fullWidth }: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        styles.buttonPrimary,
        { backgroundColor: theme.accent, shadowColor: theme.accent },
        fullWidth && { width: "100%" },
        pressed && styles.buttonPressed,
      ]}
    >
      <ThemedText style={styles.buttonPrimaryText}>{label}</ThemedText>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, fullWidth }: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        styles.buttonSecondary,
        { borderColor: theme.border },
        fullWidth && { width: "100%" },
        pressed && styles.buttonPressed,
      ]}
    >
      <ThemedText style={[styles.buttonSecondaryText, { color: theme.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export const InputField = forwardRef<
  TextInput,
  TextInputProps & { label?: string; helper?: string }
>(({ label, helper, style, ...props }, ref) => {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.half }}>
      {label && <ThemedText type="small">{label}</ThemedText>}
      <ThemedView
        type="backgroundElement"
        style={[
          styles.inputWrapper,
          {
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textSecondary}
          {...props}
        />
      </ThemedView>
      {helper && (
        <ThemedText type="small" themeColor="textSecondary">
          {helper}
        </ThemedText>
      )}
    </View>
  );
});
InputField.displayName = "InputField";

export function Pill({
  label,
  tone = "muted",
  icon,
}: {
  label: string;
  tone?: "muted" | "accent";
  icon?: React.ReactNode;
}) {
  const theme = useTheme();
  const background =
    tone === "accent" ? theme.accentMuted : theme.backgroundSelected;
  const color = tone === "accent" ? theme.accent : theme.textSecondary;
  return (
    <ThemedView style={[styles.pill, { backgroundColor: background }]}>
      <View style={styles.pillContent}>
        {icon}
        <ThemedText type="smallBold" style={{ color }}>
          {label}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  style,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewProps["style"];
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ gap: Spacing.half }}>
        {subtitle && <ThemedText type="eyebrow">{subtitle}</ThemedText>}
        <ThemedText type="subtitle">{title}</ThemedText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  buttonBase: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.one,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.93,
  },
  buttonPrimaryText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  buttonSecondaryText: {
    fontWeight: "700",
  },
  inputWrapper: {
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
  },
  input: {
    fontSize: 16,
    fontWeight: "500",
  },
  pill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
