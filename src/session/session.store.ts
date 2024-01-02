import * as crypto from "crypto";
import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { Session } from "./session";

export class SessionStore {
  static instance: SessionStore | undefined;

  static getInstance(): SessionStore {
    if (SessionStore.instance === undefined) {
      SessionStore.instance = new SessionStore();
    }

    return SessionStore.instance;
  }

  async createNew(): Promise<UUID | null> {
    const session: UUID = crypto.randomUUID();

    const query = {
      text: `
           INSERT INTO loggaroo.session (session_id, last_refresh) 
                VALUES ($1, NOW())
            `,
      values: [session],
    };

    try {
      await DatabaseService.getInstance().getClient().query(query);

      return session;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async delete(session: UUID): Promise<boolean> {
    const query = {
      text: `
             DELETE FROM loggaroo.session
                WHERE session_id = $1
            `,
      values: [session],
    };

    try {
      const result = await DatabaseService.getInstance()
        .getClient()
        .query<Session>(query);

      return result.rowCount === 1;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async get(session: UUID): Promise<Session | null> {
    const query = {
      text: `
             SELECT session_id, last_refresh FROM loggaroo.session
                WHERE session_id = $1
            `,
      values: [session],
    };

    try {
      const result = await DatabaseService.getInstance()
        .getClient()
        .query<Session>(query);

      return result.rows[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getAll(): Promise<Session[]> {
    const query = `
             SELECT session_id, last_refresh FROM loggaroo.session
            `;

    try {
      const result = await DatabaseService.getInstance()
        .getClient()
        .query<Session>(query);

      return result.rows;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
