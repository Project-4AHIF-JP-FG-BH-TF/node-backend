export class LogEntryService {
    static instance: LogEntryService | undefined;

    static getInstance(): LogEntryService {
        if (LogEntryService.instance === undefined) {
            LogEntryService.instance = new LogEntryService();
        }

        return LogEntryService.instance;
    }
}