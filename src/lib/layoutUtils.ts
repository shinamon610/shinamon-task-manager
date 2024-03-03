export function getSelectedStyle(isSelected: boolean): {
  padding: string;
  border: string;
} {
  return isSelected
    ? { border: "3px solid var(--accent)", padding: "0px" }
    : { border: "", padding: "3px" };
}
