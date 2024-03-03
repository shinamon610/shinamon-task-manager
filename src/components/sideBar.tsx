import { GlobalContext } from "@/contexts/globalContext";
import { Task, UUID } from "@/models/task";
import { useContext, useMemo } from "react";

type Card = {
  id: UUID;
  title: string;
  content: string;
};

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--active)",
      }}
    >
      <h2>{card.title}</h2>
      <p>{card.content}</p>
    </div>
  );
};

export function SideBar() {
  const { tasks } = useContext(GlobalContext);
  const cards: Card[] = useMemo(() => {
    return (tasks.toJS() as Task[]).map((task) => ({
      id: task.id,
      title: task.name,
      content: task.memo,
    }));
  }, [tasks]);
  return (
    <div className="w-64 h-64 overflow-auto  ">
      {cards.map((card) => (
        <CardComponent key={card.id} card={card} />
      ))}
    </div>
  );
}
