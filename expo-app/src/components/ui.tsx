import React, { forwardRef, useState } from "react";
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
  disabled?: boolean;
  isActive?: boolean;
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

export function PrimaryButton({
  label,
  onPress,
  fullWidth,
  disabled,
  isActive = true,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled ?? !isActive;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.buttonBase,
        styles.buttonPrimary,
        {
          backgroundColor: theme.text,
          shadowColor: "#000",
        },
        fullWidth && { width: "100%" },
        isDisabled && { opacity: 0.7 },
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      <ThemedText
        style={[styles.buttonPrimaryText, { color: theme.background }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  fullWidth,
  disabled = false,
}: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonBase,
        styles.buttonSecondary,
        { borderColor: theme.border },
        fullWidth && { width: "100%" },
        disabled && { opacity: 0.6 },
        pressed && !disabled && styles.buttonPressed,
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
  const [isPressed, setIsPressed] = useState(false);
  return (
    <View style={{ gap: Spacing.half }}>
      {label && <ThemedText>{label}</ThemedText>}
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
          onFocus={() => {
            setIsPressed(true);
          }}
          style={[
            styles.input,
            isPressed && { borderColor: theme.text },
            { color: theme.text },
            style,
          ]}
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

export function AddButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: ViewProps["style"];
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.buttonPressedAdd,
        style,
      ]}
      onPress={onPress}
    >
      <ThemedText type="subtitle">+</ThemedText>
    </Pressable>
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
    borderRadius: Spacing.four,
    paddingVertical: Spacing.two + 2,
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
    backgroundColor: "#000000ff",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
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
    height: 30,
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
  buttonPressedAdd: {
    transform: [{ translateY: 1 }],
    shadowOpacity: 0.1,
    elevation: 0,
  },
});
