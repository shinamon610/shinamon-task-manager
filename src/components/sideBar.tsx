import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { AccentColor, getSelectedStyle } from "@/lib/layoutUtils";
import {
  Task,
  UUID,
  getAllTasksFromSource,
  getAllTasksFromTarget,
} from "@/models/task";
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
  const { tasks, stackedTasks } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);
  const cards: Card[] = useMemo(() => {
    return (stackedTasks.toJS() as Task[]).map((task) => ({
      id: task.id,
      title: task.name,
      isSelected: task.isSelected,
    }));
  }, [stackedTasks]);
  const dependentCards = useMemo(() => {
    const selectedCard = cards.filter((card) => card.isSelected)[0];
    if (selectedCard === undefined) return [];
    const candidates = getAllTasksFromSource(tasks, selectedCard.id)
      .concat(getAllTasksFromTarget(tasks, selectedCard.id))
      .map(({ id }) => id);
    return cards
      .filter((card) => candidates.includes(card.id))
      .map(({ id }) => id);
  }, [cards, tasks]);

  return (
    <div
      className="bg-darkGray"
      style={getSelectedStyle(mode === Mode.SideBarSelecting, "blue")}
    >
      {cards.map((card) => {
        const style = card.isSelected
          ? getSelectedStyle(true, AccentColor)
          : dependentCards.includes(card.id)
            ? getSelectedStyle(true, "blue")
            : getSelectedStyle(false, "");
        return <CardComponent key={card.id} card={card} style={style} />;
      })}
    </div>
  );
}
