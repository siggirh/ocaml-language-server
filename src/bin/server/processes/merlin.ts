import * as async from "async";
import * as childProcess from "child_process";
import * as readline from "readline";
import * as LSP from "vscode-languageserver-protocol";
import URI from "vscode-uri";
import { merlin } from "../../../lib";
import Session from "../session";

export default class Merlin implements LSP.Disposable, merlin.IMerlinProcess {
  public readonly command: merlin.action.Factory = merlin.action.factory(this, this.session.connection);
  public readonly queue: async.AsyncPriorityQueue<merlin.Thunk>;
  public readonly readline: readline.ReadLine;

  private process: childProcess.ChildProcess;

  constructor(private readonly session: Session) {}

  public dispose(): void {
    this.readline.close();
  }

  public async initialize(): Promise<void> {
    const ocamlmerlin = this.session.settings.reason.path.ocamlmerlin;
    const cwd = this.session.initConf.rootUri || this.session.initConf.rootPath;
    const options = cwd ? { cwd: URI.parse(cwd).fsPath } : {};

    this.process = this.session.environment.spawn(ocamlmerlin, [], options);
    this.process.on("error", (error: Error & { code: string }) => {
      this.session.connection.tracer.log("ocamlmerlin::error", JSON.stringify({ error }));
      this.session.connection.window.showErrorMessage(`ocamlmerlin: ${JSON.stringify(error)}`);
      throw error;
    });
    this.process.on("close", (code, signal) => {
      this.session.connection.tracer.log("ocamlmerlin::close", JSON.stringify({ code, signal }));
    });
    this.process.on("exit", (code, signal) => {
      this.session.connection.tracer.log("ocamlmerlin::exit", JSON.stringify({ code, signal }));
    });
    this.process.on("disconnect", () => {
      this.session.connection.tracer.log(`ocamlmerlin::disconnect`);
    });
    this.process.stderr.on("data", (data: string) => {
      this.session.connection.tracer.log("ocamlmerlin::stderr::data", JSON.stringify({ data }));
      this.session.connection.window.showErrorMessage(`ocamlmerlin: ${data}`);
    });

    (this.readline as readline.ReadLine) = readline.createInterface({
      input: this.process.stdout,
      output: this.process.stdin,
      terminal: false,
    });
    (this.queue as async.AsyncPriorityQueue<merlin.Thunk>) = async.priorityQueue((thunk, done) => {
      thunk();
      done();
    }, 1);

    await this.establishProtocol();
  }

  public async restart(): Promise<void> {
    if (this.queue) {
      this.queue.kill();
      (this.queue as any) = null;
    }
    if (this.readline) {
      this.readline.close();
      (this.readline as any) = null;
    }
    if (this.process) {
      this.process.kill();
      (this.process as any) = null;
    }
    await this.initialize();
  }

  private async establishProtocol(): Promise<void> {
    const protocol = await this.command(null).protocol.version.set(3);
    if (protocol.selected !== 3) {
      const code = LSP.ErrorCodes.InternalError;
      const message = "[merlin] failed to establish protocl v3";
      const data = protocol;
      throw new LSP.ResponseError(code, message, data);
    }
  }

  // private logTelemetry(
  //   dateOfRequest: Date,
  //   task: merlin.Task,
  // ): (response: merlin.Response<merlin.Value>) => merlin.Response<merlin.Value> {
  //   return response => {
  //     if (this.session.settings.reason.diagnostics.merlinPerfLogging) {
  //       const timeSinceCreation = dateOfRequest.getTime() - task.dateOfCreation.getTime();
  //       const timeSinceDispatch = new Date().getTime() - dateOfRequest.getTime();
  //       this.session.connection.telemetry.logEvent(
  //         `(${this.queue.length()}) Task ${JSON.stringify(task.data)} was in the queue for ${
  //           timeSinceCreation
  //         } ms and took ${timeSinceDispatch} ms to process.`,
  //       );
  //     }
  //     return response;
  //   };
  // }

  // private logTrace(): (response: merlin.Response<merlin.Value>) => merlin.Response<merlin.Value> {
  //   return response => {
  //     this.session.connection.tracer.log("merlin::response", JSON.stringify(response));
  //     return response;
  //   };
  // }

  // private readlineDispatcher(): (
  //   task: merlin.Task,
  //   callback: async.ErrorCallback<merlin.Response<merlin.Value>>,
  // ) => void {
  //   return (task, callback) => {
  //     if (task.token && task.token.isCancellationRequested) {
  //       return callback({
  //         class: "canceled",
  //         notifications: [],
  //         value: "Request has been canceled.",
  //       });
  //     }
  //     const request = JSON.stringify(task.data);
  //     const dateOfRequest = new Date();
  //     this.readline.question(request, this.readlineHandler(dateOfRequest, task, callback));
  //   };
  // }

  // private readlineHandler(
  //   dateOfRequest: Date,
  //   task: merlin.Task,
  //   callback: async.ErrorCallback<merlin.Response<merlin.Value>>,
  // ): (data: string) => void {
  //   return lodash.flow(JSON.parse, this.logTelemetry(dateOfRequest, task), this.logTrace(), callback);
  // }
}
