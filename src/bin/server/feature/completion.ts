import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";
import * as support from "../support";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.CompletionItem[], void> {
  return support.cancellableHandler(async (event, token) => {
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
  });
}
