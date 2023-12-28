import { zip } from "@/utils";

export const FlexContainer = ({
  components,
  isSelected,
  ratios,
}: {
  components: React.JSX.Element[];
  isSelected: boolean;
  ratios: number[];
}) => {
  const containerStyle = {
    display: "flex",
    border: isSelected ? "3px solid blue" : "none",
    padding: isSelected ? "0px" : "3px",
  };
  const contents = zip(components, ratios).map(([element, ratio], i) => (
    <div key={i} style={{ flex: ratio }}>
      {element}
    </div>
  ));
  return <div style={containerStyle}>{contents}</div>;
};
