import { UUID } from "node:crypto";
import { FilesStore } from "./files.store";
import { RequestError } from "./files";

export class FilesService {
  static instance: FilesService | undefined;

  static getInstance(): FilesService {
    if (FilesService.instance === undefined) {
      FilesService.instance = new FilesService();
    }

    return FilesService.instance;
  }

  async get(sessionID: UUID): Promise<String[] | RequestError> {
    try {
      return await FilesStore.getInstance().get(sessionID);
    } catch (e) {
      return RequestError.wrongBodyData;
    }
  }
}
