import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { getNodeBorderStyle, getSelectedStyle } from "@/lib/layoutUtils";
import { UUID } from "@/models/task";
import { Mode } from "@/vim/mode";
import { CSSProperties, useContext } from "react";

type Card = {
  id: UUID;
  title: string;
  isSelected: boolean;
};

const CardComponent: React.FC<{
  card: Card;
  style: CSSProperties;
}> = ({ card, style }) => {
  return (
    <div className="m-1 items-center bg-active" style={style}>
      <div className="truncate">{card.title}</div>
    </div>
  );
};

export function SideBar() {
  const { stackedTasks, assignees } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);

  return (
    <div
      style={{
        ...getSelectedStyle(mode === Mode.SideBarSelecting, "blue"),
        backgroundColor: "var(--light-gray)",
      }}
    >
      {stackedTasks.map((task) => {
        const style = getNodeBorderStyle(assignees, task);
        return (
          <CardComponent
            key={task.id}
            card={{
              id: task.id,
              title: task.name,
              isSelected: task.isSelected,
            }}
            style={style}
          />
        );
      })}
    </div>
  );
}
