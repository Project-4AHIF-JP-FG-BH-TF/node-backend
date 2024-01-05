import { UUID } from "node:crypto";
import { clearInterval } from "node:timers";
import { SessionStore } from "./session.store";

export class SessionService {
  static instance: SessionService | undefined;

  static getInstance(): SessionService {
    if (SessionService.instance === undefined) {
      SessionService.instance = new SessionService();
    }

    return SessionService.instance;
  }

  constructor() {
    // make sure all session are watched after server restart
    SessionStore.getInstance()
      .getAll()
      .then((sessions) => {
        for (const session of sessions) {
          this.watchSession(session.session_id);
        }
      });
  }

  async createNew(): Promise<UUID | null> {
    const session = await SessionStore.getInstance().createNew();

    if (session) {
      this.watchSession(session);
    }

    return session;
  }

  // frequently checks if a session's-ttl is over and closes the session
  private watchSession(sessionID: UUID) {
    const interval = setInterval(async () => {
      const session = await SessionStore.getInstance().get(sessionID);

      if (session == null) {
        clearInterval(interval);
        return;
      }

      const elapsed = Date.now() - session.last_refresh.getTime();

      if (elapsed > parseInt(process.env.SESSION_TTL!)) {
        await this.delete(sessionID);
        clearInterval(interval);

        console.log(`session ${sessionID} got closed`);
      }
      // 10 seconds
    }, 10_000);
  }

  async delete(session: UUID) {
    await SessionStore.getInstance().delete(session);
  }
}
