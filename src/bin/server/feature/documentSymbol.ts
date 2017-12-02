import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.DocumentSymbolParams, LSP.SymbolInformation[], void> {
  const go = async (event: LSP.DocumentSymbolParams, token: LSP.CancellationToken) => {
    const outline = await session.merlin.command(token, event.textDocument, Infinity).outline();
    return merlin.Outline.intoCode(outline, event.textDocument);
  };
  return (event, token) =>
    Promise.race<LSP.SymbolInformation[]>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
