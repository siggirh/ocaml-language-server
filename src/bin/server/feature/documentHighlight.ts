import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.DocumentHighlight[], void> {
  const go = async (event: LSP.TextDocumentPositionParams, token: LSP.CancellationToken) => {
    const occurrences = await command.getOccurrences(session, event, token);
    if (occurrences == null) return [];
    const highlights = occurrences.map(loc => {
      const range = merlin.Location.intoCode(loc);
      const kind = LSP.DocumentHighlightKind.Write;
      return LSP.DocumentHighlight.create(range, kind);
    });
    return highlights;
  };
  return (event, token) =>
    Promise.race<LSP.DocumentHighlight[]>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
