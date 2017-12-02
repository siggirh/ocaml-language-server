import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.DocumentFormattingParams, LSP.TextEdit[], void> {
  const go = async (event: LSP.DocumentFormattingParams, _token: LSP.CancellationToken) => {
    const result = await command.getTextDocument(session, event.textDocument);
    if (!result) {
      return [];
    }
    const document = LSP.TextDocument.create(
      event.textDocument.uri,
      result.languageId,
      result.version,
      result.getText(),
    );
    let otxt: null | string = null;
    if (document.languageId === "ocaml") {
      otxt = await command.getFormatted.ocpIndent(session, document);
    }
    if (document.languageId === "reason") {
      otxt = await command.getFormatted.refmt(session, document);
    }
    if (otxt == null || otxt === "") {
      return [];
    }
    const edits: LSP.TextEdit[] = [];
    edits.push(
      LSP.TextEdit.replace(
        LSP.Range.create(document.positionAt(0), document.positionAt(result.getText().length)),
        otxt,
      ),
    );
    return edits;
  };
  return (event, token) =>
    Promise.race<LSP.TextEdit[]>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
