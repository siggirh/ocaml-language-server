import { Glob } from "glob";
import * as LSP from "vscode-languageserver-protocol";
import { default as Session, Environment } from "../session";

export default async function(
  session: Session,
  token: LSP.CancellationToken | null,
  textDocument: LSP.TextDocumentIdentifier,
  priority: number = 0,
): Promise<LSP.TextDocumentIdentifier[]> {
  const paths = await session.merlin.command(token, textDocument, priority).path.list.source();
  const srcDirs: Set<string> = new Set();
  const srcMods: LSP.TextDocumentIdentifier[] = [];
  for (const cwd of paths) {
    if (cwd && !(/\.opam\b/.test(cwd) || srcDirs.has(cwd))) {
      srcDirs.add(cwd);
      const cwdMods = new Glob("*.@(ml|re)?(i)", {
        cwd,
        realpath: true,
        sync: true,
      }).found;
      for (const path of cwdMods) {
        srcMods.push(Environment.pathToUri(path));
      }
    }
  }
  return srcMods;
}
