import { kafka } from "../kafka";
import { LogPayload } from "./types/log";

const producer = kafka.producer();

let isConnected = false;

async function connectProducer() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;

    console.log("Kafka Producer Connected");
  }
}

export async function sendLog(log: LogPayload) {
  await connectProducer();

  const payload = {
    ...log,
    timestamp: new Date().toISOString(),
  };

  await producer.send({
    topic: "log",
    messages: [
      {
        value: JSON.stringify(payload),
      },
    ],
  });
}