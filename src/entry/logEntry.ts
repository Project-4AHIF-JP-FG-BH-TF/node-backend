import { UUID } from "node:crypto";

export type LogEntry = {
  session_id: UUID;
  file_name: string;
  entry_nr: number;
  creation_date: Date;
  classification: Classification;
  service_ip: string;
  user_id: string;
  user_session_id: string;
  java_class: string;
  content: string;
};

export enum Classification {
  info,
  error,
}

export type LogEntryRequestData = {
  from: number;
  count: number;
  files: string[];
  sortingOrderDESC: boolean | undefined;
};

export enum LogEntryRequestError {
  wrongBodyData,
  serverError,
}
