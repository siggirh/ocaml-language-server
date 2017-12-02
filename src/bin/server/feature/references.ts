import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.Location[], void> {
  const go = async (event: LSP.TextDocumentPositionParams, token: LSP.CancellationToken) => {
    const occurrences = await command.getOccurrences(session, event, token);
    if (occurrences == null) {
      return [];
    }
    const highlights = occurrences.map(loc => {
      const uri = event.textDocument.uri;
      const range = merlin.Location.intoCode(loc);
      return LSP.Location.create(uri, range);
    });
    return highlights;
  };
  return (event, token) =>
    Promise.race<LSP.Location[]>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
