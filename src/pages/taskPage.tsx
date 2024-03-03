import { EditBar } from "@/components/editBar";
import { MyGantt } from "@/components/gantt";
import { KeyBar } from "@/components/keyBar";
import { SideBar } from "@/components/sideBar";
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
  refresh: boolean;
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
  refresh,
}: Props) {
  return (
    <div className="parent h-screen w-screen">
      <div className="div1">
        {viewMode === ViewMode.Graph || viewMode === ViewMode.Tile ? (
          <TaskGraph
            serialInput={serialInput}
            viewMode={viewMode}
            command={command}
            refresh={refresh}
          />
        ) : viewMode === ViewMode.TimeLine ? (
          <TimeLine />
        ) : viewMode === ViewMode.Gantt ? (
          <MyGantt />
        ) : (
          <></>
        )}
      </div>
      <div className="div2">
        <SideBar />
      </div>
      <div className="div3">
        <KeyBar />
      </div>
      <div className="div4">
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
      </div>
    </div>
  );
}
