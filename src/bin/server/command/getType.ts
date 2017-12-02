import { CancellationToken, TextDocumentPositionParams } from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import { Position } from "../../../lib/merlin/ordinal";
import Session from "../session";

export default async (
  session: Session,
  event: TextDocumentPositionParams,
  token: CancellationToken,
  priority: number = 0,
): Promise<
  Array<{
    end: Position;
    start: Position;
    tail: merlin.TailPosition;
    type: string;
  }>
> => {
  const colLine = merlin.Position.fromCode(event.position);
  const types = await session.merlin.command(token, event.textDocument, priority).type.enclosing.at(colLine);
  return types.slice(0, 1);
};
