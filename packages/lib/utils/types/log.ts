export type LogType = 'info' | 'error' | 'warning' | 'debug' | 'success';

export type LogPayload = {
    type: LogType;
    message: string;
    source: string;
};
export type LogResponse = LogPayload & {
    timestamp: string;
}
