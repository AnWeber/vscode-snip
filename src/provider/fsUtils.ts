import * as vscode from 'vscode';
import { ConfigVariable } from '../configVariable';

export async function getFile(options: ConfigVariable, token: vscode.CancellationToken) {
  if (options.filePattern && options.fileSearch && options.uri) {
    const fileProvider = fileProviders[options.fileSearch];
    return await fileProvider(dirname(options.uri), options.filePattern, token);
  }
  return undefined;
}

const fileProviders = {
  traversal: findRootDir,
  find: findRootDir,
  workspace: findInWorkpace,
};

async function findRootDir(currentDir: vscode.Uri, pattern: string): Promise<vscode.Uri | undefined> {
  const dir = await iterateDirectoryTree(currentDir, async (dir: vscode.Uri) => {
    const dirFiles = await vscode.workspace.fs.readDirectory(dir);
    return dirFiles.filter(([, type]) => type === vscode.FileType.File).some(([file]) => file === pattern);
  });
  if (dir) {
    return vscode.Uri.joinPath(dir, pattern);
  }
  return undefined;
}

export async function findInWorkpace(
  currentDir: vscode.Uri,
  pattern: string,
  token: vscode.CancellationToken
): Promise<vscode.Uri | undefined> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentDir);
  if (workspaceFolder) {
    return findFiles(workspaceFolder, pattern, token);
  }
  return undefined;
}

export async function findFiles(
  currentDir: vscode.Uri | vscode.WorkspaceFolder,
  pattern: string,
  token: vscode.CancellationToken
): Promise<vscode.Uri | undefined> {
  return (await vscode.workspace.findFiles(new vscode.RelativePattern(currentDir, pattern), undefined, 1, token)).pop();
}

export async function iterateDirectoryTree(
  currentDir: vscode.Uri,
  predicate: (dir: vscode.Uri) => Promise<boolean>
): Promise<vscode.Uri | undefined> {
  if (currentDir) {
    if (await predicate(currentDir)) {
      return currentDir;
    }

    const dir = dirname(currentDir);
    if (!equalsPath(dir, currentDir)) {
      return iterateDirectoryTree(dir, predicate);
    }
  }
  return undefined;
}

export function equalsPath(path: vscode.Uri | undefined, path2: vscode.Uri | undefined): boolean {
  return !!path && !!path2 && path.toString() === path2.toString();
}

export function dirname(uri: vscode.Uri) {
  return vscode.Uri.joinPath(uri, '..');
}
