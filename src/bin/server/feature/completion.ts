import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.CompletionItem[], void> {
  const go = async (event: LSP.TextDocumentPositionParams, token: LSP.CancellationToken) => {
    let prefix: null | string = null;
    try {
      prefix = await command.getPrefix(session, event);
    } catch (err) {
      // ignore errors from completing ' .'
    }
    if (prefix == null) {
      return [];
    }
    const colLine = merlin.Position.fromCode(event.position);
    const entries =
      (await session.merlin
        .command(token, event.textDocument, Infinity)
        .complete.prefix(prefix)
        .at(colLine)
        .with.doc()).entries || [];
    return entries.map(merlin.Completion.intoCode);
  };
  return (event, token) =>
    Promise.race<LSP.CompletionItem[]>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
