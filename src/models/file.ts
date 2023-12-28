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
import { join } from "@tauri-apps/api/path";

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
    console.log("ok");
    const targetDir = await appConfigDir();
    console.log(targetDir);
    ensureDirExists(targetDir);
    await writeTextFile(configFileName, fp, {
      dir: BaseDirectory.AppConfig,
    });
    console.log("ok");
    return fp;
  } catch (error) {
    console.log(error);
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

export async function saveTasks(tasks: Task[], filePath: string) {
  const jsonContent = JSON.stringify(tasks);
  await writeTextFile(filePath, jsonContent);
}
