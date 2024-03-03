import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { AccentColor, getSelectedStyle } from "@/lib/layoutUtils";
import { Task, UUID } from "@/models/task";
import { Mode } from "@/vim/mode";
import { useContext, useMemo } from "react";

type Card = {
  id: UUID;
  title: string;
  isSelected: boolean;
};

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div
      className="m-1 items-center bg-active"
      style={getSelectedStyle(card.isSelected, AccentColor)}
    >
      <div className="truncate">{card.title}</div>
    </div>
  );
};

export function SideBar() {
  const { stackedTasks } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);
  const cards: Card[] = useMemo(() => {
    return (stackedTasks.toJS() as Task[]).map((task) => ({
      id: task.id,
      title: task.name,
      isSelected: task.isSelected,
    }));
  }, [stackedTasks]);

  return (
    <div
      className="bg-darkGray"
      style={getSelectedStyle(mode === Mode.SideBarSelecting, AccentColor)}
    >
      {cards.map((card) => (
        <CardComponent key={card.id} card={card} />
      ))}
    </div>
  );
}
