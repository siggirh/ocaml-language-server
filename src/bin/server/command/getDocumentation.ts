import { CancellationToken, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";

export default async (
  session: Session,
  token: CancellationToken,
  event: TextDocumentPositionParams,
  priority: number = 0,
): Promise<string> => {
  const merlinPosition = merlin.Position.fromCode(event.position);
  return session.merlin
    .command(token, event.textDocument, priority)
    .document(null)
    .at(merlinPosition);
};
