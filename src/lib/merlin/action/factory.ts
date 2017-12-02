import * as server from "vscode-languageserver";
import { CancellationToken, TextDocumentIdentifier } from "vscode-languageserver-protocol";
import { Bundle } from "../bundle";
import * as data from "../data";
import * as ordinal from "../ordinal";
import { IMerlinProcess } from "../process";
import { Mono } from "./mono";

export interface IClosure {
  // FIXME: remove this annotation when the new .d.ts emitter is released
  case: {
    analysis: {
      from: (
        start: ordinal.Position,
      ) => {
        to: (end: ordinal.Position) => Promise<data.Case.Destruct>;
      };
    };
  };
  complete: {
    prefix: (
      text: string,
    ) => {
      at: (
        position: ordinal.Position,
      ) => {
        with: {
          doc: () => Promise<{ entries?: data.Completion.IEntry[] }>;
        };
      };
    };
  };
  document: (
    name: string | null,
  ) => {
    at: (position: ordinal.Position) => Promise<string>;
  };
  errors: () => Promise<data.IError[]>;
  locate: (
    name: string | null,
    kind: "ml" | "mli",
  ) => {
    at: (position: ordinal.Position) => Promise<{ file: string; pos: ordinal.IColumnLine }>;
  };
  occurrences: {
    ident: {
      at: (position: ordinal.Position) => Promise<ordinal.ILocation[]>;
    };
  };
  outline: () => Promise<data.Outline>;
  path: {
    list: {
      source: () => Promise<string[]>;
    };
  };
  project: {
    get: () => Promise<{ result: string[] }>;
  };
  protocol: {
    version: {
      get: () => Promise<{ selected: number; latest: number; merlin: string }>;
      set: (version: number) => Promise<{ selected: number; latest: number; merlin: string }>;
    };
  };
  tell: (start: ordinal.Position, end: ordinal.Position, source: string) => Promise<true>;
  type: {
    enclosing: {
      at: (position: ordinal.Position) => Promise<data.IType[]>;
    };
    expression: (
      expression: string,
    ) => {
      at: (position: ordinal.Position) => Promise<string>;
    };
  };
}

export type Factory = (
  token: CancellationToken | null,
  textDocument?: TextDocumentIdentifier,
  priority?: number,
) => IClosure;

export const factory: (merlin: IMerlinProcess, connection: server.IConnection) => Factory = (merlin, connection) => (
  token,
  textDocument?,
  priority = 0,
) => {
  const bundle: Bundle = { connection, merlin, priority, textDocument, token };
  return {
    case: {
      analysis: {
        from: (start: ordinal.Position) => ({
          to: (end: ordinal.Position) =>
            new Mono<["case", "analysis", "from", ordinal.Position, "to", ordinal.Position], data.Case.Destruct>(
              ["case", "analysis", "from", start, "to", end],
              bundle,
            ).schedule(),
        }),
      },
    },
    complete: {
      prefix: (text: string) => ({
        at: (position: ordinal.Position) => ({
          with: {
            doc: () =>
              new Mono<
                ["complete", "prefix", string, "at", ordinal.Position, "with", "doc"],
                { entries?: data.Completion.IEntry[] }
              >(["complete", "prefix", text, "at", position, "with", "doc"], bundle).schedule(),
          },
        }),
      }),
    },
    document: (name: string | null) => ({
      at: (position: ordinal.Position) =>
        new Mono<["document", null | string, "at", ordinal.Position], string>(
          ["document", name, "at", position],
          bundle,
        ).schedule(),
    }),
    errors: () => new Mono<["errors"], data.IError[]>(["errors"], bundle).schedule(),
    locate: (name: string | null, kind: "ml" | "mli") => ({
      at: (position: ordinal.Position) =>
        new Mono<
          ["locate", null | string, ("ml" | "mli"), "at", ordinal.Position],
          { file: string; pos: ordinal.IColumnLine }
        >(["locate", name, kind, "at", position], bundle).schedule(),
    }),
    occurrences: {
      ident: {
        at: (position: ordinal.Position) =>
          new Mono<["occurrences", "ident", "at", ordinal.Position], ordinal.ILocation[]>(
            ["occurrences", "ident", "at", position],
            bundle,
          ).schedule(),
      },
    },
    outline: () => new Mono<["outline"], data.Outline>(["outline"], bundle).schedule(),
    path: {
      list: {
        source: () => new Mono<["path", "list", "source"], string[]>(["path", "list", "source"], bundle).schedule(),
      },
    },
    project: {
      get: () => new Mono<["project", "get"], { result: string[] }>(["project", "get"], bundle).schedule(),
    },
    protocol: {
      version: {
        get: () =>
          new Mono<["protocol", "version"], { selected: number; latest: number; merlin: string }>(
            ["protocol", "version"],
            bundle,
          ).schedule(),
        set: (version: number) =>
          new Mono<["protocol", "version", number], { selected: number; latest: number; merlin: string }>(
            ["protocol", "version", version],
            bundle,
          ).schedule(),
      },
    },
    tell: (start: ordinal.Position, end: ordinal.Position, source: string) =>
      new Mono<["tell", ordinal.Position, ordinal.Position, string], true>(
        ["tell", start, end, source],
        bundle,
      ).schedule(),
    type: {
      enclosing: {
        at: (position: ordinal.Position) =>
          new Mono<["type", "enclosing", "at", ordinal.Position], data.IType[]>(
            ["type", "enclosing", "at", position],
            bundle,
          ).schedule(),
      },
      expression: (expression: string) => ({
        at: (position: ordinal.Position) =>
          new Mono<["type", "expression", string, "at", ordinal.Position], string>(
            ["type", "expression", expression, "at", position],
            bundle,
          ).schedule(),
      }),
    },
  };
};
