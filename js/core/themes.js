export const THEMES = Object.freeze({
  light: { label: "Claro", palette: ["#FDE68A", "#FED7AA", "#FCA5A5", "#FBCFE8", "#DDD6FE", "#BFDBFE", "#A5F3FC", "#BBF7D0", "#D9F99D", "#E2E8F0"] },
  dark: { label: "Escuro", palette: ["#66521C", "#70411F", "#793A3A", "#71375B", "#514175", "#294B70", "#1B5964", "#2E6343", "#50652D", "#475569"] },
  neon: { label: "Neon", palette: ["#39FF14", "#00E5FF", "#FF00E5", "#FFE600", "#FF6B00", "#9D4EDD", "#00FF9D", "#FF1744", "#00B0FF", "#E8FF00"] },
  minimal: { label: "Minimalista", palette: ["#374151", "#475569", "#4B5563", "#52525B", "#3F3F46", "#44403C", "#365314", "#155E75", "#4C1D95", "#7F1D1D"] },
});

export function getActivePalette() { return THEMES[document.documentElement.dataset.theme ?? "light"].palette; }
