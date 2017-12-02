import * as json from "./json";

export interface INotification {
  section: string;
  message: string;
}

export interface IResponseError {
  class: "error";
  value: string;
  notifications: INotification[];
}

export interface IResponseException {
  class: "exception";
  value: json.Value;
  notifications: INotification[];
}

export interface IResponseFailure {
  class: "failure";
  value: string;
  notifications: INotification[];
}

export interface IResponseReturn<O> {
  class: "return";
  value: O;
  notifications: INotification[];
}

export type Response<O> = IResponseError | IResponseException | IResponseFailure | IResponseReturn<O>;
