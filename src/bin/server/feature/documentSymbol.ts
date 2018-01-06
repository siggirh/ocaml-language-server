import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import Session from "../session";
import * as support from "../support";

export default function(
  session: Session,
): LSP.RequestHandler<LSP.DocumentSymbolParams, LSP.SymbolInformation[], never> {
  return support.cancellableHandler(session, async (event, token) => {
    const outline = await session.merlin.command(token, event.textDocument, Infinity).outline();
    return merlin.Outline.intoCode(outline, event.textDocument);
  });
}
