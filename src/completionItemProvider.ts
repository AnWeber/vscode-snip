import * as vscode from 'vscode';
import { ConfigVariable } from './configVariable';
import * as provider from './provider';

export class CompletionItemProvider implements vscode.CompletionItemProvider<ConfigVariable> {
  completionItemsProvider: Array<{ dispose: () => void }>;
  private configChanged: vscode.Disposable;

  private providers: Record<string, provider.Provider> = {
    dotenv: provider.dotenvProvider,
    env: provider.envProvider,
    json: provider.jsonProvider,
    yaml: provider.yamlProvider
  };

  constructor() {
    this.completionItemsProvider = [];
    this.registerCompletionItems();
    this.configChanged = vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("snip")) {
        this.resetCompletionItemsProvider();
        this.registerCompletionItems();
      }
    });
  }
  private registerCompletionItems() {
    const languages = this.getVariables().reduce((prev, { language }) => {
      prev.add(language);
      return prev;
    }, new Set<string>());

    for (const language of languages) {
      const disposable = vscode.languages.registerCompletionItemProvider({ language, scheme: '*' }, this);
      this.completionItemsProvider.push(disposable);
    }
  }

  public provideCompletionItems(document: vscode.TextDocument): Array<ConfigVariable> {

    return this.getVariables()
      .filter(obj => obj.language === document.languageId)
      .map(obj => ({
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
    this.resetCompletionItemsProvider();
    this.configChanged.dispose();
  }

  private resetCompletionItemsProvider() {
    if (this.completionItemsProvider) {
      this.completionItemsProvider.forEach(obj => obj.dispose());
      this.completionItemsProvider = [];
    }
  }

  private getVariables() {
    return vscode.workspace.getConfiguration('snip').get('variables') as Array<ConfigVariable>;
  }
}
