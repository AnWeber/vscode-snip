import * as vscode from 'vscode';
import { ConfigVariable } from './configVariable';
import * as provider from './provider';

export class CompletionItemProvider implements vscode.CompletionItemProvider<ConfigVariable> {
  subscriptions: Array<{ dispose: () => void }>;

  private providers: Record<string, provider.Provider> = {
    dotenv: provider.dotenvProvider,
    env: provider.envProvider,
    json: provider.jsonProvider,
    yaml: provider.yamlProvider
  };

  constructor() {
    this.subscriptions = [
      vscode.languages.registerCompletionItemProvider({ language: 'typescript', scheme: '*' }, this),
    ];
  }
  public provideCompletionItems(document: vscode.TextDocument): Array<ConfigVariable> {
    return this.getVariables().map(obj => ({
      ...obj,
      uri: document.uri,
    }));
  }

  public async resolveCompletionItem(item: ConfigVariable, token: vscode.CancellationToken) {
    const provider = this.providers[item.contentProvider];
    if (provider) {
      const value = await provider(item, token);
      if (value) {
        item.insertText = this.evaluatePath(value, item.path);
      }
    }
    return item;
  }

  private evaluatePath(obj: unknown, path?: string) {
    if (obj === undefined) {
      return '';
    }
    if (path) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentObj: any = obj;
      const pathSegments = path.split('.');
      let segment: string | undefined;
      while (currentObj && (segment = pathSegments.pop())) {
        if (typeof currentObj === 'object') {
          currentObj = currentObj[segment];
        }
      }
      return currentObj;
    }
    return `${obj}`;
  }

  dispose(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(obj => obj.dispose());
      this.subscriptions = [];
    }
  }

  private getVariables() {
    return vscode.workspace.getConfiguration('snip').get('variables') as Array<ConfigVariable>;
  }
}
