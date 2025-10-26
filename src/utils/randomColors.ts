export const tailwindColorsHex: { [key: string]: string } = {
  red: "#EF4444",
  yellow: "#F59E0B",
  green: "#10B981",
  blue: "#3B82F6",
  indigo: "#6366F1",
  purple: "#8B5CF6",
  pink: "#EC4899",
  gray: "#6B7280",
  orange: "#F97316",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  lime: "#84CC16",
  amber: "#F59E0B",
  emerald: "#10B981",
  violet: "#8B5CF6",
  rose: "#F43F5E",
  sky: "#0EA5E9",
  fuchsia: "#D946EF",
  stone: "#78716C",
  neutral: "#737373",
  zinc: "#71717A",
  slate: "#64748B",
};

export function getRandomTailwindColorHex() {
  const colorKeys = Object.keys(tailwindColorsHex);
  const randomIndex = Math.floor(Math.random() * colorKeys.length);
  const randomColorKey = colorKeys[randomIndex];
  return tailwindColorsHex[randomColorKey];
}
