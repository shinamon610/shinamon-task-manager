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

function getFromTasks(targetID: UUID, tasks: Task[]): Task[] {
  return tasks.filter((task) => task.to.includes(targetID));
}

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
    };
  });
}

function createEdge(tasks: Task[], from: UUID[], id: UUID): Task[] {
  return tasks.map((task): Task => {
    if (from.includes(task.id)) {
      return {
        ...task,
        to: [...task.to, id],
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
    newTask.id
  );
}

export function getSelectedTask(tasks: Task[]): Task {
  return tasks.filter((task) => {
    return task.isSelected;
  })[0];
}

export function filterTasks(
  tasks: Task[],
  filterTitle: string,
  filterStatus: Status | null,
  filterAssignee: Assignee | null
): Task[] {
  const res = tasks.filter((task) => {
    if (task.name.includes(filterTitle)) {
      if (filterStatus == null) {
        return true;
      }
      if (
        Object.values(DefaultStatus).includes(filterStatus as DefaultStatus)
      ) {
        return task.status === filterStatus;
      }
      return task.status !== toDefaultStatus(filterStatus as NotStatus);
    }
  });
  return res;
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
      from: getFromTasks(selectedTask.id, tasks).map(({ id }) => id),
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
    getFromTasks(selectedTask.id, tasks).filter(({ status }) => {
      return status !== DefaultStatus.Done;
    }).length > 0
  );
}
