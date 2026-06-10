import { kafka } from "@packages/lib/kafka";
import { LogPayload } from "@packages/lib/utils/types/log";
import { clients } from "./main";


const consumer = kafka.consumer({
    groupId: "logging-service",
});
const logQueue: LogPayload[] = []
const processLogs = () => {
    if (logQueue.length === 0) return;
    const logs = [...logQueue]
    logQueue.length = 0;
    clients.forEach((client: any) => {
        if (client.readyState === 1) {
            logs.forEach(log => {
                client.send(log);
            })
        }
    });
}

setInterval(processLogs, 3000);

export async function startLogConsumer() {
    await consumer.connect();

    await consumer.subscribe({
        topic: "log",
        fromBeginning: false,
    });

    await consumer.run({
        eachMessage: async ({ message }: any) => {
            if (!message.value) return;

            const log = message.value.toString();
            logQueue.push(log);
        },
    });
}

startLogConsumer().catch(console.error);