import * as merlin from ".";

export type Command =
  // query
  | ["case", "analysis", "from", merlin.Position, "to", merlin.Position]
  | ["complete", "prefix", string, "at", merlin.Position, "with", "doc"]
  | ["document", null | string, "at", merlin.Position]
  | ["dump", "env", "at", merlin.Position]
  | ["enclosing", merlin.Position]
  | ["errors"]
  | ["locate", null | string, ("ml" | "mli"), "at", merlin.Position]
  | ["occurrences", "ident", "at", merlin.Position]
  | ["outline"]
  | ["path", "list", "source"]
  | ["project", "get"]
  | ["type", "expression", string, "at", merlin.Position]
  | ["type", "enclosing", "at", merlin.Position]
  // sync
  | ["protocol", "version"]
  | ["protocol", "version", number]
  | ["tell", merlin.Position, merlin.Position, string];

export type Context = ["auto", string];

export type ContextualCommand = Command | { context: Context; query: Command };
