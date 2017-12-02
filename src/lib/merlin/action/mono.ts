import * as merlin from "..";
import { Poly } from "./poly";

export class Mono<I extends merlin.Command, R> extends Poly<I, R, R> {
  public transform(response: R): R {
    return response;
  }
}
