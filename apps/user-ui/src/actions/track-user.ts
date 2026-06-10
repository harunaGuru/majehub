'use server';
import { kafka } from '@/packages/lib/kafka';
import { DeviceInfo } from '@/store';
interface EventData {
  type: string;
  productId?: string;
  shopId?: string;
  userId: string;
  country: string;
  city: string;
  device: DeviceInfo | string;
  timestamp: string;
}
const producer = kafka.producer();
export async function sendKafkaEvent(eventData: EventData) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'user-event',
      messages: [
        {
          value: JSON.stringify({ eventData }),
        },
      ],
    });
  } catch (err) {
  } finally {
    await producer.disconnect();
  }
}
