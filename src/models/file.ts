import { List } from "immutable";
import moment from "moment";
import path from "path";
import { Dispatch, SetStateAction } from "react";
import { extractAssignees } from "./assignee";
import { Task } from "./task";

const defaultPath = "tasks.json";
const archivePath = "archives.json";
const defaultDir = "ShinamonTaskManager";
const configFileName = "config.txt";

export function getTasksJsonFile(dirPath: string): string {
  return path.join(dirPath, defaultPath);
}

export function getArchivesJsonFile(dirPath: string): string {
  return path.join(dirPath, archivePath);
}

async function _selectDirectory(): Promise<string | null> {
  const { save } = await import("@tauri-apps/api/dialog");
  return await save({
    defaultPath: defaultDir,
  });
}

async function _openDirectory(): Promise<string | null> {
  const { open } = await import("@tauri-apps/api/dialog");
  return open({
    defaultPath: defaultDir,
    multiple: false,
    directory: true,
  }) as Promise<string | null>;
}

async function _createDir(dir: string): Promise<string | null> {
  const { createDir } = await import("@tauri-apps/api/fs");
  await createDir(dir);
  return dir;
}

async function ensureDirExists(dir: string) {
  const { readDir, createDir } = await import("@tauri-apps/api/fs");
  try {
    await readDir(dir);
  } catch (error) {
    await createDir(dir, { recursive: true });
  }
}

async function savePath(
  dirPath: Promise<string | null>
): Promise<string | null> {
  try {
    const dp = await dirPath;
    if (dp === null || dp === "") {
      return null;
    }
    const { appConfigDir } = await import("@tauri-apps/api/path");
    const { BaseDirectory, writeTextFile } = await import("@tauri-apps/api/fs");
    await ensureDirExists(await appConfigDir());
    await writeTextFile(configFileName, dp, {
      dir: BaseDirectory.AppConfig,
    });
    return dp;
  } catch (error) {
    return null;
  }
}

export async function createDir(): Promise<string | null> {
  const maybeDir = await _selectDirectory();
  if (maybeDir === null) return null;
  return savePath(_createDir(maybeDir));
}

export async function openDir(): Promise<string | null> {
  return savePath(_openDirectory());
}

export async function loadInitialDir(): Promise<string | null> {
  const { BaseDirectory, readTextFile } = await import("@tauri-apps/api/fs");
  return readTextFile(configFileName, {
    dir: BaseDirectory.AppConfig,
  });
}

type DataToSave = {
  tasks: List<Task>;
  userName: string;
};

export async function saveData(data: DataToSave, filePath: string) {
  const jsonContent = JSON.stringify(data);
  const { writeTextFile } = await import("@tauri-apps/api/fs");
  await writeTextFile(filePath, jsonContent);
}

export async function load(filePath: string): Promise<DataToSave> {
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

  return { tasks: List(tasks), userName };
}

export async function loadData(
  dir: string | null,
  setDirPath: Dispatch<SetStateAction<string>>,
  setHistory: (histories: List<List<Task>>) => void,
  setAssignees: Dispatch<SetStateAction<Set<string>>>,
  setUserName: Dispatch<SetStateAction<string>>
) {
  if (dir === null) {
    return;
  }
  setDirPath(dir);
  const filePath = getTasksJsonFile(dir);
  load(filePath).then((data) => {
    setHistory(List([data.tasks]));
    setAssignees(extractAssignees(data.tasks).add(data.userName));
    setUserName(data.userName);
  });
}
