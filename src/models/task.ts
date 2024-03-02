import { Command } from "@/vim/commands";
import { List } from "immutable";
import { v4 as uuidv4 } from "uuid";
import { Assignee } from "./assignee";
import { selectLabelIndex } from "./labels";
import { DefaultStatus, NotStatus, Status, toDefaultStatus } from "./status";

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
  priority: number;
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
  status: DefaultStatus.Pending,
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
          userInput.from.includes(id) && status !== DefaultStatus.Done
      ).size > 0
    ) {
      return DefaultStatus.Pending;
    }
    if (userInput.status == null) {
      return DefaultStatus.Pending;
    }
    return userInput.status;
  }

  function toAssignee(status: Status): Assignee | null {
    if (userInput.assignee != null && userInput.assignee !== "") {
      return userInput.assignee;
    }
    if (status === DefaultStatus.Working) {
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

function selectTask(
  tasks: List<Task>,
  filteredTasks: List<Task>,
  serialInput: string
): List<Task> {
  const selectedIndex = selectLabelIndex(filteredTasks, serialInput);
  if (selectedIndex === null) {
    return tasks;
  }
  const selectedTaskId = filteredTasks.get(selectedIndex)!.id;
  const newTasks = tasks.map((task): Task => {
    return {
      ...task,
      isSelected: selectedTaskId === task.id,
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
    if (task.status === DefaultStatus.Done) {
      return task;
    }

    // 新規タスクをworkingにしたとき、同じassigneeの他のタスクをpendingにする
    const isNewTaskWorking =
      newTask.assignee !== null &&
      newTask.assignee === task.assignee &&
      newTask.status === DefaultStatus.Working;

    // 新規タスクのtoのタスクがある時はそれもpendingにする
    const isNewTaskTo = newTask.to.includes(task.id);
    if (isNewTaskWorking || isNewTaskTo) {
      return {
        ...task,
        status: DefaultStatus.Pending,
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

function deleteSelectedTask(tasks: List<Task>): List<Task> {
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
  filterStatus: Status | null,
  filterAssignee: Assignee | null,
  filterSoucres: Set<UUID>,
  filterTargets: Set<UUID>,
  filterMemo: string
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
  function filterByStatus(task: Task | null): Task | null {
    return baseFilter(task, filterStatus, (task, status) => {
      if (Object.values(DefaultStatus).includes(status as DefaultStatus)) {
        return task.status === status ? task : null;
      }
      return task.status !== toDefaultStatus(status as NotStatus) ? task : null;
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
      filterByMemo(filterByAssignee(filterByStatus(filterByTitle(task)))) !=
      null
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
      return (
        tasks.filter((task) => task.id === id).get(0)!.status !==
        DefaultStatus.Done
      );
    }).length > 0
  );
}

export function createTasks(
  command: Command,
  tasks: List<Task>,
  filteredTasks: List<Task>,
  serialInput: string,
  userInput: UserInput,
  userName: string,
  brankInput: UserInput
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
      return selectTask(tasks, filteredTasks, serialInput);
    case Command.Cancel:
    case Command.ConfirmFilterEdit:
      return unSelectAll(tasks);
    case Command.ConfirmEdit:
      return updateTasks(tasks, userInput, userName);
    case Command.SetToWorking:
      return updateTaskStatus(tasks, DefaultStatus.Working, userName);
    case Command.SetToPending:
      return updateTaskStatus(tasks, DefaultStatus.Pending, userName);
    case Command.SetToDone:
      return updateTaskStatus(tasks, DefaultStatus.Done, userName);
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
    case Command.Nothing:
    case Command.Undo:
    case Command.Redo:
    case Command.SelectView:
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
      return null;
  }
}
