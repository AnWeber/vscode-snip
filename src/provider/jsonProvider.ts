import { CancellationToken, Uri } from 'vscode';
import { ConfigVariable } from '../configVariable';
import { getFile, readText } from './fsUtils';

export async function jsonProvider(configVariable: ConfigVariable, token: CancellationToken) {
  const file = await getFile(configVariable, token);
  if (file) {
    return await parseJson<Record<string, string>>(file);
  }
  return undefined;
}

async function parseJson<T>(fileName: Uri): Promise<T | undefined> {
  try {
    const text = await readText(fileName);
    return JSON.parse(text);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
