import { BaseDirectory } from "@tauri-apps/api/fs";
import { Task } from "./task";
import { writeTextFile, readTextFile, exists } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { appConfigDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";

function selectFilePath(defaultPath: string): Promise<string | null> {
  return save({
    defaultPath,
    filters: [{ name: "JSON", extensions: ["json"] }],
  }).catch(() => null);
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
    await writeTextFile(configFileName, fp, {
      dir: BaseDirectory.AppConfig,
    });
    return fp;
  } catch {
    return null;
  }
}

export function selectThenSaveFilePath(
  defaultPath = "tasks.json"
): Promise<string | null> {
  return saveFilePath(selectFilePath(defaultPath));
}

export async function loadInitialFilePath(): Promise<string | null> {
  try {
    // ファイルを読み込む試み
    const content = await readTextFile(configFileName, {
      dir: BaseDirectory.AppConfig,
    });
    return content; // 成功した場合は内容を返す
  } catch (_) {
    return selectThenSaveFilePath();
  }
}

// async function saveTasks(tasks: Task[], filePath: string) {
//   const jsonContent = JSON.stringify(tasks);
//   await writeTextFile(filePath, jsonContent);
// }
