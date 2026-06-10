import { kafka } from '@packages/lib/kafka';

const producer = kafka.producer();
let isConnected = false;

export const connectProducer = async () => {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log('✅ Kafka producer connected');
  }
};

export const sendToKafka = async (message: any) => {
  await connectProducer();

  await producer.send({
    topic: 'messages',
    messages: [{ value: JSON.stringify(message) }],
  });
};
