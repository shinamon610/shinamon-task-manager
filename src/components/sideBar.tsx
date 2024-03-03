import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { AccentColor, getSelectedStyle } from "@/lib/layoutUtils";
import { DefaultStatus } from "@/models/status";
import { Task, UUID } from "@/models/task";
import { Mode } from "@/vim/mode";
import { useContext, useMemo } from "react";

type Card = {
  id: UUID;
  title: string;
};

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="border border-white items-center bg-active">
      <div className="truncate">{card.title}</div>
    </div>
  );
};

export function SideBar() {
  const { tasks, userName } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);
  const cards: Card[] = useMemo(() => {
    return (
      tasks
        .filter(
          (task) =>
            task.assignee === userName && task.status !== DefaultStatus.Done
        )
        .toJS() as Task[]
    ).map((task) => ({
      id: task.id,
      title: task.name,
    }));
  }, [tasks, userName]);
  return (
    <div style={getSelectedStyle(mode === Mode.SideBarSelecting, AccentColor)}>
      {cards.map((card) => (
        <CardComponent key={card.id} card={card} />
      ))}
    </div>
  );
}
