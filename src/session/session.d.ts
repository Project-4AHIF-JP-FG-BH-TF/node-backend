import { UUID } from "node:crypto";

export type Session = {
  session_id: UUID;
  last_refresh: Date;
};
