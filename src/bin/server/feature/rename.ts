import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.RenameParams, LSP.WorkspaceEdit, void> {
  const go = async (event: LSP.RenameParams, token: LSP.CancellationToken) => {
    const occurrences = await command.getOccurrences(session, event, token);
    if (occurrences == null) return { changes: {} };
    const renamings = occurrences.map(loc => LSP.TextEdit.replace(merlin.Location.intoCode(loc), event.newName));
    // FIXME: versioning
    const documentChanges = [
      LSP.TextDocumentEdit.create(LSP.VersionedTextDocumentIdentifier.create(event.textDocument.uri, 0), renamings),
    ];
    const edit: LSP.WorkspaceEdit = { documentChanges };
    return edit;
  };
  return (event, token) =>
    Promise.race<LSP.WorkspaceEdit>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
