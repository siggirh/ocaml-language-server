import * as LSP from "vscode-languageserver-protocol";

export type AsyncRequestHandler<P, R> = (event: P, token: LSP.CancellationToken) => Thenable<R>;

export function cancellableHandler<P, R>(worker: AsyncRequestHandler<P, R>): LSP.RequestHandler<P, R, void> {
  return (event, token) =>
    Promise.race<R>([new Promise((_resolve, reject) => token.onCancellationRequested(reject)), worker(event, token)]);
}
