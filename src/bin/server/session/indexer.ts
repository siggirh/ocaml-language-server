import Loki = require("lokijs");
import * as LSP from "vscode-languageserver-protocol";
import { merlin } from "../../../lib";
import * as command from "../command";
import Session from "./index";

export default class Indexer implements LSP.Disposable {
  public populated: boolean = false;
  private readonly db: Loki = new Loki(".vscode.reasonml.loki");
  private readonly symbols: Loki.Collection<LSP.SymbolInformation>;

  constructor(private readonly session: Session) {
    this.symbols = this.db.addCollection<LSP.SymbolInformation>("symbols", {
      indices: ["name"],
    });
  }

  public dispose(): void {
    return;
  }

  public findSymbols(query: LokiQuery<LSP.SymbolInformation>): LSP.SymbolInformation[] {
    let result: LSP.SymbolInformation[] = [];
    try {
      result = this.symbols
        .chain()
        .find(query)
        .simplesort("name")
        .data();
    } catch (err) {
      //
    }
    return result;
  }

  public async indexSymbols(textDocument: LSP.TextDocumentIdentifier): Promise<void | LSP.ResponseError<void>> {
    const outline = await this.session.merlin.command(null, textDocument).outline();
    for (const item of merlin.Outline.intoCode(outline, textDocument)) {
      const prefix = item.containerName ? `${item.containerName}.` : "";
      item.name = `${prefix}${item.name}`;
      item.containerName = this.session.environment.relativize(textDocument);
      this.symbols.insert(item);
    }
  }

  public async initialize(): Promise<void> {
    return;
  }

  public async populate(origin: LSP.TextDocumentIdentifier): Promise<void> {
    if (!this.populated) {
      this.populated = true;
      const modules = await command.getModules(this.session, null, origin);
      for (const textDocumentRef of modules) {
        if (/\.(ml|re)i$/.test(textDocumentRef.uri)) continue;
        const textDocument = await command.getTextDocument(this.session, textDocumentRef);
        if (textDocument) {
          // await this.session.merlin.command(null, )
          await this.session.merlin.command(null, textDocumentRef).tell("start", "end", textDocument.getText());
          await this.refreshSymbols(textDocumentRef);
        }
      }
    }
  }

  public refreshSymbols(id: LSP.TextDocumentIdentifier): Promise<void | LSP.ResponseError<void>> {
    this.removeSymbols(id);
    return this.indexSymbols(id);
  }

  public removeSymbols({ uri }: LSP.TextDocumentIdentifier): void {
    this.symbols
      .chain()
      .where(item => item.location.uri === uri)
      .remove();
  }
}
