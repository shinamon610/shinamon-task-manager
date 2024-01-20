import moment from "moment";
import { Dispatch, SetStateAction } from "react";
import { extractAssignees } from "./assignee";
import { Task } from "./task";

// fileを選択した瞬間にそこにtasks.jsonが作成される
function createFile(defaultPath: string): Promise<string | null> {
  return import("@tauri-apps/api/dialog").then(({ save }) =>
    save({
      defaultPath,
      filters: [{ name: "JSON", extensions: ["json"] }],
    })
  );
}

// fileを選択するだけ
function selectFile(defaultPath: string): Promise<string | null> {
  return import("@tauri-apps/api/dialog").then(
    ({ open }) =>
      open({
        defaultPath,
        filters: [{ name: "JSON", extensions: ["json"] }],
        multiple: false,
      }) as Promise<string | null>
  );
}

async function ensureDirExists(dir: string) {
  const { readDir, createDir } = await import("@tauri-apps/api/fs");
  try {
    await readDir(dir);
  } catch (error) {
    await createDir(dir, { recursive: true });
  }
}

const configFileName = "config.txt";

async function saveFilePath(
  filePath: Promise<string | null>
): Promise<string | null> {
  try {
    const fp = await filePath;
    if (fp === null || fp === "") {
      return null;
    }
    const { appConfigDir } = await import("@tauri-apps/api/path");
    const { BaseDirectory, writeTextFile } = await import("@tauri-apps/api/fs");
    await ensureDirExists(await appConfigDir());
    await writeTextFile(configFileName, fp, {
      dir: BaseDirectory.AppConfig,
    });
    return fp;
  } catch (error) {
    return null;
  }
}

const defaultPath = "tasks.json";

export function createThenSaveFilePath(): Promise<string | null> {
  return saveFilePath(createFile(defaultPath));
}

export function openThenSaveFilePath(): Promise<string | null> {
  return saveFilePath(selectFile(defaultPath));
}
export async function loadInitialFilePath(): Promise<string | null> {
  const { BaseDirectory, readTextFile } = await import("@tauri-apps/api/fs");
  return readTextFile(configFileName, {
    dir: BaseDirectory.AppConfig,
  });
}

type DataToSave = {
  tasks: Task[];
  userName: string;
};

export async function saveData(data: DataToSave, filePath: string) {
  const jsonContent = JSON.stringify(data);
  const { writeTextFile } = await import("@tauri-apps/api/fs");
  await writeTextFile(filePath, jsonContent);
}

async function load(filePath: string): Promise<DataToSave> {
  const { readTextFile } = await import("@tauri-apps/api/fs");
  const jsonContent = await readTextFile(filePath);
  const { tasks, userName }: DataToSave = JSON.parse(jsonContent);

  // 各タスクの日時関連フィールドをmomentオブジェクトに変換
  tasks.forEach((task) => {
    if (task.startTime) {
      task.startTime = moment(task.startTime);
    }
    if (task.endTime) {
      task.endTime = moment(task.endTime);
    }
  });

  return { tasks, userName };
}

export async function loadData(
  newFilePath: string | null,
  setFilePath: Dispatch<SetStateAction<string>>,
  setTasks: Dispatch<SetStateAction<Task[]>>,
  setAssignees: Dispatch<SetStateAction<Set<string>>>,
  setUserName: Dispatch<SetStateAction<string>>
) {
  if (newFilePath === null) {
    return;
  }
  setFilePath(newFilePath);
  load(newFilePath).then((data) => {
    setTasks(data.tasks);
    setAssignees(extractAssignees(data.tasks).add(data.userName));
    setUserName(data.userName);
  });
}
