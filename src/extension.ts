import * as vscode from 'vscode';
import { CompletionItemProvider } from './completionItemProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(...[new CompletionItemProvider()]);
}
