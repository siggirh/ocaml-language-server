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

  export function withDefaults(overrides: ISettings): ISettings {
    return meld(overrides, defaults);
  }

  function meld<T extends { [prop: string]: any }>(overrides: T, base: T): T {
    const ret = { ...(overrides as any) };
    const keys = new Set(Object.keys(ret));
    for (const key of Object.getOwnPropertyNames(base)) {
      if (!keys.has(key)) {
        ret[key] = base[key];
      } else if (typeof ret[key] === "object" && ret[key] != null && !Array.isArray(ret[key])) {
        ret[key] = meld(ret[key], base[key]);
      }
    }
    return ret;
  }
}

export { merlin, remote, types };
