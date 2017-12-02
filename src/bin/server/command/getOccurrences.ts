import { CancellationToken, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import { ILocation } from "../../../lib/merlin/ordinal";
import Session from "../session";

export default async (
  session: Session,
  event: TextDocumentPositionParams,
  token: CancellationToken,
  priority: number = 0,
): Promise<ILocation[]> => {
  const colLine = merlin.Position.fromCode(event.position);
  return session.merlin.command(token, event.textDocument, priority).occurrences.ident.at(colLine);
};
