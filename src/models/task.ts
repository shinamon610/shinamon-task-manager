import { getCircularIndex } from "@/utils";
import { Command } from "@/vim/commands";
import { List } from "immutable";
import moment, { Moment } from "moment";
import { v4 as uuidv4 } from "uuid";
import { Assignee } from "./assignee";
import { selectLabelIndex } from "./labels";
import {
  AllDefaultStatusLabel,
  DefaultStatusLabel,
  Done,
  NotStatusLabel,
  Status,
  StatusLabel,
  toDefaultStatusLabel,
} from "./status";

export type UUID = string;

export type Task = {
  id: UUID;
  name: string;
  startTime: moment.Moment | null;
  endTime: moment.Moment | null;
  estimatedTime: number | null;
  spentTime: number;
  to: UUID[];
  from: UUID[]; // fromを辿って検索するから、やっぱり必要
  priority: number; // 大きい方が優先度高い
  memo: string;
  status: Status;
  assignee: Assignee | null;
  isSelected: boolean;
};

// SourcesやTargetsのfilterで先が無いものを選択するために作成
export const noneId = "noneTask";
export const noneTask: Task = {
  id: noneId,
  name: "None",
  startTime: null,
  endTime: null,
  estimatedTime: null,
  spentTime: 0,
  to: [],
  from: [],
  priority: 0,
  memo: "",
  status: { type: "Pending" },
  assignee: null,
  isSelected: false,
};

export type UserInput = {
  name: string | null;
  startTime: moment.Moment | null;
  endTime: moment.Moment | null;
  estimatedTime: number | null;
  spentTime: number | null;
  to: UUID[];
  from: UUID[];
  priority: number | null;
  memo: string | null;
  status: Status | null;
  assignee: Assignee | null;
};

function createTask(
  userInput: UserInput,
  userName: Assignee,
  tasks: List<Task>
): Task {
  function toStatus(): Status {
    if (
      tasks.filter(
        ({ id, status }) =>
          userInput.from.includes(id) && status.type !== "Done"
      ).size > 0
    ) {
      return { type: "Pending" };
    }
    if (userInput.status == null) {
      return { type: "Pending" };
    }
    return userInput.status;
  }

  function toAssignee(status: Status): Assignee | null {
    if (userInput.assignee != null && userInput.assignee !== "") {
      return userInput.assignee;
    }
    if (status.type === "Working") {
      return userName;
    }
    return null;
  }

  const newStatus = toStatus();
  return {
    id: uuidv4(),
    name: userInput.name || "no name",
    startTime: userInput.startTime,
    endTime: userInput.endTime,
    estimatedTime: userInput.estimatedTime,
    spentTime: userInput.spentTime || 0,
    to: userInput.to,
    from: userInput.from,
    priority: 0,
    memo: userInput.memo || "",
    status: newStatus,
    assignee: toAssignee(newStatus),
    isSelected: true,
  };
}

function getSelectedIdFromInput(
  filteredTasks: List<Task>,
  serialInput: string
): UUID | null {
  const selectedIndex = selectLabelIndex(filteredTasks, serialInput);
  if (selectedIndex === null) {
    return null;
  }
  return filteredTasks.get(selectedIndex)!.id;
}

function selectTask(tasks: List<Task>, idToSelect: UUID): List<Task> {
  const newTasks = tasks.map((task): Task => {
    return {
      ...task,
      isSelected: task.id === idToSelect,
    };
  });
  return newTasks;
}

function unSelectAll(tasks: List<Task>): List<Task> {
  return tasks.map((task): Task => {
    return {
      ...task,
      isSelected: false,
    };
  });
}

function deleteEdge(tasks: List<Task>, id: UUID): List<Task> {
  return tasks.map((task): Task => {
    return {
      ...task,
      to: task.to.filter((to) => to !== id),
      from: task.from.filter((from) => from !== id),
    };
  });
}

function createEdge(
  tasks: List<Task>,
  from: UUID[],
  to: UUID[],
  id: UUID
): List<Task> {
  const res = tasks.map((task): Task => {
    if (from.includes(task.id)) {
      return {
        ...task,
        to: [...task.to, id],
      };
    }
    return task;
  });
  return res.map((task) => {
    if (to.includes(task.id)) {
      return {
        ...task,
        from: [...task.from, id],
      };
    }
    return task;
  });
}

function updateSelectedTask(tasks: List<Task>, newTask: Task): List<Task> {
  return tasks.map((task): Task => {
    if (task.isSelected) {
      return newTask;
    }
    //もうDoneのタスクは何もしない
    if (task.status.type === "Done") {
      return task;
    }

    // 新規タスクをworkingにしたとき、同じassigneeの他のタスクをpendingにする
    const isNewTaskWorking =
      newTask.assignee !== null &&
      newTask.assignee === task.assignee &&
      newTask.status.type === "Working";

    // 新規タスクのtoのタスクがある時はそれもpendingにする
    const isNewTaskTo = newTask.to.includes(task.id);
    if (isNewTaskWorking || isNewTaskTo) {
      return {
        ...task,
        status: { type: "Pending" },
      };
    }
    return task;
  });
}

function updateTasks(
  tasks: List<Task>,
  userInfo: UserInput,
  userName: string
): List<Task> {
  const oldSelectedTask = getSelectedTask(tasks)!;
  const newTask = {
    ...createTask(userInfo, userName, tasks),
    id: oldSelectedTask.id, // idは変更しない。filterSourcesとfilterTargetsで参照している
  };
  return createEdge(
    deleteEdge(updateSelectedTask(tasks, newTask), oldSelectedTask.id),
    userInfo.from,
    userInfo.to,
    newTask.id
  );
}

export function deleteSelectedTask(tasks: List<Task>): List<Task> {
  const targetID = getSelectedTask(tasks)!.id;
  return deleteEdge(
    tasks.filter((task): boolean => {
      return task.id !== targetID;
    }),
    targetID
  );
}

export function getSelectedTask(tasks: List<Task>): Task | undefined {
  return tasks.find((task) => {
    return task.isSelected;
  });
}

export function getAllTasksFromSource(
  tasks: List<Task>,
  sourceId: UUID
): List<Task> {
  if (sourceId === noneId) {
    return tasks.filter((task) => task.from.length === 0);
  }
  const maybeSource = tasks.filter((task) => task.id === sourceId);
  if (maybeSource.size === 0) {
    return List([]);
  }
  const source = maybeSource.get(0)!;

  return List(source.to)
    .flatMap((nextID) => getAllTasksFromSource(tasks, nextID))
    .push(source);
}

export function getAllTasksFromTarget(
  tasks: List<Task>,
  targetId: UUID
): List<Task> {
  if (targetId === noneId) {
    return tasks.filter((task) => task.to.length === 0);
  }
  const maybeTarget = tasks.filter((task) => task.id === targetId);
  if (maybeTarget.size === 0) {
    return List([]);
  }
  const target = maybeTarget.get(0)!;
  return List(target.from)
    .flatMap((nextID) => getAllTasksFromTarget(tasks, nextID))
    .push(target);
}

export function filterTasks(
  tasks: List<Task>,
  filterTitle: string,
  filterStatusLabel: StatusLabel | null,
  filterAssignee: Assignee | null,
  filterSoucres: Set<UUID>,
  filterTargets: Set<UUID>,
  filterMemo: string,
  filterDoneStart: Moment | null,
  filterDoneEnd: Moment | null
): List<Task> {
  function baseFilter<S>(
    task: Task | null,
    filterValue: S | null,
    f: (task: Task, filterValue: S) => Task | null
  ): Task | null {
    if (task == null) {
      return null;
    }
    if (filterValue == null || filterValue === "") {
      return task;
    }
    return f(task, filterValue);
  }
  function filterByTitle(task: Task): Task | null {
    return task.name.includes(filterTitle) ? task : null;
  }
  function filterByDoneStart(task: Task | null): Task | null {
    return baseFilter(task, filterDoneStart, (task, doneStart) => {
      if (task.status.type === "Done") {
        return (task.status as Done).date >= doneStart ? task : null;
      }
      return task;
    });
  }
  function filterByDoneEnd(task: Task | null): Task | null {
    return baseFilter(task, filterDoneEnd, (task, doneEnd) => {
      if (task.status.type === "Done") {
        return (task.status as Done).date <= doneEnd ? task : null;
      }
      return task;
    });
  }
  function filterByStatus(task: Task | null): Task | null {
    return baseFilter(task, filterStatusLabel, (task, statusLabel) => {
      if (AllDefaultStatusLabel.includes(statusLabel as DefaultStatusLabel)) {
        return task.status.type === statusLabel ? task : null;
      }
      return task.status.type !==
        toDefaultStatusLabel(statusLabel as NotStatusLabel)
        ? task
        : null;
    });
  }
  function filterByAssignee(task: Task | null): Task | null {
    return baseFilter(task, filterAssignee, (task, assignee) => {
      if (task.assignee === assignee) {
        return task;
      }
      return null;
    });
  }
  function filterByMemo(task: Task | null): Task | null {
    return baseFilter(task, filterMemo, (task, value) => {
      return task.memo.includes(value) ? task : null;
    });
  }

  function filterByDependency(
    tasks: List<Task>,
    values: Set<UUID>,
    f: (task: List<Task>, filterValue: UUID) => List<Task>
  ): List<Task> {
    if (values.size === 0) {
      return tasks;
    }
    const allowedTasks = List(Array.from(values)).flatMap((id) => f(tasks, id));
    return tasks.filter((task) => allowedTasks.includes(task));
  }

  const filteredByDependency = filterByDependency(
    filterByDependency(tasks, filterSoucres, getAllTasksFromSource),
    filterTargets,
    getAllTasksFromTarget
  );
  return filteredByDependency.filter((task) => {
    return (
      filterByDoneEnd(
        filterByDoneStart(
          filterByMemo(filterByAssignee(filterByStatus(filterByTitle(task))))
        )
      ) != null
    );
  });
}

function updateTaskStatus(
  tasks: List<Task>,
  status: Status,
  userName: string
): List<Task> {
  const selectedTask = getSelectedTask(tasks)!;
  return updateTasks(
    tasks,
    {
      name: selectedTask.name,
      startTime: selectedTask.startTime,
      endTime: selectedTask.endTime,
      estimatedTime: selectedTask.estimatedTime,
      spentTime: selectedTask.spentTime,
      to: selectedTask.to,
      from: selectedTask.from,
      priority: selectedTask.priority,
      memo: selectedTask.memo,
      status,
      assignee: selectedTask.assignee,
    },
    userName
  );
}

export function hasNotDoneChildTask(tasks: List<Task>): boolean {
  const selectedTask = getSelectedTask(tasks)!;
  return (
    selectedTask.from.filter((id) => {
      const maybeTarget = tasks.filter((task) => task.id === id); // dumpされて存在しない可能性がある。dumpされている場合はdoneになっているはずなので、対象から外す。
      if (maybeTarget.size === 0) return false;
      return maybeTarget.get(0)!.status.type !== "Done";
    }).length > 0
  );
}

function updatePriorities(
  tasks: List<Task>,
  ids: UUID[],
  newPriorities: number[]
): List<Task> {
  return tasks.map((task) => {
    const index = ids.findIndex((id) => id === task.id);
    return index === -1 ? task : { ...task, priority: newPriorities[index] };
  });
}

export function createTasks(
  command: Command,
  tasks: List<Task>,
  filteredTasks: List<Task>,
  stackedTasks: List<Task>,
  serialInput: string,
  userInput: UserInput,
  userName: string,
  brankInput: UserInput,
  isCreatingNewTask: boolean
): List<Task> | null {
  switch (command) {
    case Command.CreateTaskNode:
      const newTask = createTask(brankInput, userName, tasks);
      return updateTasks(
        unSelectAll(tasks).push(newTask),
        brankInput,
        userName
      );
    case Command.DeleteTaskNode:
      return deleteSelectedTask(tasks);
    case Command.SelectTaskNode:
      const selectedId = getSelectedIdFromInput(filteredTasks, serialInput);
      if (selectedId === null) {
        return tasks;
      }
      return selectTask(tasks, selectedId);
    case Command.OpenSideBar:
      if (getSelectedTask(tasks) === undefined && stackedTasks.size > 0) {
        return selectTask(tasks, stackedTasks.first()!.id);
      }
      return tasks;
    case Command.SelectAbove:
    case Command.SelectBelow:
      const f = () => {
        const currentIndex = stackedTasks.findIndex((task) => task.isSelected);
        if (currentIndex === -1) {
          return tasks;
        }
        return selectTask(
          tasks,
          stackedTasks.get(
            getCircularIndex(
              currentIndex,
              stackedTasks.size,
              command === Command.SelectAbove ? -1 : 1
            )
          )!.id
        );
      };
      return f();
    case Command.SwapAbove:
    case Command.SwapBelow:
      const g = () => {
        const diff = command === Command.SwapAbove ? -1 : 1;
        if (stackedTasks.size < 2) return tasks;
        const currentIndex = stackedTasks.findIndex((task) => task.isSelected);
        if (currentIndex === -1) {
          return tasks;
        }
        const indexes = [
          currentIndex,
          getCircularIndex(currentIndex, stackedTasks.size, diff),
        ];
        const ps = indexes
          .map((index) => stackedTasks.get(index)!.priority)
          .reverse();
        if (ps[0] === ps[1]) {
          ps[0] = ps[0] + diff;
        }
        return updatePriorities(
          tasks,
          indexes.map((index) => stackedTasks.get(index)!.id),
          ps
        );
      };
      return g();
    case Command.Cancel:
      if (isCreatingNewTask) {
        return unSelectAll(deleteSelectedTask(tasks));
      }
      return unSelectAll(tasks);
    case Command.ConfirmFilterEdit:
      return unSelectAll(tasks);
    case Command.ConfirmEdit:
      return updateTasks(tasks, userInput, userName);
    case Command.SetToWorking:
      const maxPriority = stackedTasks.map((task) => task.priority).max() ?? 0;
      return updatePriorities(
        updateTaskStatus(tasks, { type: "Working" }, userName),
        [getSelectedTask(tasks)!.id],
        [maxPriority + 1]
      );
    case Command.SetToPending:
      return updateTaskStatus(tasks, { type: "Pending" }, userName);
    case Command.SetToDone:
      return updateTaskStatus(
        tasks,
        { type: "Done", date: moment() },
        userName
      );
    case Command.DumpArchive:
      return tasks;
    case Command.ReadArchive:
      return tasks;
    case Command.ToGraph:
    case Command.ToTile:
    case Command.ToGantt:
    case Command.ToTimeLine:
    case Command.ViewMarkdownFile:
    case Command.InputMarkdownFile:
    case Command.SetEditor:
    case Command.OpenEditor:
    case Command.SelectTitle:
    case Command.InputTitle:
    case Command.SelectStatus:
    case Command.InputStatus:
    case Command.SelectAssignee:
    case Command.InputAssignee:
    case Command.SelectSources:
    case Command.InputSources:
    case Command.SelectTargets:
    case Command.InputTargets:
    case Command.SelectEstimatedTime:
    case Command.InputEstimatedTime:
    case Command.SelectSpentTime:
    case Command.InputSpentTime:
    case Command.SelectStartDateTime:
    case Command.InputStartDateTime:
    case Command.SelectEndDateTime:
    case Command.InputEndDateTime:
    case Command.SelectMemo:
    case Command.InputMemo:
    case Command.SelectAnotherLocation:
    case Command.Rename:
    case Command.SelectFilterTitle:
    case Command.InputFilterTitle:
    case Command.SelectFilterStatus:
    case Command.InputFilterStatus:
    case Command.SelectFilterAssignee:
    case Command.InputFilterAssignee:
    case Command.SelectFilterSources:
    case Command.InputFilterSources:
    case Command.SelectFilterTargets:
    case Command.InputFilterTargets:
    case Command.SelectFilterMemo:
    case Command.InputFilterMemo:
    case Command.SelectFilterDoneStart:
    case Command.InputFilterDoneStart:
    case Command.SelectFilterDoneEnd:
    case Command.InputFilterDoneEnd:
    case Command.Nothing:
    case Command.Undo:
    case Command.Redo:
    case Command.SelectView:
    case Command.SelectArchive:
    case Command.SelectSpan:
    case Command.SpanHour:
    case Command.SpanDay:
    case Command.SpanWeek:
    case Command.SpanMonth:
    case Command.SpanYear:
    case Command.ZoomIn:
    case Command.ZoomOut:
    case Command.PanLeft:
    case Command.PanRight:
    case Command.PanDown:
    case Command.PanUp:
    case Command.CloseSideBar:
    case Command.ShowSources:
    case Command.ShowTargets:
      return null;
  }
}
