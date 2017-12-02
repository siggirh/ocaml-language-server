import * as LSP from "vscode-languageserver-protocol";
import Session from "../session";

export default async function(session: Session, event: LSP.Location): Promise<null | string> {
  const document = session.synchronizer.getTextDocument(event);
  if (!document) return null;
  return document.getText();
}
