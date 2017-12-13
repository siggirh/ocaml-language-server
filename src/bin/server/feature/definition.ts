import * as LSP from "vscode-languageserver-protocol";
import URI from "vscode-uri";
import { merlin } from "../../../lib";
import Session from "../session";
import * as support from "../support";

export default function(session: Session): LSP.RequestHandler<LSP.TextDocumentPositionParams, LSP.Definition, void> {
  return support.cancellableHandler(async (event, token) => {
    const find = async (kind: "ml" | "mli"): Promise<null | LSP.Location> => {
      const colLine = merlin.Position.fromCode(event.position);
      const value = await session.merlin
        .command(token, event.textDocument)
        .locate(null, kind)
        .at(colLine);
      if (value.pos == null) {
        return null;
      }
      const uri = value.file ? URI.file(value.file).toString() : event.textDocument.uri;
      const position = merlin.Position.intoCode(value.pos);
      const range = LSP.Range.create(position, position);
      const location = LSP.Location.create(uri, range);
      return location;
    };
    const locML = await find("ml");
    const locations: LSP.Location[] = [];
    if (locML) {
      locations.push(locML);
    }
    return locations;
  });
}
