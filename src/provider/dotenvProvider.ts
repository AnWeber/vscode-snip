import { CancellationToken, Uri } from 'vscode';
import { ConfigVariable } from '../configVariable';
import { getFile, readText } from './fsUtils';
import {parse , DotenvParseOutput} from "dotenv";

export async function dotenvProvider(configVariable: ConfigVariable, token: CancellationToken) {
  const file = await getFile(configVariable, token);
  if (file) {
    return await parseDotenv<Record<string, string>>(file);
  }
  return undefined;
}

async function parseDotenv<T extends DotenvParseOutput>(fileName: Uri): Promise<T | undefined> {
  try {
    const text = await readText(fileName);
    return parse<T>(text);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
