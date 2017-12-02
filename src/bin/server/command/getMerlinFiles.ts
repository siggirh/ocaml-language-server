import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default async function(
  session: Session,
  token: LSP.CancellationToken | null,
  event: LSP.TextDocumentIdentifier,
  priority: number = 0,
): Promise<string[]> {
  return (await session.merlin.command(token, event, priority).project.get()).result;
}
