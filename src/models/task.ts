import { v4 as uuidv4 } from "uuid";
import { NotStatus, toDefaultStatus, DefaultStatus, Status } from "./status";
import { Mode } from "@/vim/mode";
import { indexesToLabels, createLabelSelectedMatrix } from "./labels";
import { idf } from "@/utils";
import { Assignee } from "./assignee";

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

export function createTask(
  userInput: UserInput,
  userName: Assignee,
  tasks: Task[]
): Task {
  function toStatus(): Status {
    if (
      tasks.filter(
        ({ id, status }) =>
          userInput.from.includes(id) && status !== DefaultStatus.Done
      ).length > 0
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

export function selectTask(
  tasks: Task[],
  filteredTasks: Task[],
  serialInput: string
): [Mode, Task[]] {
  const labels = indexesToLabels(filteredTasks.length);
  const selectedMatrix = createLabelSelectedMatrix(labels, serialInput);
  const selectedIndex = selectedMatrix
    .map((selectedArray) => {
      return selectedArray.every(idf);
    })
    .indexOf(true);
  if (selectedIndex === -1) {
    return [Mode.Normal, tasks];
  }
  const selectedTaskId = filteredTasks[selectedIndex].id;
  const newTasks = tasks.map((task): Task => {
    if (selectedTaskId === task.id) {
      return {
        ...task,
        isSelected: true,
      };
    }
    return {
      ...task,
      isSelected: false,
    };
  });
  return [Mode.NodeSelecting, newTasks];
}

export function unSelectAll(tasks: Task[]): Task[] {
  return tasks.map((task): Task => {
    return {
      ...task,
      isSelected: false,
    };
  });
}

function deleteEdge(tasks: Task[], id: UUID): Task[] {
  return tasks.map((task): Task => {
    return {
      ...task,
      to: task.to.filter((to) => to !== id),
      from: task.from.filter((from) => from !== id),
    };
  });
}

function createEdge(tasks: Task[], from: UUID[], to: UUID[], id: UUID): Task[] {
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

function updateSelectedTask(tasks: Task[], newTask: Task): Task[] {
  return tasks.map((task): Task => {
    if (task.isSelected) {
      return newTask;
    }
    if (
      newTask.assignee !== null &&
      newTask.assignee === task.assignee &&
      newTask.status === DefaultStatus.Working &&
      task.status === DefaultStatus.Working
    ) {
      return {
        ...task,
        status: DefaultStatus.Pending,
      };
    }
    return task;
  });
}

export function updateTasks(
  tasks: Task[],
  userInfo: UserInput,
  userName: string
): Task[] {
  const newTask = createTask(userInfo, userName, tasks);
  const oldSelectedTask = getSelectedTask(tasks);
  return createEdge(
    deleteEdge(updateSelectedTask(tasks, newTask), oldSelectedTask.id),
    userInfo.from,
    userInfo.to,
    newTask.id
  );
}

export function deleteSelectedTask(tasks: Task[]): Task[] {
  const targetID = getSelectedTask(tasks).id;
  return deleteEdge(
    tasks.filter((task): boolean => {
      return task.id !== targetID;
    }),
    targetID
  );
}

export function getSelectedTask(tasks: Task[]): Task {
  return tasks.filter((task) => {
    return task.isSelected;
  })[0];
}

function getAllTasksFromSource(tasks: Task[], sourceID: UUID): Task[] {
  const maybeSource = tasks.filter((task) => task.id === sourceID);
  if (maybeSource.length === 0) {
    return [];
  }
  const source = maybeSource[0];
  return [
    source,
    ...source.to.flatMap((nextID) => getAllTasksFromSource(tasks, nextID)),
  ];
}

function getAllTasksFromTarget(tasks: Task[], targetID: UUID): Task[] {
  const maybeTarget = tasks.filter((task) => task.id === targetID);
  if (maybeTarget.length === 0) {
    return [];
  }
  const target = maybeTarget[0];
  return [
    target,
    ...target.from.flatMap((nextID) => getAllTasksFromTarget(tasks, nextID)),
  ];
}

export function filterTasks(
  tasks: Task[],
  filterTitle: string,
  filterStatus: Status | null,
  filterAssignee: Assignee | null,
  filterSoucres: Set<UUID>,
  filterTargets: Set<UUID>
): Task[] {
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
    console.log("fa", filterAssignee);
    return baseFilter(task, filterAssignee, (task, assignee) => {
      if (task.assignee === assignee) {
        return task;
      }
      return null;
    });
  }
  function filterByDependency(
    tasks: Task[],
    values: Set<UUID>,
    f: (task: Task[], filterValue: UUID) => Task[]
  ): Task[] {
    if (values.size === 0) {
      return tasks;
    }
    const allowedTasks = Array.from(values).flatMap((id) => f(tasks, id));
    return tasks.filter((task) => allowedTasks.includes(task));
  }

  const res = tasks.filter((task) => {
    return filterByAssignee(filterByStatus(filterByTitle(task))) != null;
  });
  return filterByDependency(
    filterByDependency(res, filterSoucres, getAllTasksFromSource),
    filterTargets,
    getAllTasksFromTarget
  );
}

export function updateTaskStatus(
  tasks: Task[],
  status: Status,
  userName: string
): Task[] {
  const selectedTask = getSelectedTask(tasks);
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

export function hasNotDoneChildTask(tasks: Task[]): boolean {
  const selectedTask = getSelectedTask(tasks);
  return (
    selectedTask.from.filter((id) => {
      return (
        tasks.filter((task) => task.id === id)[0].status !== DefaultStatus.Done
      );
    }).length > 0
  );
}
