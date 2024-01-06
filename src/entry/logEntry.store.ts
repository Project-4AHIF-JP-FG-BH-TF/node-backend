export class LogEntryStore {
    static instance: LogEntryStore | undefined;

    static getInstance(): LogEntryStore {
        if (LogEntryStore.instance === undefined) {
            LogEntryStore.instance = new LogEntryStore();
        }

        return LogEntryStore.instance;
    }


}