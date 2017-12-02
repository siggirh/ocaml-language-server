import * as async from "async";
import * as readline from "readline";
import * as merlin from ".";

export interface IMerlinProcess {
  readonly queue: async.AsyncPriorityQueue<merlin.Thunk>;
  readonly readline: readline.ReadLine;
}
