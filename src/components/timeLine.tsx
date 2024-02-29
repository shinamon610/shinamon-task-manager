import { MainContext } from "@/contexts/mainContext";
import { Task, UUID } from "@/models/task";
import moment, { Moment } from "moment";
import React, { useContext, useMemo } from "react";

type Card = {
  id: UUID;
  title: string;
  content: string;
  time: Moment;
};

const TimeY: React.FC<{ times: Moment[] }> = ({ times }) => {
  return (
    <div
      style={{
        width: "100px",
        textAlign: "right",
        backgroundColor: "var(--dark-gray)",
      }}
    >
      {times.map((time, index) => (
        <div key={index}>{time.toISOString()}</div>
      ))}
    </div>
  );
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

export function TimeLine() {
  const { filteredTasks } = useContext(MainContext);
  const cards: Card[] = useMemo(() => {
    return (filteredTasks.toJS() as Task[]).map((task) => ({
      id: task.id,
      title: task.name,
      content: task.memo,
      time: task.startTime ?? moment(),
    }));
  }, [filteredTasks]);

  return (
    <div style={{ display: "flex", flexGrow: 1, overflowY: "auto" }}>
      <TimeY times={cards.map((card) => card.time)} />
      <div>
        {cards.map((card) => (
          <CardComponent key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
