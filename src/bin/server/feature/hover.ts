import * as LSP from "vscode-languageserver-protocol";
import { parser } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.Hover, void> {
  const go = async (event: LSP.TextDocumentPositionParams, token: LSP.CancellationToken) => {
    const position = { position: event.position, uri: event.textDocument.uri };
    const word = await command.getWordAtPosition(session, position);
    const markedStrings: LSP.MarkedString[] = [];
    const itemTypes = await command.getType(session, event, token);
    const itemDocs = await command.getDocumentation(session, token, event);
    for (const { type: value } of itemTypes) {
      let language = "plaintext";
      if (/\.mli?/.test(event.textDocument.uri)) {
        language = "ocaml.hover.type";
      }
      if (/\.rei?/.test(event.textDocument.uri)) {
        language = /^[A-Z]/.test(word) ? "reason.hover.signature" : "reason.hover.type";
      }
      markedStrings.push({ language, value });
      if (itemDocs && !parser.ocamldoc.ignore.test(itemDocs)) {
        markedStrings.push(parser.ocamldoc.intoMarkdown(itemDocs));
      }
    }
    return { contents: markedStrings };
  };
  return (event, token) =>
    Promise.race<LSP.Hover>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
