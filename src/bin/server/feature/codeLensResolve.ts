import * as LSP from "vscode-languageserver-protocol";
import * as command from "../command";
import Session from "../session";

export default function(session: Session): LSP.RequestHandler<LSP.CodeLens, LSP.CodeLens, void> {
  const go = async (event: LSP.CodeLens, token: LSP.CancellationToken) => {
    const data: LSP.SymbolInformation & {
      event: LSP.TextDocumentPositionParams;
      fileKind: "ml" | "re";
    } =
      event.data;
    const itemType = await command.getType(session, data.event, token, 1);
    if (itemType.length === 0) {
      return event;
    }

    event.command = { command: "", title: itemType[0].type };
    if ("re" === data.fileKind) {
      event.command.title = event.command.title.replace(/ : /g, ": ");
    }

    if (!session.settings.reason.codelens.unicode) {
      return event;
    }
    if ("ml" === data.fileKind) {
      event.command.title = event.command.title.replace(/->/g, "→");
    }
    if ("ml" === data.fileKind) {
      event.command.title = event.command.title.replace(/\*/g, "×");
    }
    if ("re" === data.fileKind) {
      event.command.title = event.command.title.replace(/=>/g, "⇒");
    }

    return event;
  };
  return (event, token) =>
    Promise.race<LSP.CodeLens>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
