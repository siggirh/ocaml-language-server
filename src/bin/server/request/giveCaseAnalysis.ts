import * as LSP from "vscode-languageserver-protocol";
import { merlin, types } from "../../../lib";
import Session from "../session";

export default function(
  session: Session,
): LSP.RequestHandler<types.ITextDocumentRange, null | merlin.Case.Destruct, void> {
  return async (event, token) => {
    const start = merlin.Position.fromCode(event.range.start);
    const end = merlin.Position.fromCode(event.range.end);
    const analysis = await session.merlin
      .command(token, event.textDocument)
      .case.analysis.from(start)
      .to(end);
    if (token.isCancellationRequested) return null;
    return analysis;
  };
}
