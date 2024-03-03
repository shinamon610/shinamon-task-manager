import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { getSelectedStyle } from "@/lib/layoutUtils";
import { Task, UUID } from "@/models/task";
import { Mode } from "@/vim/mode";
import { useContext, useMemo } from "react";

type Card = {
  id: UUID;
  title: string;
  content: string;
};

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="border border-white items-center bg-active">
      <div>{card.title}</div>
      <div>{card.content}</div>
    </div>
  );
};

export function SideBar() {
  const { tasks } = useContext(GlobalContext);
  const { mode } = useContext(MainContext);
  const cards: Card[] = useMemo(() => {
    return (tasks.toJS() as Task[]).map((task) => ({
      id: task.id,
      title: task.name,
      content: task.memo,
    }));
  }, [tasks]);
  return (
    <div style={getSelectedStyle(mode === Mode.SideBarSelecting)}>
      {cards.map((card) => (
        <CardComponent key={card.id} card={card} />
      ))}
    </div>
  );
}
