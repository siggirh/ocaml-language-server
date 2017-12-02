import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default function(_: Session): LSP.RequestHandler<LSP.CodeActionParams, LSP.Command[], void> {
  const go = async (event: LSP.CodeActionParams, _token: LSP.CancellationToken) => {
    const actions: LSP.Command[] = [];
    let matches: null | RegExpMatchArray = null;
    for (const { message, range } of event.context.diagnostics) {
      if (message === "Functions must be defined with => instead of the = symbol.") {
        const title = "change = to =>";
        const command = "reason.codeAction.fixEqualsShouldBeArrow";
        const location = LSP.Location.create(event.textDocument.uri, range);
        const args = [location];
        const action = LSP.Command.create(title, command, args);
        actions.push(action);
        continue;
      }
      if (message === "Statements must be terminated with a semicolon.") {
        const title = "insert missing semicolon";
        const command = "reason.codeAction.fixMissingSemicolon";
        const location = LSP.Location.create(event.textDocument.uri, range);
        const args = [location];
        const action = LSP.Command.create(title, command, args);
        actions.push(action);
        continue;
      }
      if ((matches = message.match(/Warning (?:26|27): unused variable\s+\b(\w+)\b/))) {
        const title = "ignore unused variable";
        const command = "reason.codeAction.fixUnusedVariable";
        const location = LSP.Location.create(event.textDocument.uri, range);
        const args = [location, matches[1]];
        const action = LSP.Command.create(title, command, args);
        actions.push(action);
        continue;
      }
    }
    return actions;
  };
  return (event, token) =>
    Promise.race<LSP.Command[]>([
      new Promise((_resolve, reject) => token.onCancellationRequested(reject)),
      go(event, token),
    ]);
}
