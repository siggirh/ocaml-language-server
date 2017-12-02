import * as server from "vscode-languageserver";
import * as LSP from "vscode-languageserver-protocol";
import * as merlin from ".";

export abstract class Bundle {
  public readonly connection: server.IConnection;
  public readonly merlin: merlin.IMerlinProcess;
  public readonly priority: number;
  public readonly textDocument?: LSP.TextDocumentIdentifier;
  public readonly token: LSP.CancellationToken | null;
}
