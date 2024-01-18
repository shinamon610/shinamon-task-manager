import moment from "moment";
import { Task } from "./task";

// fileを選択した瞬間にそこにtasks.jsonが作成される
function createFile(defaultPath: string): Promise<string | null> {
  return import("@tauri-apps/api/dialog")
    .then(({ save }) =>
      save({
        defaultPath,
        filters: [{ name: "JSON", extensions: ["json"] }],
      })
    )
    .catch(() => null);
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

export function createThenSaveFilePath(
  defaultPath = "tasks.json"
): Promise<string | null> {
  return saveFilePath(createFile(defaultPath));
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

export async function loadData(filePath: string): Promise<DataToSave> {
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
