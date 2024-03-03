export const AccentColor = "var(--accent)";

export function getSelectedStyle(
  isSelected: boolean,
  color: string
): {
  padding: string;
  border: string;
} {
  return isSelected
    ? { border: `3px solid ${color}`, padding: "0px" }
    : { border: "", padding: "3px" };
}
