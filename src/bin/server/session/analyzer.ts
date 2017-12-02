import * as lodash from "lodash";
import * as LSP from "vscode-languageserver-protocol";
import { merlin, parser } from "../../../lib";
import * as command from "../command";
import * as processes from "../processes";
import Session from "./index";

export default class Analyzer implements LSP.Disposable {
  public readonly refreshImmediate: ((event: LSP.TextDocumentIdentifier) => Promise<void>);
  public readonly refreshDebounced: ((event: LSP.TextDocumentIdentifier) => Promise<void>) & lodash.Cancelable;
  private readonly bsbDiagnostics: { [key: string]: LSP.Diagnostic[] } = {};

  constructor(private readonly session: Session) {}

  public clear({ uri }: LSP.TextDocumentIdentifier): void {
    if (
      this.bsbDiagnostics[uri] &&
      this.bsbDiagnostics[uri][0] &&
      this.bsbDiagnostics[uri][0].source !== "bucklescript"
    ) {
      this.session.connection.sendDiagnostics({
        diagnostics: [],
        uri,
      });
    }
  }

  public dispose(): void {
    return;
  }

  public async initialize(): Promise<void> {
    this.onDidChangeConfiguration();
  }

  public onDidChangeConfiguration(): void {
    (this.refreshImmediate as any) = this.refreshWithKind(LSP.TextDocumentSyncKind.Full);
    (this.refreshDebounced as any) = lodash.debounce(
      this.refreshWithKind(LSP.TextDocumentSyncKind.Incremental),
      this.session.settings.reason.debounce.linter,
      { trailing: true },
    );
  }

  public refreshWithKind(
    syncKind: LSP.TextDocumentSyncKind,
  ): (textDocumentRef: LSP.TextDocumentIdentifier) => Promise<void> {
    return async textDocumentRef => {
      const tools: Set<string> = new Set(this.session.settings.reason.diagnostics.tools);
      if (tools.size < 1) return;

      // Reset state for every run. This currently can hide valid warnings in some cases
      // as they are not cached, but the alternative (trying to keep track of them) will
      // probably be worse. See https://github.com/BuckleScript/bucklescript/issues/2024
      Object.keys(this.bsbDiagnostics).forEach(fileUri => {
        this.bsbDiagnostics[fileUri] = [];
      });
      this.bsbDiagnostics[textDocumentRef.uri] = [];

      if (tools.has("bsb") && syncKind === LSP.TextDocumentSyncKind.Full) {
        this.refreshDebounced.cancel();
        const bsbProcess = new processes.BuckleScript(this.session);
        const bsbOutput = await bsbProcess.run();

        const diagnostics = parser.bucklescript.parseErrors(bsbOutput);
        Object.keys(diagnostics).forEach(fileUri => {
          if (!this.bsbDiagnostics[fileUri]) {
            this.bsbDiagnostics[fileUri] = [];
          }
          this.bsbDiagnostics[fileUri] = this.bsbDiagnostics[fileUri].concat(diagnostics[fileUri]);
        });

        Object.keys(this.bsbDiagnostics).forEach(fileUri => {
          this.session.connection.sendDiagnostics({
            diagnostics: this.bsbDiagnostics[fileUri],
            uri: fileUri,
          });
          if (this.bsbDiagnostics[fileUri].length === 0) {
            delete this.bsbDiagnostics[fileUri];
          }
        });
      } else if (tools.has("merlin")) {
        if (syncKind === LSP.TextDocumentSyncKind.Full) {
          const textDocument = await command.getTextDocument(this.session, textDocumentRef);
          if (textDocument) {
            await this.session.merlin.command(null, textDocumentRef).tell("start", "end", textDocument.getText());
          }
        }
        this.session.cancelTokens("analyzer/refreshWithKind");
        const errors = await this.session.merlin
          .command(this.session.cancellationSources["analyzer/refreshWithKind"].token, textDocumentRef)
          .errors();
        const diagnostics: LSP.Diagnostic[] = [];
        for (const report of errors) {
          if (report.end && report.start) {
            diagnostics.push(await merlin.IError.intoCode(this.session, textDocumentRef, report));
          }
        }
        this.session.connection.sendDiagnostics({ diagnostics, uri: textDocumentRef.uri });
      }
    };
  }
}
