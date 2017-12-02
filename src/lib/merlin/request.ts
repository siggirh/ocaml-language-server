import * as LSP from "vscode-languageserver-protocol";
import URI from "vscode-uri";
import * as merlin from ".";

export class Request {
  public static contextualize<I extends merlin.Command>(
    query: I,
    document?: LSP.TextDocumentIdentifier,
  ): merlin.ContextualCommand {
    const context: merlin.Context | undefined = document ? ["auto", URI.parse(document.uri).fsPath] : undefined;
    return context ? { context, query } : query;
  }
  public static serialize<I extends merlin.Command>(query: I, document?: LSP.TextDocumentIdentifier): string {
    return JSON.stringify(Request.contextualize(query, document));
  }
}
