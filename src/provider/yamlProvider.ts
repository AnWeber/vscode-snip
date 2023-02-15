import { CancellationToken, Uri } from 'vscode';
import { ConfigVariable } from '../configVariable';
import { getFile, readText } from './fsUtils';
import {parse } from "yaml";

export async function yamlProvider(configVariable: ConfigVariable, token: CancellationToken) {
  const file = await getFile(configVariable, token);
  if (file) {
    return await parseYaml<Record<string, string>>(file);
  }
  return undefined;
}

async function parseYaml<T>(fileName: Uri): Promise<T | undefined> {
  try {
    const text = await readText(fileName);
    return parse(text);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
