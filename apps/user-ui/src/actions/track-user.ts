"use server"
import { kafka } from '@/packages/lib/kafka';
interface EventData {
  type: string;
  productId: string;
  shopId: string;
  userId: string;
  country: string;
  city: string;
  device: string;
  timestamp: string;
}
const producer = kafka.producer();
export async function sendKafkaEvent(eventData:EventData){
  console.log(`Sending ${eventData.productId} to ${eventData.productId}`);
  try {
    await producer.connect();
    console.log("event data", eventData);
    const sendResult = await producer.send({
      topic: 'user-event',
      messages: [
        {
          value: JSON.stringify({ eventData }),
        },
      ],
    });
    console.log('✅ [PRODUCER] Send result:', sendResult);
  }catch(err){
    console.log(err)
  }finally{
    await  producer.disconnect();
  }
}