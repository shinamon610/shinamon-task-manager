import moment from "moment";
import { Task } from "./task";
import {
  BaseDirectory,
  writeTextFile,
  readTextFile,
  readDir,
  createDir,
} from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { appConfigDir } from "@tauri-apps/api/path";

function selectFilePath(defaultPath: string): Promise<string | null> {
  return save({
    defaultPath,
    filters: [{ name: "JSON", extensions: ["json"] }],
  }).catch(() => null);
}

async function ensureDirExists(dir: string) {
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
    const targetDir = await appConfigDir();
    await ensureDirExists(targetDir);
    await writeTextFile(configFileName, fp, {
      dir: BaseDirectory.AppConfig,
    });
    return fp;
  } catch (error) {
    return null;
  }
}

export function selectThenSaveFilePath(
  defaultPath = "tasks.json"
): Promise<string | null> {
  return saveFilePath(selectFilePath(defaultPath));
}

export function loadInitialFilePath(): Promise<string | null> {
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
  await writeTextFile(filePath, jsonContent);
}

export async function loadData(filePath: string): Promise<DataToSave> {
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
