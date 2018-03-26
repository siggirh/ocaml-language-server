import * as deepmerge from "deepmerge";
import * as merlin from "./merlin";
import * as remote from "./remote";
import * as types from "./types";

export interface ISettings {
  reason: {
    codelens: {
      enabled: boolean;
      unicode: boolean;
    };
    debounce: {
      linter: number;
    };
    diagnostics: {
      merlinPerfLogging: boolean;
      tools: Array<"merlin" | "bsb" | "esy">;
    };
    path: {
      bsb: string;
      env: string;
      esy: string;
      ocamlfind: string;
      ocamlmerlin: string;
      opam: string;
      rebuild: string;
      refmt: string;
      refmterr: string;
      rtop: string;
    };
    format: {
      width: number | null;
    };
    server: {
      languages: Array<"ocaml" | "reason">;
    };
  };
}
export namespace ISettings {
  export const defaults: ISettings = {
    reason: {
      codelens: {
        enabled: true,
        unicode: true,
      },
      debounce: {
        linter: 500,
      },
      diagnostics: {
        merlinPerfLogging: false,
        tools: ["merlin"],
      },
      format: {
        width: null,
      },
      path: {
        bsb: "bsb",
        env: "env",
        esy: "esy",
        ocamlfind: "ocamlfind",
        ocamlmerlin: "ocamlmerlin",
        opam: "opam",
        rebuild: "rebuild",
        refmt: "refmt",
        refmterr: "refmterr",
        rtop: "rtop",
      },
      server: {
        languages: ["ocaml", "reason"],
      },
    },
  };

  export function withDefaults(overrides: ISettings | undefined | null): ISettings {
    return deepmerge(defaults, { reason: overrides ? overrides.reason || overrides : {} });
  }
}

export { merlin, remote, types };
