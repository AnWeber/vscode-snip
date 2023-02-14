import { CancellationToken } from 'vscode';
import { ConfigVariable } from '../configVariable';

export type Provider = (configVariable: ConfigVariable, token: CancellationToken) => Promise<unknown | undefined>;
