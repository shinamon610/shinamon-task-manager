import { v4 as uuidv4 } from "uuid";
import { Status } from "./status";
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

export function getFromTaskIDs(targetID: UUID, tasks: Task[]): UUID[] {
  return tasks
    .filter((task) => task.to.includes(targetID))
    .map((task) => task.id);
}

export function createTask(userInput: UserInput, userName: Assignee): Task {
  function assignee(): Assignee | null {
    if (userInput.assignee != null && userInput.assignee !== "") {
      return userInput.assignee;
    }
    if (userInput.status === Status.Working) {
      return userName;
    }
    return null;
  }
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
    status: userInput.status || Status.Pending,
    assignee: assignee(),
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
    return task;
  });
}

export function updateTasks(
  tasks: Task[],
  userInfo: UserInput,
  userName: string
): Task[] {
  const newTask = createTask(userInfo, userName);
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

export function filterTasks(tasks: Task[], filterTitle: string): Task[] {
  const res = tasks.filter((task) => {
    return task.name.includes(filterTitle);
  });
  return res;
}
