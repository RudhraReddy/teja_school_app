import { useColorScheme } from "react-native";

const light = {
  bg: "#F6F7FB", surface: "#FFFFFF", subtle: "#EEF1F7", line: "#E2E6EF", ink: "#111827", muted: "#6B7280",
  brand: "#1E3A8A", onBrand: "#FFFFFF", accent: "#F59E0B", danger: "#B91C1C", success: "#15803D",
  successBg: "#DCFCE7", dangerBg: "#FEE2E2", warnBg: "#FEF3C7", warn: "#92400E",
};
const dark: typeof light = {
  bg: "#0B1020", surface: "#121A2E", subtle: "#1A2440", line: "#26314F", ink: "#E5E9F5", muted: "#94A0BD",
  brand: "#5B7FE8", onBrand: "#FFFFFF", accent: "#F59E0B", danger: "#F87171", success: "#4ADE80",
  successBg: "#052E16", dangerBg: "#450A0A", warnBg: "#451A03", warn: "#FCD34D",
};

export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === "dark" ? dark : light);
