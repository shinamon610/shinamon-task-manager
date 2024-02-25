import { EditBar } from "@/components/editBar";
import { MyGantt } from "@/components/gantt";
import { KeyBar } from "@/components/keyBar";
import TaskGraph from "@/components/taskGraph";
import { TimeLine } from "@/components/timeLine";
import { Command } from "@/vim/commands";
import { ViewMode } from "@/vim/viewMode";
import { Moment } from "moment";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

type Props = {
  serialInput: string;
  viewMode: ViewMode;
  command: Command;
  sourcesRef: MutableRefObject<null>;
  targetsRef: MutableRefObject<null>;
  estimatedTime: number | null;
  setEstimatedTime: Dispatch<SetStateAction<number | null>>;
  spentTime: number;
  setSpentTime: Dispatch<SetStateAction<number>>;
  startDateTime: Moment | null;
  setStartDateTime: Dispatch<SetStateAction<Moment | null>>;
  endDateTime: Moment | null;
  setEndDateTime: Dispatch<SetStateAction<Moment | null>>;
};

export function TaskPage({
  serialInput,
  viewMode,
  command,
  sourcesRef,
  targetsRef,
  estimatedTime,
  setEstimatedTime,
  spentTime,
  setSpentTime,
  startDateTime,
  setStartDateTime,
  endDateTime,
  setEndDateTime,
}: Props) {
  return (
    <>
      {viewMode === ViewMode.Graph || viewMode === ViewMode.Tile ? (
        <TaskGraph
          serialInput={serialInput}
          viewMode={viewMode}
          command={command}
        />
      ) : viewMode === ViewMode.TimeLine ? (
        <TimeLine />
      ) : viewMode === ViewMode.Gantt ? (
        <MyGantt />
      ) : (
        <></>
      )}
      <KeyBar />
      <EditBar
        sourcesRef={sourcesRef}
        targetsRef={targetsRef}
        estimatedTime={estimatedTime}
        setEstimatedTime={setEstimatedTime}
        spentTime={spentTime}
        setSpentTime={setSpentTime}
        startDateTime={startDateTime}
        setStartDateTime={setStartDateTime}
        endDateTime={endDateTime}
        setEndDateTime={setEndDateTime}
      />
    </>
  );
}
