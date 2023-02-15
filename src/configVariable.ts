import { CompletionItem, Uri } from 'vscode';

export interface ConfigVariable extends CompletionItem {
  language: string;
  filePattern?: string;
  fileSearch?: 'traversal' | 'find' | 'workspace';
  contentProvider: string;
  path: string;
  uri?: Uri;
}
