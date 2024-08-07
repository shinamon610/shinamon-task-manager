import { GlobalContext } from "@/contexts/globalContext";
import { MainContext } from "@/contexts/mainContext";
import { AccentColor, getSelectedStyle } from "@/lib/layoutUtils";
import { Assignee } from "@/models/assignee";
import {
  StatusLabel,
  loadInitialAllStatus,
  loadInitialStatusLabel,
} from "@/models/status";
import {
  Task,
  UUID,
  getAllTasksFromSource,
  getAllTasksFromTarget,
  getSelectedTask,
  noneTask,
} from "@/models/task";
import { idf } from "@/utils";
import {
  Mode,
  inputtingFilterModes,
  inputtingModes,
  isFilter,
  selectingFilterModes,
  selectingModes,
} from "@/vim/mode";
import { List } from "immutable";
import moment, { Moment } from "moment";
import { MutableRefObject, useContext, useEffect, useRef } from "react";
import { CreatableBox } from "./creatableBox";
import { FlexContainer } from "./flexContainer";
import { MultiBox } from "./multibox";
import { SelectBox } from "./selectBox";

type EditBarProps = {
  sourcesRef: MutableRefObject<null>;
  targetsRef: MutableRefObject<null>;

  estimatedTime: number | null;
  setEstimatedTime: React.Dispatch<React.SetStateAction<number | null>>;

  spentTime: number;
  setSpentTime: React.Dispatch<React.SetStateAction<number>>;

  startDateTime: Moment | null;
  setStartDateTime: React.Dispatch<React.SetStateAction<Moment | null>>;

  endDateTime: Moment | null;
  setEndDateTime: React.Dispatch<React.SetStateAction<Moment | null>>;
};

function createMultiSelectBoxData(
  tasks: List<Task>,
  isInputting: boolean, // filtering中は絞り込む必要ないので、判別するためのフラグ
  selectedIDs: Set<UUID>,
  f: (task: List<Task>, id: UUID) => List<Task>
): List<Task> {
  if (isInputting) {
    const fobiddens = List(Array.from(selectedIDs))
      .flatMap((id) => f(tasks, id))
      .map(({ id }) => id);
    const res = tasks.filter(
      ({ id, isSelected }) => !fobiddens.includes(id) && !isSelected
    );
    return res;
  }
  return tasks.push(noneTask); // filtering中は先がないものを絞り込むためにnoneTaskが必要
}

const dateFormat = "YYYY-MM-DDTHH:mm";

function getSelectedTaskCompletedDateLetter(tasks: List<Task>): string {
  const selectedTask = getSelectedTask(tasks);
  if (selectedTask === undefined) return "";
  if (selectedTask.status.type === "Done") {
    return moment(selectedTask.status.date).format(dateFormat);
  }
  return "";
}

function createContent(
  mode: Mode,
  tasks: List<Task>,
  title: string,
  setTitle: React.Dispatch<React.SetStateAction<string>>,
  selectedStatusLabel: StatusLabel | null,
  setSelectedStatusLabel:
    | React.Dispatch<React.SetStateAction<StatusLabel>>
    | React.Dispatch<React.SetStateAction<StatusLabel | null>>,
  filterDoneStart: Moment | null,
  setFilterDoneStart: React.Dispatch<React.SetStateAction<Moment | null>>,
  filterDoneEnd: Moment | null,
  setFilterDoneEnd: React.Dispatch<React.SetStateAction<Moment | null>>,
  statuses: Set<StatusLabel>,
  selectedAssignee: Assignee | null,
  setSelectedAssignee: React.Dispatch<React.SetStateAction<Assignee | null>>,
  assignees: Set<Assignee>,
  setAssignees: React.Dispatch<React.SetStateAction<Set<Assignee>>>,
  selectedSources: Set<UUID>,
  setSelectedSources: React.Dispatch<React.SetStateAction<Set<UUID>>>,
  sourcesRef: MutableRefObject<null>,
  selectedTargets: Set<UUID>,
  setSelectedTargets: React.Dispatch<React.SetStateAction<Set<UUID>>>,
  targetsRef: MutableRefObject<null>,
  estimatedTime: number | null,
  setEstimatedTime: React.Dispatch<React.SetStateAction<number | null>>,
  spentTime: number,
  setSpentTime: React.Dispatch<React.SetStateAction<number>>,
  startDateTime: Moment | null,
  setStartDateTime: React.Dispatch<React.SetStateAction<Moment | null>>,
  endDateTime: Moment | null,
  setEndDateTime: React.Dispatch<React.SetStateAction<Moment | null>>,
  memo: string,
  setMemo: React.Dispatch<React.SetStateAction<string>>,
  titleRef: MutableRefObject<null>,
  statusRef: MutableRefObject<null>,
  doneStartRef: MutableRefObject<null>,
  doneEndRef: MutableRefObject<null>,
  assigneeRef: MutableRefObject<null>,
  estimatedRef: MutableRefObject<null>,
  spentRef: MutableRefObject<null>,
  startDateTimeRef: MutableRefObject<null>,
  endDateTimeRef: MutableRefObject<null>,
  memoRef: MutableRefObject<null>
): React.JSX.Element | null {
  return (
    <>
      <FlexContainer
        components={[
          <label key={"title"}>Title:</label>,
          <input
            key={"titleInput"}
            name="title"
            value={title}
            disabled={
              mode !== Mode.TitleInputting && mode !== Mode.FilterTitleInputting
            }
            ref={titleRef}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />,
        ]}
        isSelected={
          mode === Mode.TitleSelecting || mode === Mode.FilterTitleSelecting
        }
        ratios={[0, 1]}
      />
      <hr />
      <FlexContainer
        components={[
          <FlexContainer
            key={"s"}
            components={[
              <FlexContainer
                key={"sf"}
                components={[
                  <label key={"status"}>Status:</label>,
                  <SelectBox
                    key={"statusInput"}
                    isDisabled={
                      mode !== Mode.StatusInputting &&
                      mode !== Mode.FilterStatusInputting
                    }
                    defaultOption={selectedStatusLabel}
                    data={statuses}
                    setSelectedValue={(value) => {
                      if ((value as StatusLabel) !== "Done") {
                        setFilterDoneStart(null);
                        setFilterDoneEnd(null);
                      }
                      setSelectedStatusLabel(value);
                    }}
                    ref={statusRef}
                    toLabel={idf}
                    nullable={
                      mode === Mode.FilterStatusSelecting ||
                      mode === Mode.FilterStatusInputting
                    }
                  />,
                ]}
                isSelected={
                  mode === Mode.StatusSelecting ||
                  mode === Mode.FilterStatusSelecting
                }
                ratios={[0, 1]}
              />,
              <FlexContainer
                key="fd"
                components={[
                  <label key={"doneDate"}>On:</label>,
                  isFilter(mode) ? (
                    <FlexContainer
                      key={"doneDateSE"}
                      components={[
                        <FlexContainer
                          key="s1"
                          components={[
                            <input
                              key={"doneStart"}
                              name="doneStart"
                              type="datetime-local"
                              placeholder="YYYY-MM-DDTHH:MM"
                              value={
                                filterDoneStart == null
                                  ? ""
                                  : filterDoneStart.format(dateFormat)
                              }
                              ref={doneStartRef}
                              onChange={(e) => {
                                const maybeDate = moment(e.target.value);
                                setFilterDoneStart(
                                  maybeDate.isValid() ? maybeDate : null
                                );
                              }}
                            />,
                          ]}
                          isSelected={mode === Mode.FilterDoneStartSelecting}
                          ratios={[1]}
                        />,
                        <label key="nyoro">~</label>,
                        <FlexContainer
                          key="s2"
                          components={[
                            <input
                              key={"doneEnd"}
                              name="doneEnd"
                              type="datetime-local"
                              value={
                                filterDoneEnd == null
                                  ? ""
                                  : filterDoneEnd.format(dateFormat)
                              }
                              ref={doneEndRef}
                              onChange={(e) => {
                                const maybeDate = moment(e.target.value);
                                setFilterDoneEnd(
                                  maybeDate.isValid() ? maybeDate : null
                                );
                              }}
                            />,
                          ]}
                          isSelected={mode === Mode.FilterDoneEndSelecting}
                          ratios={[1]}
                        />,
                      ]}
                      isSelected={false}
                      ratios={[1, 0, 1]}
                    />
                  ) : (
                    <label key={"doneDateOn"}>
                      {getSelectedTaskCompletedDateLetter(tasks)}
                    </label>
                  ),
                ]}
                isSelected={false}
                ratios={[0, 1]}
              />,
            ]}
            isSelected={false}
            ratios={[1, 1]}
          />,
          <FlexContainer
            key="a"
            components={[
              <label key={"assignee"}>Assignee:</label>,
              <CreatableBox
                key={"assigneeInput"}
                isDisabled={
                  mode !== Mode.AssigneeInputting &&
                  mode !== Mode.FilterAssigneeInputting
                }
                defaultOption={selectedAssignee}
                data={assignees}
                setData={setAssignees}
                setSelectedValue={setSelectedAssignee}
                ref={assigneeRef}
                toLabel={idf}
                autoFocus={false}
              />,
            ]}
            isSelected={
              mode === Mode.AssigneeSelecting ||
              mode === Mode.FilterAssigneeSelecting
            }
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
                isDisabled={
                  mode !== Mode.SourcesInputting &&
                  mode !== Mode.FilterSourcesInputting
                }
                defaultOption={selectedSources}
                tasks={createMultiSelectBoxData(
                  tasks,
                  mode === Mode.SourcesInputting,
                  selectedTargets,
                  getAllTasksFromSource
                )}
                setSelectedValue={setSelectedSources}
                ref={sourcesRef}
              />,
            ]}
            isSelected={
              mode === Mode.SourcesSelecting ||
              mode === Mode.FilterSourcesSelecting
            }
            ratios={[0, 1]}
          />,
          <FlexContainer
            key={"targetflex"}
            components={[
              <label key={"target"}>Targets:</label>,
              <MultiBox
                key={"targetInput"}
                isDisabled={
                  mode !== Mode.TargetsInputting &&
                  mode !== Mode.FilterTargetsInputting
                }
                defaultOption={selectedTargets}
                tasks={createMultiSelectBoxData(
                  tasks,
                  mode === Mode.TargetsInputting,
                  selectedSources,
                  getAllTasksFromTarget
                )}
                setSelectedValue={setSelectedTargets}
                ref={targetsRef}
              />,
            ]}
            isSelected={
              mode === Mode.TargetsSelecting ||
              mode === Mode.FilterTargetsSelecting
            }
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
                disabled={mode !== Mode.StartDateTimeInputting}
                value={
                  startDateTime == null ? "" : startDateTime.format(dateFormat)
                }
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
                disabled={mode !== Mode.EndDateTimeInputting}
                value={
                  endDateTime == null ? "" : endDateTime.format(dateFormat)
                }
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
                value={estimatedTime == null ? "" : estimatedTime.toString()}
                disabled={mode !== Mode.EstimatedTimeInputting}
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
                value={spentTime.toString()}
                disabled={mode !== Mode.SpentTimeInputting}
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
            value={memo}
            disabled={
              mode !== Mode.MemoInputting && mode !== Mode.FilterMemoInputting
            }
            ref={memoRef}
            onChange={(e) => {
              setMemo(e.target.value);
            }}
          />,
        ]}
        isSelected={
          mode === Mode.MemoSelecting || mode === Mode.FilterMemoSelecting
        }
        ratios={[0, 1]}
      />
      <hr />
    </>
  );
}

function isDisabled(mode: Mode): boolean {
  return [
    selectingModes,
    inputtingModes,
    selectingFilterModes(true),
    inputtingFilterModes(true),
    selectingFilterModes(false),
    inputtingFilterModes(false),
  ].every((modes) => {
    return !modes.flat().includes(mode);
  });
}

export const EditBar = ({
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
}: EditBarProps) => {
  const { tasks, assignees, setAssignees } = useContext(GlobalContext);
  const mainContext = useContext(MainContext);
  const {
    mode,
    filterDoneStart,
    setFilterDoneStart,
    filterDoneEnd,
    setFilterDoneEnd,
  } = mainContext;
  const title = isFilter(mode) ? mainContext.filterTitle : mainContext.title;
  const setTitle = isFilter(mode)
    ? mainContext.setFilterTitle
    : mainContext.setTitle;
  const statusLabel = isFilter(mode)
    ? mainContext.filterStatusLabel
    : mainContext.selectedStatusLabel;
  const setStatusLabel = isFilter(mode)
    ? mainContext.setFilterStatusLabel
    : mainContext.setSelectedStatusLabel;
  const statuses = isFilter(mode)
    ? loadInitialAllStatus()
    : loadInitialStatusLabel();
  const selectedAssignee = isFilter(mode)
    ? mainContext.filterAssignee
    : mainContext.selectedAssignee;
  const setSelectedAssignee = isFilter(mode)
    ? mainContext.setFilterAssignee
    : mainContext.setSelectedAssignee;
  const selectedSources = isFilter(mode)
    ? mainContext.filterSources
    : mainContext.selectedSources;
  const setSelectedSources = isFilter(mode)
    ? mainContext.setFilterSources
    : mainContext.setSelectedSources;
  const selectedTargets = isFilter(mode)
    ? mainContext.filterTargets
    : mainContext.selectedTargets;
  const setSelectedTargets = isFilter(mode)
    ? mainContext.setFilterTargets
    : mainContext.setSelectedTargets;
  const memo = isFilter(mode) ? mainContext.filterMemo : mainContext.memo;
  const setMemo = isFilter(mode)
    ? mainContext.setFilterMemo
    : mainContext.setMemo;

  const titleRef = useRef(null);
  const statusRef = useRef(null);
  const doneStartRef = useRef(null);
  const doneEndRef = useRef(null);
  const assigneeRef = useRef(null);
  const estimatedRef = useRef(null);
  const spentRef = useRef(null);
  const startDateTimeRef = useRef(null);
  const endDateTimeRef = useRef(null);
  const memoRef = useRef(null);

  const refAndModes: [MutableRefObject<null>, Mode[]][] = [
    [titleRef, [Mode.TitleInputting, Mode.FilterTitleInputting]],
    [statusRef, [Mode.StatusInputting, Mode.FilterStatusInputting]],
    [doneStartRef, [Mode.FilterDoneStartInputting]],
    [doneEndRef, [Mode.FilterDoneEndInputting]],
    [assigneeRef, [Mode.AssigneeInputting, Mode.FilterAssigneeInputting]],
    [sourcesRef, [Mode.SourcesInputting, Mode.FilterSourcesInputting]],
    [targetsRef, [Mode.TargetsInputting, Mode.FilterTargetsInputting]],
    [estimatedRef, [Mode.EstimatedTimeInputting]],
    [spentRef, [Mode.SpentTimeInputting]],
    [startDateTimeRef, [Mode.StartDateTimeInputting]],
    [endDateTimeRef, [Mode.EndDateTimeInputting]],
    [memoRef, [Mode.MemoInputting, Mode.FilterMemoInputting]],
  ];
  useEffect(() => {
    const refAndMode = refAndModes.filter(([_, m]) => m.includes(mode));
    // refAndMode.lengthは1か0になる。
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
      style={getSelectedStyle(!isDisabled(mode), AccentColor)}
    >
      {createContent(
        mode,
        tasks,
        title,
        setTitle,
        statusLabel,
        setStatusLabel,
        filterDoneStart,
        setFilterDoneStart,
        filterDoneEnd,
        setFilterDoneEnd,
        statuses,
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
        titleRef,
        statusRef,
        doneStartRef,
        doneEndRef,
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
