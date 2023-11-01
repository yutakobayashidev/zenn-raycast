import fs from "fs-extra";
import { getPreferenceValues } from "@raycast/api";
import path from "path";

const { zennFolder } = getPreferenceValues();

export function getWorkingPath(pathFromWorkingDir: string): string {
  // Prevent directory traversal
  if (/\.\./.test(pathFromWorkingDir)) {
    process.exit(1);
  }
  // remove beginning slash
  return path.join(zennFolder, pathFromWorkingDir.replace(/^\//, ""));
}

export function getFileRaw(fullpath: string) {
  try {
    const raw = fs.readFileSync(fullpath, "utf8");
    return raw;
  } catch (err) {
    return null;
  }
}

export function listFilenames(searchDirFullpath: string) {
  try {
    const allFiles = fs.readdirSync(searchDirFullpath);
    return allFiles;
  } catch (e) {
    return null;
  }
}

const acceptImageTypes = [
  {
    ext: ".png",
    type: "image/png",
  },
  {
    ext: ".jpg",
    type: "image/jpeg",
  },
  {
    ext: ".jpeg",
    type: "image/jpeg",
  },
  {
    ext: ".webp",
    type: "image/webp",
  },
  {
    ext: ".gif",
    type: "image/gif",
  },
] as const;

export const acceptImageExtensions = acceptImageTypes.map(({ ext }) => ext);

export function listDirnames(searchDirFullpath: string) {
  try {
    const allFiles = fs.readdirSync(searchDirFullpath, {
      withFileTypes: true,
    });
    return allFiles.filter((file) => file.isDirectory()).map(({ name }) => name);
  } catch (e) {
    return null;
  }
}
