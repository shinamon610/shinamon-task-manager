import { flatten } from "@/utils";
import { Mode } from "@/vim/mode";
import { selectingModes, inputtingModes } from "@/vim/mode";
import { MutableRefObject, useRef, useEffect } from "react";
import { Option, SelectBox } from "./selectBox";
import { Key } from "./key";
import { FlexContainer } from "./flexContainer";
import { Status } from "@/models/status";
import { Assignee } from "@/models/assignee";
import { UUID } from "@/models/task";
import { Task } from "@/models/task";
import moment, { Moment } from "moment";
import { MultiBox } from "./multibox";
import { CreatableBox } from "./creatableBox";

type EditBarProps = {
  mode: Mode;
  tasks: Task[];
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;

  selectedStatus: Option<Status>;
  setSelectedStatus: React.Dispatch<React.SetStateAction<Option<Status>>>;
  statuses: Set<Option<Status>>;
  setStatuses: React.Dispatch<React.SetStateAction<Set<Option<Status>>>>;

  selectedAssignee: Option<Assignee> | null;
  setSelectedAssignee: React.Dispatch<
    React.SetStateAction<Option<Assignee> | null>
  >;
  assignees: Set<Option<Assignee>>;
  setAssignees: React.Dispatch<React.SetStateAction<Set<Option<Assignee>>>>;

  selectedSources: Set<Option<UUID>>;
  setSelectedSources: React.Dispatch<React.SetStateAction<Set<Option<UUID>>>>;
  sourcesRef: MutableRefObject<null>;

  selectedTargets: Set<Option<UUID>>;
  setSelectedTargets: React.Dispatch<React.SetStateAction<Set<Option<UUID>>>>;
  targetsRef: MutableRefObject<null>;

  estimatedTime: number | null;
  setEstimatedTime: React.Dispatch<React.SetStateAction<number | null>>;

  spentTime: number | null;
  setSpentTime: React.Dispatch<React.SetStateAction<number | null>>;

  startDateTime: Moment | null;
  setStartDateTime: React.Dispatch<React.SetStateAction<Moment | null>>;

  endDateTime: Moment | null;
  setEndDateTime: React.Dispatch<React.SetStateAction<Moment | null>>;

  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
};

function createContent(
  {
    mode,
    tasks,
    title,
    setTitle,
    selectedStatus,
    setSelectedStatus,
    statuses,
    setStatuses,
    selectedAssignee,
    setSelectedAssignee,
    assignees,
    setAssignees,
    selectedSources,
    setSelectedSources,
    sourcesRef,
    selectedTargets,
    setSelectedTargets,
    targetsRef,
    estimatedTime,
    setEstimatedTime,
    spentTime,
    setSpentTime,
    startDateTime,
    setStartDateTime,
    endDateTime,
    setEndDateTime,
    memo,
    setMemo,
  }: EditBarProps,
  titleRef: MutableRefObject<null>,
  statusRef: MutableRefObject<null>,
  assigneeRef: MutableRefObject<null>,
  estimatedRef: MutableRefObject<null>,
  spentRef: MutableRefObject<null>,
  startDateTimeRef: MutableRefObject<null>,
  endDateTimeRef: MutableRefObject<null>,
  memoRef: MutableRefObject<null>
): React.JSX.Element | null {
  const dateFormat = "YYYY-MM-DDTHH:mm";

  return (
    <>
      <FlexContainer
        components={[
          <label key={"title"}>Title:</label>,
          <input
            key={"titleInput"}
            name="title"
            defaultValue={title}
            disabled={isDisabled(mode)}
            ref={titleRef}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />,
        ]}
        isSelected={mode === Mode.TitleSelecting}
        ratios={[0, 1]}
      />
      <hr />
      <FlexContainer
        components={[
          <FlexContainer
            key={"s"}
            components={[
              <label key={"status"}>Status:</label>,
              <SelectBox
                key={"statusInput"}
                isDisabled={isDisabled(mode)}
                defaultOption={selectedStatus}
                data={statuses}
                setSelectedValue={setSelectedStatus}
                ref={statusRef}
              />,
            ]}
            isSelected={mode === Mode.StatusSelecting}
            ratios={[0, 1]}
          />,
          <FlexContainer
            key="a"
            components={[
              <label key={"assignee"}>Assignee:</label>,
              <CreatableBox
                key={"assigneeInput"}
                isDisabled={isDisabled(mode)}
                defaultOption={selectedAssignee}
                data={assignees}
                setData={setAssignees}
                setSelectedValue={setSelectedAssignee}
                ref={assigneeRef}
              />,
            ]}
            isSelected={mode === Mode.AssigneeSelecting}
            ratios={[0, 1]}
          />,
        ]}
        isSelected={false}
        ratios={[1, 1]}
      />
      <hr />
      <FlexContainer
        components={[
          <FlexContainer
            key={"sourceflex"}
            components={[
              <label key={"source"}>Sources:</label>,
              <MultiBox
                key={"sourceInput"}
                isDisabled={isDisabled(mode)}
                defaultOption={selectedSources}
                data={
                  new Set(
                    tasks.map((task) => ({
                      value: task.id,
                      label: task.name,
                    }))
                  )
                }
                setSelectedValue={setSelectedSources}
                ref={sourcesRef}
              />,
            ]}
            isSelected={mode === Mode.SourcesSelecting}
            ratios={[0, 1]}
          />,
          <FlexContainer
            key={"targetflex"}
            components={[
              <label key={"target"}>Targets:</label>,
              <MultiBox
                key={"targetInput"}
                isDisabled={isDisabled(mode)}
                defaultOption={selectedTargets}
                data={
                  new Set(
                    tasks.map((task) => ({
                      value: task.id,
                      label: task.name,
                    }))
                  )
                }
                setSelectedValue={setSelectedTargets}
                ref={targetsRef}
              />,
            ]}
            isSelected={mode === Mode.TargetsSelecting}
            ratios={[0, 1]}
          />,
        ]}
        isSelected={false}
        ratios={[1, 1]}
      />
      <hr />
      <FlexContainer
        components={[
          <FlexContainer
            key={"startFlex"}
            components={[
              <label key={"start"}>Start:</label>,
              <input
                key={"startInput"}
                name="start"
                type="datetime-local"
                disabled={isDisabled(mode)}
                defaultValue={startDateTime?.format(dateFormat)}
                ref={startDateTimeRef}
                onChange={(e) => {
                  setStartDateTime(moment(e.target.value));
                }}
              />,
            ]}
            isSelected={mode === Mode.StartDateTimeSelecting}
            ratios={[0, 1]}
          />,
          <FlexContainer
            key={"endFlex"}
            components={[
              <label key={"end"}>End:</label>,
              <input
                key={"endInput"}
                name="end"
                type="datetime-local"
                disabled={isDisabled(mode)}
                defaultValue={endDateTime?.format(dateFormat)}
                ref={endDateTimeRef}
                onChange={(e) => {
                  setEndDateTime(moment(e.target.value));
                }}
              />,
            ]}
            isSelected={mode === Mode.EndDateTimeSelecting}
            ratios={[0, 1]}
          />,
          <FlexContainer
            key={"estimatedFlex"}
            components={[
              <label key={"estimated"}>Estimated:</label>,
              <input
                key={"estimatedInput"}
                name="estimatedTime"
                type="number"
                defaultValue={estimatedTime?.toString()}
                disabled={isDisabled(mode)}
                ref={estimatedRef}
                onChange={(e) => {
                  setEstimatedTime(e.target.valueAsNumber);
                }}
                style={{ textAlign: "right" }}
              />,
              <label key={"ehours"}>Hours</label>,
            ]}
            isSelected={mode === Mode.EstimatedTimeSelecting}
            ratios={[0, 1, 0]}
          />,
          <FlexContainer
            key={"spentFlex"}
            components={[
              <label key={"spent"}>Spent:</label>,
              <input
                key={"spentInput"}
                name="spentTime"
                type="number"
                defaultValue={spentTime?.toString()}
                disabled={isDisabled(mode)}
                ref={spentRef}
                onChange={(e) => {
                  setSpentTime(e.target.valueAsNumber);
                }}
                style={{ textAlign: "right" }}
              />,
              <label key={"shours"}>Hours</label>,
            ]}
            isSelected={mode === Mode.SpentTimeSelecting}
            ratios={[0, 1, 0]}
          />,
        ]}
        isSelected={false}
        ratios={[1, 1, 1, 1]}
      />
      <hr />
      <FlexContainer
        components={[
          <label key={"memo"}>Memo:</label>,
          <input
            key={"memoInput"}
            name="memo"
            defaultValue={memo}
            disabled={isDisabled(mode)}
            ref={memoRef}
            onChange={(e) => {
              setMemo(e.target.value);
            }}
          />,
        ]}
        isSelected={mode === Mode.MemoSelecting}
        ratios={[0, 1]}
      />
      <hr />
    </>
  );
}
function isDisabled(mode: Mode) {
  return (
    !flatten(selectingModes).includes(mode) &&
    !flatten(inputtingModes).includes(mode)
  );
}
export const EditBar = (props: EditBarProps) => {
  const mode = props.mode;
  const titleRef = useRef(null);
  const statusRef = useRef(null);
  const assigneeRef = useRef(null);
  const sourcesRef = props.sourcesRef;
  const targetsRef = props.targetsRef;
  const estimatedRef = useRef(null);
  const spentRef = useRef(null);
  const startDateTimeRef = useRef(null);
  const endDateTimeRef = useRef(null);
  const memoRef = useRef(null);

  const refAndModes: [MutableRefObject<null>, Mode][] = [
    [titleRef, Mode.TitleInputting],
    [statusRef, Mode.StatusInputting],
    [assigneeRef, Mode.AssigneeInputting],
    [sourcesRef, Mode.SourcesInputting],
    [targetsRef, Mode.TargetsInputting],
    [estimatedRef, Mode.EstimatedTimeInputting],
    [spentRef, Mode.SpentTimeInputting],
    [startDateTimeRef, Mode.StartDateTimeInputting],
    [endDateTimeRef, Mode.EndDateTimeInputting],
    [memoRef, Mode.MemoInputting],
  ];
  useEffect(() => {
    const refAndMode = refAndModes.filter(([_, m]) => m === mode);
    if (refAndMode.length === 1) {
      // @ts-ignore
      refAndMode[0][0].current?.focus();
    } else {
      refAndModes.forEach(([ref, _]) => {
        // @ts-ignore
        ref.current?.blur();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div
      className="edit-bar"
      style={
        isDisabled(mode)
          ? { padding: "3px" }
          : { border: "3px solid var(--accent)" }
      }
    >
      {createContent(
        props,
        titleRef,
        statusRef,
        assigneeRef,
        estimatedRef,
        spentRef,
        startDateTimeRef,
        endDateTimeRef,
        memoRef
      )}
    </div>
  );
};
