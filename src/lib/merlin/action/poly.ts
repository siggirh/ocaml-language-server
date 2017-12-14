import * as LSP from "vscode-languageserver-protocol";
import * as merlin from "..";

export enum IterationStatus {
  DONE,
  MORE,
}

export abstract class Poly<I extends merlin.Command, R, S> {
  constructor(
    query: I,
    public readonly bundle: merlin.Bundle,
    public readonly request = merlin.Request.serialize(query, bundle.textDocument),
  ) {}

  public abstract transform(response: R): S;

  public refine(_payload: R, _iteration: number): IterationStatus {
    return IterationStatus.DONE;
  }

  public schedule(): Promise<S> {
    return new Promise(resolve => this.bundle.merlin.queue.push(this.delay(resolve), this.bundle.priority));
  }

  protected delay(resolve: (value: S) => void): () => void {
    return () => this.iterate(resolve, 0);
  }

  protected handle(answer: string, iteration: number): R {
    const response: merlin.Response<R> = JSON.parse(answer);
    switch (response.class) {
      case "error":
        return this.handleError(response, iteration);
      case "exception":
        return this.handleException(response, iteration);
      case "failure":
        return this.handleFailure(response, iteration);
      case "return":
        return this.handleReturn(response, iteration);
    }
  }

  protected handleError(response: merlin.IResponseError, iteration: number): never {
    this.processNotifications(response.notifications, iteration);
    this.bundle.connection.console.error(`merlin::error: ${response.value}`);
    throw new LSP.ResponseError(LSP.ErrorCodes.InternalError, "merlin::error", response);
  }

  protected handleException(response: merlin.IResponseException, iteration: number): never {
    this.processNotifications(response.notifications, iteration);
    this.bundle.connection.console.error(`merlin::exception: ${response.value}`);
    throw new LSP.ResponseError(LSP.ErrorCodes.InternalError, "merlin::exception", response);
  }

  protected handleFailure(response: merlin.IResponseFailure, iteration: number): never {
    this.processNotifications(response.notifications, iteration);
    this.bundle.connection.console.error(`merlin::failure: ${response.value}`);
    throw new LSP.ResponseError(LSP.ErrorCodes.InternalError, "merlin::failure", response);
  }

  protected handleReturn(response: merlin.IResponseReturn<R>, iteration: number): R {
    this.processNotifications(response.notifications, iteration);
    return response.value;
  }

  protected iterate(resolve: (value: S) => void, iteration: number): void {
    if (!this.bundle.token || !this.bundle.token.isCancellationRequested) {
    this.bundle.merlin.readline.question(this.request, answer => {
      try {
        const payload = this.handle(answer, iteration);
        switch (this.refine(payload, iteration)) {
          case IterationStatus.DONE:
            return resolve(this.transform(payload));
          case IterationStatus.MORE:
            return this.iterate(resolve, iteration++);
        }
      } catch (err) {
        //
      }
    });
    }
  }

  protected processNotifications(notifications: merlin.INotification[], _iteration: number): void {
    for (const notice of notifications) {
      this.bundle.connection.console.info(JSON.stringify(notice));
    }
  }
}
