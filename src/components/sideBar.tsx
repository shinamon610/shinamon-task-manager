import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { AccentColor, getSelectedStyle } from "@/lib/layoutUtils";
import { UUID } from "@/models/task";
import { Mode } from "@/vim/mode";
import { useContext, useMemo } from "react";

type Card = {
  id: UUID;
  title: string;
  isSelected: boolean;
};

const CardComponent: React.FC<{
  card: Card;
  style: {
    padding: string;
    border: string;
  };
}> = ({ card, style }) => {
  return (
    <div className="m-1 items-center bg-active" style={style}>
      <div className="truncate">{card.title}</div>
    </div>
  );
};

export function SideBar() {
  const { dependentIds, stackedTasks } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);
  const selectedId = useMemo(() => {
    return stackedTasks.find((task) => task.isSelected)?.id;
  }, [stackedTasks]);

  return (
    <div
      className="bg-darkGray"
      style={getSelectedStyle(mode === Mode.SideBarSelecting, "blue")}
    >
      {stackedTasks.map((task) => {
        const style = task.isSelected
          ? getSelectedStyle(true, AccentColor)
          : selectedId !== undefined && dependentIds.includes(task.id)
            ? getSelectedStyle(true, "blue")
            : getSelectedStyle(false, "");
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
