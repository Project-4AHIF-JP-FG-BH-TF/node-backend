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
  info = "info",
  error = "error",
}

export type LogEntryRequestData = {
  from: number;
  count: number;
  files: string[];

  order: "ASC" | "DESC" | undefined;

  filters: Filters | undefined;
};

export type Filters = {
  date: RangeDate | undefined;
  ip: string | undefined;
  text: string | undefined;
  regex: boolean | undefined;
  classification: Classification | undefined;
};

export type RangeDate = {
  from: Date | undefined;
  to: Date | undefined;
};

export enum LogEntryRequestError {
  wrongBodyData,
  serverError,
}
